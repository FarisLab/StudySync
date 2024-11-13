'use client'
import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export interface FolderType {
  _id: string;
  name: string;
  theme: string;
  icon: string;
  userId: string;
}

export function useFolders() {
  const [folders, setFoldersState] = useState<FolderType[]>([]);
  const { data: session, status } = useSession();
  const router = useRouter();

  const refreshFolders = useCallback(async () => {
    console.log('refreshFolders called, session status:', status);
    console.log('session user:', session?.user);

    if (!session?.user?.id) {
      console.log('No user session, clearing folders');
      setFoldersState([]);
      return;
    }
    
    try {
      console.log('Fetching folders for user:', session.user.id);
      const response = await fetch('/api/folders');
      
      if (response.status === 401) {
        console.log('Unauthorized, redirecting to auth');
        router.push('/auth');
        return;
      }
      
      if (!response.ok) {
        console.error('Failed to fetch folders:', response.status);
        throw new Error('Failed to fetch folders');
      }

      const data = await response.json();
      console.log('Received folders from API:', data);
      
      setFoldersState(data);
    } catch (error) {
      console.error('Error in refreshFolders:', error);
      setFoldersState([]);
    }
  }, [router, status, session]);

  useEffect(() => {
    console.log('Session status changed:', status);
    console.log('Current session:', session);

    if (status === 'authenticated' && session?.user?.id) {
      console.log('Session authenticated, refreshing folders');
      refreshFolders();
    } else if (status === 'unauthenticated') {
      console.log('Session unauthenticated, clearing folders');
      setFoldersState([]);
    }
  }, [status, session, refreshFolders]);

  const setFolders = async (folderData: { name: string; theme: string; icon: string }) => {
    if (!session?.user) throw new Error('Unauthorized');

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...folderData,
          userId: session.user.id
        }),
      });

      if (!response.ok) throw new Error('Failed to create folder');
      
      const newFolder = await response.json();
      
      setFoldersState(prev => {
        const exists = prev.some(folder => folder._id === newFolder._id);
        if (exists) return prev;
        return [...prev, newFolder];
      });

      return newFolder;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  };

  return {
    folders,
    setFolders,
    refreshFolders,
  };
} 