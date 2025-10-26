import { useEffect, useRef, useCallback } from 'react';
import Editor, { type OnMount, type Monaco } from '@monaco-editor/react';
import type * as monacoEditor from 'monaco-editor';
import { useEditorStore } from '../../../shared/stores/editorStore';
import { useCollaborationStore } from '../../../shared/stores/collaborationStore';
import { useAutoSave } from '../../../shared/hooks/useAutoSave';
import { useThrottle } from '../../../shared/hooks/useThrottle';
import { Spinner } from '../../../shared/components/atoms/Spinner';
import { COLLABORATION_CONFIG } from '../../../shared/config/constants';
import type { CursorPosition } from '../../../shared/types';

/**
 * Monaco-based Code Editor with real-time collaboration
 * Features:
 * - Syntax highlighting for multiple languages
 * - Auto-save with debouncing (3s)
 * - Real-time cursor positions
 * - Collaborative editing with CRDT
 * - Accessibility support
 */

interface CodeEditorProps {
  onContentChange?: (content: string) => void;
  onCursorPositionChange?: (position: CursorPosition) => void;
  onSave?: (content: string) => void | Promise<void>;
  readOnly?: boolean;
}

export function CodeEditor({
  onContentChange,
  onCursorPositionChange,
  onSave,
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const { currentFile, settings, updateFileContent, markAsUnsaved } = useEditorStore();
  const { cursorPositions, participants } = useCollaborationStore();

  // Auto-save functionality
  useAutoSave(
    currentFile?.content || '',
    async (content) => {
      if (onSave && currentFile) {
        await onSave(content);
      }
    },
    settings.autoSaveDelay,
    settings.autoSave
  );

  // Throttled cursor position update
  const throttledCursorUpdate = useThrottle(
    (position: CursorPosition) => {
      onCursorPositionChange?.(position);
    },
    COLLABORATION_CONFIG.CURSOR_UPDATE_THROTTLE
  );

  /**
   * Handle editor mount
   */
  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Set up cursor position change listener
    editor.onDidChangeCursorPosition((e) => {
      const position: CursorPosition = {
        lineNumber: e.position.lineNumber,
        column: e.position.column,
      };
      throttledCursorUpdate(position);
    });

    // Set up content change listener
    editor.onDidChangeModelContent(() => {
      const content = editor.getValue();
      if (currentFile) {
        updateFileContent(currentFile.id, content);
        markAsUnsaved(currentFile.id);
      }
      onContentChange?.(content);
    });

    // Accessibility: Announce editor ready to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = 'Code editor loaded and ready';
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);

    // Set up keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const content = editor.getValue();
      onSave?.(content);
    });
  }, [currentFile, onContentChange, onCursorPositionChange, onSave, throttledCursorUpdate, updateFileContent, markAsUnsaved]);

  /**
   * Update remote cursor decorations
   */
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;

    // Clear previous decorations
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);

    // Create decorations for remote cursors
    const newDecorations: monacoEditor.editor.IModelDeltaDecoration[] = [];

    cursorPositions.forEach((position, userId) => {
      const participant = participants.get(userId);
      if (!participant) return;

      const color = participant.color;

      // Cursor decoration
      newDecorations.push({
        range: new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        ),
        options: {
          className: 'remote-cursor',
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          beforeContentClassName: 'remote-cursor-before',
          glyphMarginClassName: 'remote-cursor-glyph',
          hoverMessage: { value: `${participant.user.name}'s cursor` },
        },
      });

      // Add cursor widget with user name
      const widget: monacoEditor.editor.IContentWidget = {
        getId: () => `cursor-${userId}`,
        getDomNode: () => {
          const node = document.createElement('div');
          node.style.backgroundColor = color;
          node.style.color = 'white';
          node.style.padding = '2px 4px';
          node.style.borderRadius = '3px';
          node.style.fontSize = '12px';
          node.style.position = 'absolute';
          node.style.zIndex = '1000';
          node.textContent = participant.user.name;
          return node;
        },
        getPosition: () => ({
          position: {
            lineNumber: position.lineNumber,
            column: position.column,
          },
          preference: [monaco.editor.ContentWidgetPositionPreference.ABOVE],
        }),
      };

      editor.addContentWidget(widget);
    });

    // Apply decorations
    decorationsRef.current = editor.deltaDecorations([], newDecorations);

    // Cleanup
    return () => {
      if (editorRef.current) {
        editorRef.current.deltaDecorations(decorationsRef.current, []);
      }
    };
  }, [cursorPositions, participants]);

  /**
   * Update editor options when settings change
   */
  useEffect(() => {
    if (!editorRef.current) return;

    editorRef.current.updateOptions({
      fontSize: settings.fontSize,
      tabSize: settings.tabSize,
      wordWrap: settings.wordWrap ? 'on' : 'off',
      minimap: { enabled: settings.minimap },
      lineNumbers: settings.lineNumbers ? 'on' : 'off',
      readOnly,
    });
  }, [settings, readOnly]);

  if (!currentFile) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            No file open. Select or create a file to start editing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full" role="main" aria-label="Code editor">
      <Editor
        height="100%"
        language={currentFile.language}
        value={currentFile.content}
        theme={settings.theme.isDark ? 'vs-dark' : 'light'}
        onMount={handleEditorMount}
        loading={<Spinner size="lg" label="Loading editor" />}
        options={{
          fontSize: settings.fontSize,
          tabSize: settings.tabSize,
          wordWrap: settings.wordWrap ? 'on' : 'off',
          minimap: { enabled: settings.minimap },
          lineNumbers: settings.lineNumbers ? 'on' : 'off',
          readOnly,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
          fontLigatures: true,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          // Accessibility
          accessibilitySupport: 'on',
          ariaLabel: `Code editor for ${currentFile.name}`,
        }}
      />
    </div>
  );
}
