import { useState, useEffect } from 'react';
import { FileExplorer } from './features/files/components/FileExplorer';
import { CodeEditor } from './features/editor/components/CodeEditor';
import { TabBar } from './shared/components/organisms/TabBar';
import { StatusBar } from './shared/components/organisms/StatusBar';
import { fileSystemService, type FileNode } from './shared/services/filesystem.service';
import { Menu, X } from 'lucide-react';

function App() {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
  const [currentFile, setCurrentFile] = useState<FileNode | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  // Load file system on mount
  useEffect(() => {
    const files = fileSystemService.getFileTree();
    setFileTree(files);
  }, []);

  // Refresh file tree
  const refreshFileTree = () => {
    const files = fileSystemService.getFileTree();
    setFileTree(files);
  };

  // Handle file selection
  const handleFileSelect = (file: FileNode) => {
    if (file.type === 'file') {
      setCurrentFile(file);
      
      // Add to open files if not already open
      if (!openFiles.find(f => f.id === file.id)) {
        setOpenFiles([...openFiles, file]);
      }
    }
  };

  // Handle tab click
  const handleTabClick = (file: FileNode) => {
    // Get fresh data from file system
    const freshFile = fileSystemService.findNodeById(file.id);
    if (freshFile && freshFile.type === 'file') {
      setCurrentFile(freshFile);
    }
  };

  // Handle tab close
  const handleTabClose = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newOpenFiles = openFiles.filter(f => f.id !== fileId);
    setOpenFiles(newOpenFiles);

    // If closing current file, switch to last open file
    if (currentFile?.id === fileId) {
      setCurrentFile(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
    }
  };

  // Handle cursor change
  const handleCursorChange = (line: number, column: number) => {
    setCursorPosition({ line, column });
  };

  // Get total lines in current file
  const getTotalLines = () => {
    if (!currentFile?.content) return 0;
    return currentFile.content.split('\n').length;
  };

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-white overflow-hidden">
      {/* Top Header */}
      <div className="h-9 bg-[#323233] flex items-center px-2 gap-2 border-b border-[#1e1e1e]">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 hover:bg-[#2a2d2e] rounded"
          title="Toggle Sidebar"
        >
          {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
        <span className="text-sm font-semibold text-gray-300">VS Code Clone</span>
        {currentFile && (
          <span className="text-xs text-gray-500 ml-2">
            {currentFile.path}
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with File Explorer */}
        {isSidebarOpen && (
          <FileExplorer
            files={fileTree}
            onFileSelect={handleFileSelect}
            onRefresh={refreshFileTree}
            currentFileId={currentFile?.id || null}
          />
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Bar */}
          <TabBar
            openFiles={openFiles}
            currentFileId={currentFile?.id || null}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
          />

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              currentFile={currentFile}
              onCursorChange={handleCursorChange}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        fileName={currentFile?.name}
        language={currentFile?.language}
        lineNumber={cursorPosition.line}
        column={cursorPosition.column}
        totalLines={getTotalLines()}
      />
    </div>
  );
}

export default App;
