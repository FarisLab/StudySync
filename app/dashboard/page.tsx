'use client'

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sidebar, SidebarRef } from '../components/sidebar/Sidebar';
import { CreateFolderDialog } from '../components/sidebar/CreateFolderDialog';
import { FolderView } from '../components/FolderView';
import { FolderType } from '../hooks/useFolders';
import { Suspense } from 'react';

export default function DashboardPage() {
  // State management
  const [isClient, setIsClient] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
  const [isMindFolder, setIsMindFolder] = useState(false);
  
  // Refs and hooks
  const sidebarRef = useRef<SidebarRef>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Handle client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [status, router]);

  // Loading state
  if (!isClient || status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // Unauthenticated state
  if (!session) {
    return null;
  }

  // Event handlers
  const handleFolderCreate = (folderData: { name: string; theme: string; icon: string }) => {
    if (sidebarRef.current) {
      sidebarRef.current.handleFolderCreate(folderData);
    }
    setShowDialog(false);
  };

  const handleFolderSelect = (folder: FolderType | null, isMind: boolean = false) => {
    setSelectedFolder(folder);
    setIsMindFolder(isMind);
  };

  // Render
  return (
    <div className="flex h-screen">
      <Suspense fallback={
        <div className="flex items-center justify-center w-64">
          Loading sidebar...
        </div>
      }>
        <Sidebar 
          ref={sidebarRef}
          onCreateFolder={() => setShowDialog(true)}
          onFolderSelect={handleFolderSelect}
        />
      </Suspense>

      <main className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            Loading content...
          </div>
        }>
          <FolderView 
            folder={selectedFolder}
            isMindFolder={isMindFolder}
          />
        </Suspense>
      </main>

      {isClient && showDialog && (
        <CreateFolderDialog
          onClose={() => setShowDialog(false)}
          onSubmit={handleFolderCreate}
        />
      )}
    </div>
  );
}
