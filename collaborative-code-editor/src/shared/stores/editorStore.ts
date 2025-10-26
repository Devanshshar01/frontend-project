import { create } from 'zustand';
import type { FileDocument, EditorSettings, ProgrammingLanguage } from '../types';
import { EDITOR_CONFIG } from '../config/constants';

/**
 * Editor state management
 * Handles file management, editor settings, and UI state
 */
interface EditorState {
  // File management
  currentFile: FileDocument | null;
  openFiles: FileDocument[];
  unsavedChanges: Set<string>;

  // Editor settings
  settings: EditorSettings;

  // UI state
  isSidebarOpen: boolean;
  isCommandPaletteOpen: boolean;
  isSettingsOpen: boolean;

  // Actions
  setCurrentFile: (file: FileDocument | null) => void;
  updateFileContent: (fileId: string, content: string) => void;
  openFile: (file: FileDocument) => void;
  closeFile: (fileId: string) => void;
  markAsUnsaved: (fileId: string) => void;
  markAsSaved: (fileId: string) => void;
  updateSettings: (settings: Partial<EditorSettings>) => void;
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
  toggleSettings: () => void;
  setLanguage: (language: ProgrammingLanguage) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // Initial state
  currentFile: null,
  openFiles: [],
  unsavedChanges: new Set(),

  settings: {
    theme: {
      name: EDITOR_CONFIG.DEFAULT_THEME,
      isDark: true,
    },
    fontSize: EDITOR_CONFIG.DEFAULT_FONT_SIZE,
    tabSize: EDITOR_CONFIG.DEFAULT_TAB_SIZE,
    wordWrap: EDITOR_CONFIG.WORD_WRAP,
    minimap: EDITOR_CONFIG.MINIMAP_ENABLED,
    lineNumbers: EDITOR_CONFIG.LINE_NUMBERS_ENABLED,
    autoSave: true,
    autoSaveDelay: EDITOR_CONFIG.AUTO_SAVE_DELAY,
  },

  isSidebarOpen: true,
  isCommandPaletteOpen: false,
  isSettingsOpen: false,

  // Actions
  setCurrentFile: (file) => set({ currentFile: file }),

  updateFileContent: (fileId, content) =>
    set((state) => {
      const updatedOpenFiles = state.openFiles.map((file) =>
        file.id === fileId ? { ...file, content, updatedAt: new Date() } : file
      );

      return {
        openFiles: updatedOpenFiles,
        currentFile:
          state.currentFile?.id === fileId
            ? { ...state.currentFile, content, updatedAt: new Date() }
            : state.currentFile,
      };
    }),

  openFile: (file) =>
    set((state) => {
      const isAlreadyOpen = state.openFiles.some((f) => f.id === file.id);

      return {
        openFiles: isAlreadyOpen ? state.openFiles : [...state.openFiles, file],
        currentFile: file,
      };
    }),

  closeFile: (fileId) =>
    set((state) => {
      const filteredFiles = state.openFiles.filter((f) => f.id !== fileId);
      const newUnsavedChanges = new Set(state.unsavedChanges);
      newUnsavedChanges.delete(fileId);

      return {
        openFiles: filteredFiles,
        currentFile:
          state.currentFile?.id === fileId
            ? filteredFiles[filteredFiles.length - 1] || null
            : state.currentFile,
        unsavedChanges: newUnsavedChanges,
      };
    }),

  markAsUnsaved: (fileId) =>
    set((state) => {
      const newUnsavedChanges = new Set(state.unsavedChanges);
      newUnsavedChanges.add(fileId);
      return { unsavedChanges: newUnsavedChanges };
    }),

  markAsSaved: (fileId) =>
    set((state) => {
      const newUnsavedChanges = new Set(state.unsavedChanges);
      newUnsavedChanges.delete(fileId);
      return { unsavedChanges: newUnsavedChanges };
    }),

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  toggleCommandPalette: () =>
    set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),

  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

  setLanguage: (language) =>
    set((state) => ({
      currentFile: state.currentFile ? { ...state.currentFile, language } : null,
    })),
}));
