'use client'

import { ChevronRight } from 'lucide-react';
import { FolderType } from '@/app/hooks/useFolders';

interface BreadcrumbProps {
  path: FolderType[];
  onNavigate: (folder: FolderType | null) => void;
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
      <button
        onClick={() => onNavigate(null)}
        className="hover:text-white transition-colors"
      >
        Home
      </button>

      {path.map((folder, index) => (
        <div key={folder._id} className="flex items-center space-x-2">
          <ChevronRight size={16} />
          <button
            onClick={() => onNavigate(folder)}
            className={`hover:text-white transition-colors ${
              index === path.length - 1 ? 'text-white' : ''
            }`}
          >
            {folder.name}
          </button>
        </div>
      ))}
    </nav>
  );
} 