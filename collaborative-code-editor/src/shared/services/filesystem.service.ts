import { nanoid } from 'nanoid';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  language?: string;
  children?: FileNode[];
  parentId?: string;
}

const STORAGE_KEY = 'vscode-clone-filesystem';

class FileSystemService {
  private fileTree: FileNode[] = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Initialize with default file structure
   */
  initializeDefault(): FileNode[] {
    this.fileTree = [
      {
        id: nanoid(),
        name: 'src',
        type: 'folder',
        path: '/src',
        children: [
          {
            id: nanoid(),
            name: 'index.html',
            type: 'file',
            path: '/src/index.html',
            language: 'html',
            content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
</head>
<body>
  <h1>Hello World!</h1>
  <script src="script.js"></script>
</body>
</html>`,
          },
          {
            id: nanoid(),
            name: 'script.js',
            type: 'file',
            path: '/src/script.js',
            language: 'javascript',
            content: `// Welcome to VS Code Clone!
console.log('Hello, World!');

function greet(name) {
  return \`Hello, \${name}!\`;
}

document.addEventListener('DOMContentLoaded', () => {
  console.log(greet('Developer'));
});`,
          },
          {
            id: nanoid(),
            name: 'styles.css',
            type: 'file',
            path: '/src/styles.css',
            language: 'css',
            content: `/* Global Styles */
body {
  margin: 0;
  font-family: 'Arial', sans-serif;
  background-color: #1e1e1e;
  color: #d4d4d4;
}

h1 {
  color: #569cd6;
  text-align: center;
  margin-top: 50px;
}`,
          },
        ],
      },
      {
        id: nanoid(),
        name: 'README.md',
        type: 'file',
        path: '/README.md',
        language: 'markdown',
        content: `# VS Code Clone

A fully functional code editor built with React and Monaco Editor.

## Features
- File and folder management
- Syntax highlighting for 10+ languages
- Auto-save functionality
- VS Code-like interface

Start coding now!`,
      },
      {
        id: nanoid(),
        name: 'app.py',
        type: 'file',
        path: '/app.py',
        language: 'python',
        content: `#!/usr/bin/env python3
"""
Sample Python Application
"""

def main():
    print("Hello from Python!")
    name = input("What's your name? ")
    print(f"Nice to meet you, {name}!")

if __name__ == "__main__":
    main()`,
      },
    ];
    this.saveToStorage();
    return this.fileTree;
  }

  /**
   * Get the entire file tree
   */
  getFileTree(): FileNode[] {
    return this.fileTree;
  }

  /**
   * Find a node by ID
   */
  findNodeById(id: string, nodes: FileNode[] = this.fileTree): FileNode | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findNodeById(id, node.children);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Find a node by path
   */
  findNodeByPath(path: string, nodes: FileNode[] = this.fileTree): FileNode | null {
    for (const node of nodes) {
      if (node.path === path) return node;
      if (node.children) {
        const found = this.findNodeByPath(path, node.children);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Create a new file
   */
  createFile(parentId: string | null, name: string): FileNode | null {
    const language = this.detectLanguage(name);
    const newFile: FileNode = {
      id: nanoid(),
      name,
      type: 'file',
      path: parentId ? this.buildPath(parentId, name) : `/${name}`,
      language,
      content: this.getDefaultContent(language),
      parentId: parentId || undefined,
    };

    if (parentId) {
      const parent = this.findNodeById(parentId);
      if (parent && parent.type === 'folder') {
        if (!parent.children) parent.children = [];
        parent.children.push(newFile);
      } else {
        return null;
      }
    } else {
      this.fileTree.push(newFile);
    }

    this.saveToStorage();
    return newFile;
  }

  /**
   * Create a new folder
   */
  createFolder(parentId: string | null, name: string): FileNode | null {
    const newFolder: FileNode = {
      id: nanoid(),
      name,
      type: 'folder',
      path: parentId ? this.buildPath(parentId, name) : `/${name}`,
      children: [],
      parentId: parentId || undefined,
    };

    if (parentId) {
      const parent = this.findNodeById(parentId);
      if (parent && parent.type === 'folder') {
        if (!parent.children) parent.children = [];
        parent.children.push(newFolder);
      } else {
        return null;
      }
    } else {
      this.fileTree.push(newFolder);
    }

    this.saveToStorage();
    return newFolder;
  }

  /**
   * Delete a file or folder
   */
  deleteNode(id: string): boolean {
    const deleteFromArray = (nodes: FileNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
          nodes.splice(i, 1);
          return true;
        }
        if (nodes[i].children) {
          if (deleteFromArray(nodes[i].children!)) {
            return true;
          }
        }
      }
      return false;
    };

    const deleted = deleteFromArray(this.fileTree);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  /**
   * Rename a file or folder
   */
  renameNode(id: string, newName: string): boolean {
    const node = this.findNodeById(id);
    if (!node) return false;

    const oldPath = node.path;
    node.name = newName;
    
    // Update path
    const pathParts = oldPath.split('/');
    pathParts[pathParts.length - 1] = newName;
    node.path = pathParts.join('/');

    // Update language for files
    if (node.type === 'file') {
      node.language = this.detectLanguage(newName);
    }

    // Update children paths recursively
    if (node.type === 'folder' && node.children) {
      this.updateChildrenPaths(node.children, node.path);
    }

    this.saveToStorage();
    return true;
  }

  /**
   * Update file content
   */
  updateFileContent(id: string, content: string): boolean {
    const node = this.findNodeById(id);
    if (!node || node.type !== 'file') return false;

    node.content = content;
    this.saveToStorage();
    return true;
  }

  /**
   * Get all files (flatten the tree)
   */
  getAllFiles(nodes: FileNode[] = this.fileTree): FileNode[] {
    const files: FileNode[] = [];
    for (const node of nodes) {
      if (node.type === 'file') {
        files.push(node);
      }
      if (node.children) {
        files.push(...this.getAllFiles(node.children));
      }
    }
    return files;
  }

  /**
   * Build path for a new node
   */
  private buildPath(parentId: string, name: string): string {
    const parent = this.findNodeById(parentId);
    if (!parent) return `/${name}`;
    return `${parent.path}/${name}`;
  }

  /**
   * Update children paths recursively
   */
  private updateChildrenPaths(children: FileNode[], parentPath: string): void {
    for (const child of children) {
      child.path = `${parentPath}/${child.name}`;
      if (child.children) {
        this.updateChildrenPaths(child.children, child.path);
      }
    }
  }

  /**
   * Detect language from file extension
   */
  private detectLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      md: 'markdown',
      xml: 'xml',
      yaml: 'yaml',
      yml: 'yaml',
      sh: 'shell',
      bash: 'shell',
      c: 'c',
      cpp: 'cpp',
      h: 'c',
      hpp: 'cpp',
      java: 'java',
      go: 'go',
      rs: 'rust',
      php: 'php',
      rb: 'ruby',
      sql: 'sql',
    };
    return languageMap[ext || ''] || 'plaintext';
  }

  /**
   * Get default content for a language
   */
  private getDefaultContent(language: string): string {
    const templates: Record<string, string> = {
      javascript: '// New JavaScript file\n',
      typescript: '// New TypeScript file\n',
      python: '#!/usr/bin/env python3\n# New Python file\n',
      html: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>',
      css: '/* New stylesheet */\n',
      json: '{\n  \n}',
      markdown: '# New Document\n',
      shell: '#!/bin/bash\n',
    };
    return templates[language] || '';
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.fileTree));
    } catch (error) {
      console.error('Failed to save file system:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.fileTree = JSON.parse(stored);
      } else {
        this.initializeDefault();
      }
    } catch (error) {
      console.error('Failed to load file system:', error);
      this.initializeDefault();
    }
  }
}

export const fileSystemService = new FileSystemService();
