import { useEditorStore } from "@/store/useEditorStore";
import { useCallback, useMemo } from "react";
import type{Id} from "../../convex/_generated/dataModel";
export const useEditor = (projectId: Id<"projects">) => {
    const openFileAction = useEditorStore((state) => state.openFile);
    const closeTabAction = useEditorStore((state) => state.closeTab);
    const closeAllTabAction = useEditorStore((state) => state.closeAllTab);
    const setActiveTabAction = useEditorStore((state) => state.setActiveTab);
    
    const tabstate = useEditorStore((state) => state.getTabState(projectId));

    const openFile = useCallback(
        (fileId: Id<"files">) => openFileAction(projectId, fileId),
        [openFileAction, projectId]
    )
    const closeTab = useCallback(
        (fileId: Id<"files">) => closeTabAction(projectId, fileId),
        [closeTabAction, projectId]
    )
    const closeAllTab = useCallback(
        () => closeAllTabAction(projectId),
        [closeAllTabAction, projectId]
    )
    const setActiveTab = useCallback(
        (fileId: Id<"files">) => setActiveTabAction(projectId, fileId),
        [setActiveTabAction, projectId]
    )
    return useMemo(() => ({
        openTab: tabstate.openTab,
        activeTabId: tabstate.activeTab,
        previewTabId: tabstate.previewTab,
        setActiveTab,
        closeAllTab,
        closeTab,
        openFile
    }), [
        tabstate.openTab, 
        tabstate.activeTab, 
        tabstate.previewTab, 
        setActiveTab, 
        closeAllTab, 
        closeTab, 
        openFile
    ])
   
   
}