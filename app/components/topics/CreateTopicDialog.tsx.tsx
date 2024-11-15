'use client'
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { useNotification } from '@/app/hooks/useNotification';
import { getFolders } from '@/app/actions/folders';
import { Folder } from '@/app/types';

interface CreateTopicDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (noteData: { title: string; folderId?: string }) => void;
}

export const CreateTopicDialog = ({ isOpen, onClose, onSubmit }: CreateTopicDialogProps) => {
  const [isClient, setIsClient] = useState(false);
  const [title, setTitle] = useState('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { showNotification } = useNotification();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');

  // Handle client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset form state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setHasError(false);
      setErrorMessage('');
      setSelectedFolder('');
    }
  }, [isOpen]);

  // Fetch folders when dialog opens
  useEffect(() => {
    const fetchFolders = async () => {
      if (!isOpen) return;
      
      try {
        const fetchedFolders = await getFolders();
        setFolders(fetchedFolders);
        setHasError(false);
        setErrorMessage('');
      } catch (err) {
        console.error('Error fetching folders:', err);
        setHasError(true);
        setErrorMessage(err instanceof Error ? err.message : 'Failed to fetch folders');
      }
    };

    if (isClient) {
      fetchFolders();
    }
  }, [isOpen, isClient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setHasError(true);
      setErrorMessage('Please enter a title');
      return;
    }

    try {
      onSubmit({ 
        title: title.trim(),
        folderId: selectedFolder || undefined 
      });
      showNotification('success', 'Note created successfully');
      onClose();
    } catch (err) {
      setHasError(true);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to create note');
      showNotification('error', err instanceof Error ? err.message : 'Failed to create note');
    }
  };

  // Only render dialog on client side
  if (!isClient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title"
              />
              {hasError && (
                <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="folder">Folder (Optional)</Label>
              <select
                id="folder"
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select a folder</option>
                {folders.map(folder => (
                  <option key={folder._id} value={folder._id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ... styled components remain the same ... 