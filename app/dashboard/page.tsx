'use client'

import { useState, useRef } from 'react';
import { Sidebar } from '../components/sidebar/Sidebar';
import { FolderView } from '../components/folders/FolderView';
import { CreateFolderDialog } from '../components/sidebar/CreateFolderDialog';
import { FolderType } from '../hooks/useFolders';

interface DashboardState {
  isClient: boolean;
  showDialog: boolean;
  selectedFolder: FolderType | null;
  isMindFolder: boolean;
  isExtended: boolean;
  isHubView: boolean;
}

interface SidebarRef {
  handleFolderCreate: (folderData: { name: string; theme: string; icon: string }) => void;
}

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>({
    isClient: false,
    showDialog: false,
    selectedFolder: null,
    isMindFolder: false,
    isExtended: false,
    isHubView: true
  });

  const sidebarRef = useRef<SidebarRef>(null);

  const handleFolderCreate = (folderData: { name: string; theme: string; icon: string }) => {
    if (sidebarRef.current) {
      sidebarRef.current.handleFolderCreate(folderData);
    }
    setState(prevState => ({ ...prevState, showDialog: false }));
  };

  const handleFolderSelect = (folder: FolderType | null, isMind: boolean = false) => {
    setState(prevState => ({
      ...prevState,
      selectedFolder: folder,
      isMindFolder: isMind,
      isExtended: !!folder && !isMind,
      isHubView: true,
    }));
  };

  const handleExtendedChange = (extended: boolean) => {
    setState(prev => ({ ...prev, isExtended: extended }));
  };

  return (
    <div className="flex min-h-screen bg-[#1A1A1A]">
      <Sidebar 
        ref={sidebarRef}
        onCreateFolder={() => setState(prev => ({ ...prev, showDialog: true }))}
        onFolderSelect={handleFolderSelect}
        isExtended={state.isExtended}
        onExtendedChange={handleExtendedChange}
      />

      <main 
        className={`
          flex-1 
          transition-all 
          duration-300 
          ease-in-out
          min-w-0
          ${state.isExtended ? 'ml-[364px]' : 'ml-16'}
        `}
      >
        <FolderView 
          folder={state.selectedFolder}
          isMindFolder={state.isMindFolder}
          isHubView={state.isHubView}
        />
      </main>

      {state.showDialog && (
        <CreateFolderDialog
          onClose={() => setState(prev => ({ ...prev, showDialog: false }))}
          onSubmit={handleFolderCreate}
        />
      )}
    </div>
  );
}
