import { create } from 'zustand';
import type { CollaborationSession, Participant, CursorPosition } from '../types';

/**
 * Collaboration state management
 * Handles real-time collaboration features
 */
interface CollaborationState {
  session: CollaborationSession | null;
  participants: Map<string, Participant>;
  isConnected: boolean;
  cursorPositions: Map<string, CursorPosition>;
  typingUsers: Set<string>;

  // Actions
  setSession: (session: CollaborationSession | null) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (userId: string) => void;
  updateParticipant: (userId: string, updates: Partial<Participant>) => void;
  updateCursorPosition: (userId: string, position: CursorPosition) => void;
  setUserTyping: (userId: string, isTyping: boolean) => void;
  setConnected: (connected: boolean) => void;
  clearSession: () => void;
}

export const useCollaborationStore = create<CollaborationState>((set) => ({
  session: null,
  participants: new Map(),
  isConnected: false,
  cursorPositions: new Map(),
  typingUsers: new Set(),

  setSession: (session) => set({ session }),

  addParticipant: (participant) =>
    set((state) => {
      const newParticipants = new Map(state.participants);
      newParticipants.set(participant.user.id, participant);
      return { participants: newParticipants };
    }),

  removeParticipant: (userId) =>
    set((state) => {
      const newParticipants = new Map(state.participants);
      newParticipants.delete(userId);

      const newCursorPositions = new Map(state.cursorPositions);
      newCursorPositions.delete(userId);

      const newTypingUsers = new Set(state.typingUsers);
      newTypingUsers.delete(userId);

      return {
        participants: newParticipants,
        cursorPositions: newCursorPositions,
        typingUsers: newTypingUsers,
      };
    }),

  updateParticipant: (userId, updates) =>
    set((state) => {
      const participant = state.participants.get(userId);
      if (!participant) return state;

      const newParticipants = new Map(state.participants);
      newParticipants.set(userId, { ...participant, ...updates });
      return { participants: newParticipants };
    }),

  updateCursorPosition: (userId, position) =>
    set((state) => {
      const newCursorPositions = new Map(state.cursorPositions);
      newCursorPositions.set(userId, position);
      return { cursorPositions: newCursorPositions };
    }),

  setUserTyping: (userId, isTyping) =>
    set((state) => {
      const newTypingUsers = new Set(state.typingUsers);
      if (isTyping) {
        newTypingUsers.add(userId);
      } else {
        newTypingUsers.delete(userId);
      }
      return { typingUsers: newTypingUsers };
    }),

  setConnected: (connected) => set({ isConnected: connected }),

  clearSession: () =>
    set({
      session: null,
      participants: new Map(),
      isConnected: false,
      cursorPositions: new Map(),
      typingUsers: new Set(),
    }),
}));
