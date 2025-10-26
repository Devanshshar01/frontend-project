import { X } from 'lucide-react';
import type { FileNode } from '../../services/filesystem.service';

interface TabBarProps {
  openFiles: FileNode[];
  currentFileId: string | null;
  onTabClick: (file: FileNode) => void;
  onTabClose: (fileId: string, e: React.MouseEvent) => void;
}

export function TabBar({ openFiles, currentFileId, onTabClick, onTabClose }: TabBarProps) {
  if (openFiles.length === 0) {
    return null;
  }

  const getFileIcon = (language?: string) => {
    const icons: Record<string, string> = {
      javascript: '📜',
      typescript: '📘',
      python: '🐍',
      html: '🌐',
      css: '🎨',
      json: '📋',
      markdown: '📝',
      shell: '⚡',
      c: '©️',
      cpp: '➕',
      java: '☕',
      go: '🐹',
      rust: '🦀',
    };
    return icons[language || ''] || '📄';
  };

  return (
    <div className="flex items-center bg-[#252526] border-b border-[#1e1e1e] overflow-x-auto scrollbar-thin">
      {openFiles.map((file) => (
        <div
          key={file.id}
          onClick={() => onTabClick(file)}
          className={`
            group flex items-center gap-2 px-4 py-2 border-r border-[#1e1e1e]
            cursor-pointer select-none whitespace-nowrap min-w-[120px] max-w-[200px]
            ${
              currentFileId === file.id
                ? 'bg-[#1e1e1e] text-white'
                : 'bg-[#2d2d30] text-gray-400 hover:text-white hover:bg-[#2a2a2d]'
            }
          `}
        >
          <span className="text-sm">{getFileIcon(file.language)}</span>
          <span className="text-sm truncate flex-1">{file.name}</span>
          <button
            onClick={(e) => onTabClose(file.id, e)}
            className={`
              p-0.5 rounded hover:bg-[#3e3e42] transition-colors
              ${currentFileId === file.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}
            aria-label={`Close ${file.name}`}
          >
            <X size={14} className="text-gray-400 hover:text-white" />
          </button>
        </div>
      ))}
    </div>
  );
}
