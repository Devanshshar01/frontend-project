import { useEffect, useRef, useCallback, useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type * as monacoEditor from 'monaco-editor';
import { Spinner } from '../../../shared/components/atoms/Spinner';
import type { FileNode } from '../../../shared/services/filesystem.service';
import { fileSystemService } from '../../../shared/services/filesystem.service';

interface CodeEditorProps {
  currentFile: FileNode | null;
  onCursorChange?: (line: number, column: number) => void;
}

export function CodeEditor({ currentFile, onCursorChange }: CodeEditorProps) {
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const [content, setContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<number | undefined>(undefined);

  // Update content when file changes
  useEffect(() => {
    if (currentFile) {
      setContent(currentFile.content || '');
      setHasUnsavedChanges(false);
    }
  }, [currentFile?.id]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && currentFile) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        fileSystemService.updateFileContent(currentFile.id, content);
        setHasUnsavedChanges(false);
        console.log('Auto-saved:', currentFile.name);
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, hasUnsavedChanges, currentFile]);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Cursor position change
    editor.onDidChangeCursorPosition((e) => {
      onCursorChange?.(e.position.lineNumber, e.position.column);
    });

    // Save shortcut (Ctrl+S / Cmd+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (currentFile) {
        fileSystemService.updateFileContent(currentFile.id, content);
        setHasUnsavedChanges(false);
        console.log('Manually saved:', currentFile.name);
      }
    });
  }, [content, currentFile, onCursorChange]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      setHasUnsavedChanges(true);
    }
  };

  if (!currentFile) {
    return (
      <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-gray-400">
        <div className="text-center">
          <p className="text-lg">No file selected</p>
          <p className="text-sm mt-2">Open a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {hasUnsavedChanges && (
        <div className="absolute top-2 right-2 z-10 px-3 py-1 bg-[#007acc] text-white text-xs rounded shadow-lg">
          Unsaved changes...
        </div>
      )}
      <Editor
        height="100%"
        language={currentFile.language || 'plaintext'}
        value={content}
        theme="vs-dark"
        onMount={handleEditorMount}
        onChange={handleEditorChange}
        loading={<Spinner size="lg" label="Loading editor" />}
        options={{
          fontSize: 14,
          tabSize: 2,
          wordWrap: 'on',
          minimap: { enabled: true },
          lineNumbers: 'on',
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
          padding: { top: 10 },
        }}
      />
    </div>
  );
}
