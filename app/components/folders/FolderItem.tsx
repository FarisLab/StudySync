'use client'
import { FolderDocument } from '@/app/types/database';
import { useEffect, useState } from 'react';

interface FolderItemProps {
  folder: FolderDocument;
}

export const FolderItem = ({ folder }: FolderItemProps) => {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    // Format date on client side only
    setFormattedDate(new Date(folder.createdAt).toLocaleDateString());
  }, [folder.createdAt]);

  return (
    <div>
      <h3>{folder.name}</h3>
      {formattedDate && <span>{formattedDate}</span>}
    </div>
  );
}; 