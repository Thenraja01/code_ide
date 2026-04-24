import { create } from "zustand";
import type { Id } from "../../convex/_generated/dataModel";

// ---------- Types ----------
interface TabState {
  openTab: Id<"files">[];
  activeTab: Id<"files"> | null;
  previewTab: Id<"files"> | null;
}

const DEFAULT_TAB_STATE: TabState = {
  openTab: [],
  activeTab: null,
  previewTab: null,
};

interface FileTab {
  id: Id<"files">;
  name: string;
  content: string;
  isDirty: boolean;
}

interface EditorState {
  tabs: Map<Id<"projects">, TabState>;
  files: Map<Id<"files">, FileTab>;

  activeFileId: Id<"files"> | null;

  getTabState: (projectId: Id<"projects">) => TabState;

  openFile: (
    projectId: Id<"projects">,
    fileId: Id<"files">,
    options?: { pinned?: boolean }
  ) => void;

  closeTab: (
    projectId: Id<"projects">,
    fileId: Id<"files">
  ) => void;

  closeAllTab: (projectId: Id<"projects">) => void;

  setActiveTab: (
    projectId: Id<"projects">,
    fileId: Id<"files">
  ) => void;

  updateContent: (fileId: Id<"files">, content: string) => void;
}

// ---------- Store ----------
export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: new Map(),
  files: new Map(),
  activeFileId: null,

  // 🔹 Get tab state safely
  getTabState: (projectId) => {
    return get().tabs.get(projectId) ?? DEFAULT_TAB_STATE;
  },

  // 🔹 Open file
  openFile: (projectId, fileId, options) => {
    const pinned = options?.pinned ?? false;

    const tabs = new Map(get().tabs);
    const current = tabs.get(projectId) ?? DEFAULT_TAB_STATE;

    const { openTab, previewTab } = current;
    const isAlreadyOpen = openTab.includes(fileId);

    // Case 1: Preview open
    if (!isAlreadyOpen && !pinned) {
      const newTabs = previewTab
        ? openTab.map((id) => (id === previewTab ? fileId : id))
        : [...openTab, fileId];

      tabs.set(projectId, {
        ...current,
        openTab: newTabs,
        activeTab: fileId,
        previewTab: fileId,
      });

      set({ tabs, activeFileId: fileId });
      return;
    }

    // Case 2: Pinned open
    if (!isAlreadyOpen && pinned) {
      tabs.set(projectId, {
        ...current,
        openTab: [...openTab, fileId],
        activeTab: fileId,
        previewTab: null,
      });

      set({ tabs, activeFileId: fileId });
      return;
    }

    // Case 3: Already open → activate
    const shouldPin = pinned && previewTab === fileId;

    if (current.activeTab === fileId && (shouldPin ? current.previewTab === null : true)) {
      // Already active and already pinned (or didn't need pinning)
      return;
    }

    tabs.set(projectId, {
      ...current,
      activeTab: fileId,
      previewTab: shouldPin ? null : previewTab,
    });

    set({ tabs, activeFileId: fileId });
  },

  // 🔹 Close tab
  closeTab: (projectId, fileId) => {
    const tabs = new Map(get().tabs);
    const current = tabs.get(projectId);

    if (!current) return;

    const newTabs = current.openTab.filter((id) => id !== fileId);

    let newActive = current.activeTab;

    if (current.activeTab === fileId) {
      newActive = newTabs.length
        ? newTabs[newTabs.length - 1]
        : null;
    }

    tabs.set(projectId, {
      ...current,
      openTab: newTabs,
      activeTab: newActive,
      previewTab:
        current.previewTab === fileId ? null : current.previewTab,
    });

    set({
      tabs,
      activeFileId: newActive,
    });
  },

  // 🔹 Close all tabs
  closeAllTab: (projectId) => {
    const tabs = new Map(get().tabs);

    tabs.set(projectId, DEFAULT_TAB_STATE);

    set({
      tabs,
      activeFileId: null,
    });
  },

  // 🔹 Set active tab
  setActiveTab: (projectId, fileId) => {
    const tabs = new Map(get().tabs);
    const current = tabs.get(projectId);

    if (!current || current.activeTab === fileId) return;

    tabs.set(projectId, {
      ...current,
      activeTab: fileId,
    });

    set({
      tabs,
      activeFileId: fileId,
    });
  },

  updateContent: (fileId, content) => {
    const files = new Map(get().files);
    const file = files.get(fileId);

    if (!file || file.content === content) return;

    files.set(fileId, {
      ...file,
      content,
      isDirty: true,
    });

    set({ files });
  },
}));