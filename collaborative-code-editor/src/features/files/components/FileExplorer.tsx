import { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  FilePlus,
  FolderPlus,
  Trash2,
  Edit2,
} from 'lucide-react';
import type { FileNode } from '../../../shared/services/filesystem.service';
import { fileSystemService } from '../../../shared/services/filesystem.service';

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  onRefresh: () => void;
  currentFileId: string | null;
}

export function FileExplorer({ files, onFileSelect, onRefresh, currentFileId }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: FileNode;
  } | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming]);

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const handleCreateFile = (parentId: string | null) => {
    const name = prompt('Enter file name:');
    if (name) {
      fileSystemService.createFile(parentId, name);
      if (parentId) {
        setExpandedFolders((prev) => new Set([...prev, parentId]));
      }
      onRefresh();
    }
    setContextMenu(null);
  };

  const handleCreateFolder = (parentId: string | null) => {
    const name = prompt('Enter folder name:');
    if (name) {
      fileSystemService.createFolder(parentId, name);
      if (parentId) {
        setExpandedFolders((prev) => new Set([...prev, parentId]));
      }
      onRefresh();
    }
    setContextMenu(null);
  };

  const handleDelete = (node: FileNode) => {
    if (confirm(`Are you sure you want to delete "${node.name}"?`)) {
      fileSystemService.deleteNode(node.id);
      onRefresh();
    }
    setContextMenu(null);
  };

  const handleRename = (node: FileNode) => {
    setRenaming(node.id);
    setRenamingValue(node.name);
    setContextMenu(null);
  };

  const confirmRename = () => {
    if (renaming && renamingValue.trim()) {
      fileSystemService.renameNode(renaming, renamingValue.trim());
      onRefresh();
    }
    setRenaming(null);
    setRenamingValue('');
  };

  const cancelRename = () => {
    setRenaming(null);
    setRenamingValue('');
  };

  const renderNode = (node: FileNode, level = 0) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = currentFileId === node.id;
    const isRenaming = renaming === node.id;
    const Icon = isFolder ? (isExpanded ? FolderOpen : Folder) : File;

    return (
      <div key={node.id}>
        <div
          className={`
            flex items-center gap-2 px-2 py-1 cursor-pointer group
            ${isSelected ? 'bg-[#37373d]' : 'hover:bg-[#2a2d2e]'}
          `}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.id);
            } else {
              onFileSelect(node);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node)}
        >
          {isFolder && (
            <span className="text-gray-400 flex-shrink-0">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
          <Icon size={14} className={isFolder ? 'text-[#90a4ae]' : 'text-[#ccc]'} />
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={renamingValue}
              onChange={(e) => setRenamingValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmRename();
                if (e.key === 'Escape') cancelRename();
              }}
              onBlur={confirmRename}
              className="flex-1 bg-[#3c3c3c] text-white text-sm px-1 py-0 border border-[#007acc] outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-sm text-gray-300 truncate">{node.name}</span>
          )}
        </div>

        {isFolder && isExpanded && node.children && node.children.length > 0 && (
          <div>
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        className="w-60 bg-[#252526] border-r border-[#1e1e1e] overflow-y-auto flex flex-col"
        role="tree"
        aria-label="File explorer"
      >
        <div className="flex items-center justify-between p-2 border-b border-[#1e1e1e]">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Explorer</h2>
          <div className="flex gap-1">
            <button
              onClick={() => handleCreateFile(null)}
              className="p-1 hover:bg-[#2a2d2e] rounded"
              title="New File"
            >
              <FilePlus size={14} className="text-gray-400" />
            </button>
            <button
              onClick={() => handleCreateFolder(null)}
              className="p-1 hover:bg-[#2a2d2e] rounded"
              title="New Folder"
            >
              <FolderPlus size={14} className="text-gray-400" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {files.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">No files</div>
          ) : (
            files.map((node) => renderNode(node))
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[#3c3c3c] border border-[#454545] rounded shadow-lg py-1 z-50 min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.node.type === 'folder' && (
            <>
              <button
                onClick={() => handleCreateFile(contextMenu.node.id)}
                className="w-full text-left px-4 py-1.5 text-sm text-gray-300 hover:bg-[#2a2d2e] flex items-center gap-2"
              >
                <FilePlus size={14} /> New File
              </button>
              <button
                onClick={() => handleCreateFolder(contextMenu.node.id)}
                className="w-full text-left px-4 py-1.5 text-sm text-gray-300 hover:bg-[#2a2d2e] flex items-center gap-2"
              >
                <FolderPlus size={14} /> New Folder
              </button>
              <div className="border-t border-[#454545] my-1"></div>
            </>
          )}
          <button
            onClick={() => handleRename(contextMenu.node)}
            className="w-full text-left px-4 py-1.5 text-sm text-gray-300 hover:bg-[#2a2d2e] flex items-center gap-2"
          >
            <Edit2 size={14} /> Rename
          </button>
          <button
            onClick={() => handleDelete(contextMenu.node)}
            className="w-full text-left px-4 py-1.5 text-sm text-red-400 hover:bg-[#2a2d2e] flex items-center gap-2"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </>
  );
}
