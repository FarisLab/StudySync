'use client'
import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/app/lib/api';

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
    if (!session?.user?.id) {
      setFoldersState([]);
      return;
    }
    
    try {
      const response = await fetch(getApiUrl('/folders'));
      
      if (response.status === 401) {
        router.push('/auth');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }

      const data = await response.json();
      setFoldersState(data);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in refreshFolders:', error);
      }
      setFoldersState([]);
    }
  }, [router, session]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      refreshFolders();
    } else if (status === 'unauthenticated') {
      setFoldersState([]);
    }
  }, [status, session, refreshFolders]);

  const setFolders = async (folderData: { name: string; theme: string; icon: string }) => {
    if (!session?.user) throw new Error('Unauthorized');

    try {
      const response = await fetch(getApiUrl('/folders'), {
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