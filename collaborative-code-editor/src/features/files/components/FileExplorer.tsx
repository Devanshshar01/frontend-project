import { useState } from 'react';
import { File, Folder, ChevronRight, ChevronDown, Plus, MoreVertical } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import type { FileDocument } from '../../../shared/types';
import { useEditorStore } from '../../../shared/stores/editorStore';

/**
 * File Explorer component with tree structure
 * Implements keyboard navigation for accessibility
 */

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  file?: FileDocument;
}

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect?: (file: FileDocument) => void;
  onFileCreate?: () => void;
  onFolderCreate?: () => void;
}

export function FileExplorer({
  files,
  onFileSelect,
  onFileCreate,
  onFolderCreate,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const { currentFile, openFile } = useEditorStore();

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleFileClick = (node: FileNode) => {
    if (node.type === 'file' && node.file) {
      openFile(node.file);
      onFileSelect?.(node.file);
    } else if (node.type === 'folder') {
      toggleFolder(node.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, node: FileNode) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFileClick(node);
    }
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = node.type === 'file' && currentFile?.id === node.id;

    return (
      <div key={node.id} role="treeitem" aria-expanded={node.type === 'folder' ? isExpanded : undefined}>
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-md transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'focus:outline-none focus:ring-2 focus:ring-primary-500',
            isSelected && 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleFileClick(node)}
          onKeyDown={(e) => handleKeyDown(e, node)}
          tabIndex={0}
          aria-selected={isSelected}
        >
          {node.type === 'folder' && (
            <>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              )}
              <Folder className="h-4 w-4 flex-shrink-0 text-yellow-600" aria-hidden="true" />
            </>
          )}
          {node.type === 'file' && (
            <File className="h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-400" aria-hidden="true" />
          )}
          <span className="flex-1 truncate">{node.name}</span>
          <button
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              // Handle more options
            }}
            aria-label={`More options for ${node.name}`}
          >
            <MoreVertical className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>

        {node.type === 'folder' && isExpanded && node.children && (
          <div role="group">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className="h-full w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto"
      aria-label="File explorer"
    >
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Files</h2>
          <div className="flex gap-1">
            <button
              onClick={onFileCreate}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Create new file"
              title="Create new file"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              onClick={onFolderCreate}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Create new folder"
              title="Create new folder"
            >
              <Folder className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <nav className="p-2" role="tree" aria-label="File tree">
        {files.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
            <p>No files yet</p>
            <button
              onClick={onFileCreate}
              className="mt-2 text-primary-600 hover:text-primary-700 focus:outline-none focus:underline"
            >
              Create your first file
            </button>
          </div>
        ) : (
          files.map((node) => renderNode(node))
        )}
      </nav>
    </aside>
  );
}
