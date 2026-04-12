import { create } from 'zustand';

interface FileTab {
    id: string;
    name: string;
    content: string;
    isDirty: boolean;
}

interface EditorState {
    openFiles: FileTab[];
    activeFileId: string | null;
    openFile: (file: { id: string, name: string, content: string }) => void;
    closeFile: (id: string) => void;
    setActiveFile: (id: string) => void;
    updateContent: (id: string, content: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    openFiles: [],
    activeFileId: null,

    openFile: (file: { id: string; name: string; content: string }) => set((state: EditorState) => {
        const exists = state.openFiles.find(f => f.id === file.id);
        if (exists) return { activeFileId: file.id };
        
        return {
            openFiles: [...state.openFiles, { ...file, isDirty: false }],
            activeFileId: file.id
        };
    }),

    closeFile: (id: string) => set((state: EditorState) => {
        const remaining = state.openFiles.filter(f => f.id !== id);
        let newActive = state.activeFileId;
        if (state.activeFileId === id) {
            newActive = remaining.length > 0 ? remaining[remaining.length - 1].id : null;
        }
        return { openFiles: remaining, activeFileId: newActive };
    }),

    setActiveFile: (id: string) => set({ activeFileId: id }),

    updateContent: (id: string, content: string) => set((state: EditorState) => ({
        openFiles: state.openFiles.map((f: FileTab) => f.id === id ? { ...f, content, isDirty: true } : f)
    }))
}));

