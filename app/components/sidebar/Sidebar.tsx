'use client'

import { useState, ReactNode, forwardRef, ForwardedRef, useImperativeHandle, useEffect, useRef } from 'react'
import { Home, Users, HelpCircle, User, Folder, Plus, Mouse, Camera, Eraser, TestTube, Trash, FileBox, Send, Inbox, Edit2, Brain, LogOut } from 'lucide-react'
import { FolderType } from '../../hooks/useFolders'
import { useNotification } from '@/app/contexts/NotificationContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { useSession } from 'next-auth/react';
import { getFolders, createFolder } from '@/app/actions/folders';
import type { Folder as FolderFromTypes } from '@/app/types';

interface SidebarButtonProps {
  icon: ReactNode
  text?: string
  active?: boolean
  showTooltip?: boolean
  onClick?: (e: React.MouseEvent) => void
  color?: string
  onContextMenu?: (e: React.MouseEvent) => void
}

interface SidebarProps {
  onCreateFolder: () => void;
  onFolderSelect: (folder: FolderType | null, isMind?: boolean) => void;
}

// Icon components mapping
const iconComponents = {
  'Computer Mouse': Mouse,
  'Photo Stack': FileBox,
  'Camera': Camera,
  'Eraser': Eraser,
  'Test Tube': TestTube,
  'Trash': Trash,
  'Folder': Folder,
  'Paperplane': Send,
  'Tray': Inbox,
};

// Theme colors mapping
const themeColors = {
  lime: '#84cc16',
  lychee: '#ec4899',
  mango: '#f97316',
  plum: '#a855f7',
  blueberry: '#3b82f6',
  kiwi: '#22c55e',
  pitaya: '#d946ef',
  smoothie: '#06b6d4',
  macaron: '#f43f5e',
};

export interface SidebarRef {
  handleFolderCreate: (folderData: { name: string; theme: string; icon: string }) => void;
}

interface FolderContextMenuProps {
  folder: FolderType;
  onEdit: () => void;
  onDelete: () => void;
  position: { x: number; y: number };
  onClose: () => void;
}

interface AccountMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  onLogout: () => void;
}

// Update StrictFolder to match FolderType
interface StrictFolder extends FolderFromTypes {
  _id: string;
  name: string;
  theme: string;  // Required
  icon: string;   // Required
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const Sidebar = forwardRef(({ onCreateFolder, onFolderSelect }: SidebarProps, ref: ForwardedRef<SidebarRef>) => {
  const [folders, setFolders] = useState<StrictFolder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    folder: FolderType;
    x: number;
    y: number;
  } | null>(null);
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [indicatorOffset, setIndicatorOffset] = useState(0);
  const activeButtonRef = useRef<HTMLButtonElement>(null);
  const MIND_FOLDER_ID = 'mind-folder';
  const { showNotification } = useNotification();
  const [accountMenu, setAccountMenu] = useState<{ x: number; y: number } | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (activeButtonRef.current) {
      const buttonRect = activeButtonRef.current.getBoundingClientRect();
      setIndicatorOffset(buttonRect.top);
    }
  }, [activeFolder]);

  const refreshFolders = async () => {
    try {
      const fetchedFolders = await getFolders();
      // Convert fetched folders to StrictFolder type
      const strictFolders: StrictFolder[] = fetchedFolders.map(folder => ({
        ...folder,
        theme: folder.theme || 'default',
        icon: folder.icon || 'Folder'
      }));
      setFolders(strictFolders);
    } catch (err) {
      console.error('Error refreshing folders:', err);
      showNotification('error', 'Failed to refresh folders');
    }
  };

  const handleFolderEdit = async (folderId: string, newName: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) throw new Error('Failed to update folder');
      
      await refreshFolders();
      showNotification('success', 'Folder renamed successfully');
      setEditingFolder(null);
    } catch (err) {
      console.error('Error renaming folder:', err);
      showNotification('error', 'Failed to rename folder');
    }
  };

  const handleFolderDelete = async (folderId: string) => {
    try {
      const response = await fetch(`/api/folders?id=${folderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete folder');

      if (activeFolder === folderId) {
        setActiveFolder(null);
        onFolderSelect(null);
      }
      
      await refreshFolders();
      showNotification('success', 'Folder deleted successfully');
    } catch (err) {
      console.error('Error deleting folder:', err);
      showNotification('error', 'Failed to delete folder');
    }
  };

  const handleContextMenu = (e: React.MouseEvent, folder: FolderType) => {
    e.preventDefault();
    setContextMenu({
      folder,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleFolderClick = (folder: FolderType | null, isMind: boolean = false) => {
    setActiveFolder(folder ? folder._id : isMind ? MIND_FOLDER_ID : null);
    onFolderSelect(folder, isMind);
  };

  const handleAccountClick = (e: React.MouseEvent) => {
    const button = e.currentTarget.getBoundingClientRect();
    setAccountMenu({
      x: button.right + 8,
      y: button.top - 75,
    });
  };

  const handleLogout = () => {
    logout();
    setAccountMenu(null);
  };

  useImperativeHandle(ref, () => ({
    handleFolderCreate: async (folderData: { name: string; theme: string; icon: string }) => {
      if (!isClient) return;
      
      try {
        const newFolder = await createFolder(folderData);
        // Convert to StrictFolder
        const strictFolder: StrictFolder = {
          ...newFolder,
          theme: newFolder.theme || 'default',
          icon: newFolder.icon || 'Folder'
        };
        setFolders(prevFolders => [...prevFolders, strictFolder]);
        setHasError(false);
        setErrorMessage('');
      } catch (err) {
        console.error('Error creating folder:', err);
        setHasError(true);
        setErrorMessage(err instanceof Error ? err.message : 'Failed to create folder');
      }
    }
  }), [isClient]);

  useEffect(() => {
    const fetchFolders = async () => {
      if (!isClient) return;
      
      try {
        const fetchedFolders = await getFolders();
        // Convert folders to StrictFolder type with default values
        const strictFolders = fetchedFolders.map(folder => ({
          ...folder,
          theme: folder.theme || 'default',  // Provide default theme
          icon: folder.icon || 'Folder'      // Provide default icon
        }));
        setFolders(strictFolders);
        setHasError(false);
        setErrorMessage('');
      } catch (err) {
        console.error('Error fetching folders:', err);
        setHasError(true);
        setErrorMessage(err instanceof Error ? err.message : 'Failed to fetch folders');
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, [isClient]);

  if (!isClient || loading) {
    return (
      <div className="w-16 bg-[#1A1A1A] border-r border-[#2A2A2A] py-4 flex flex-col items-center relative">
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-16 bg-[#1A1A1A] border-r border-[#2A2A2A] py-4 flex flex-col items-center relative">
        <div className="text-red-500 text-sm px-2">
          {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="w-16 bg-[#1A1A1A] border-r border-[#2A2A2A] py-4 flex flex-col items-center relative sidebar-container">
      <div 
        className="absolute right-0 w-0.5 h-4 bg-white rounded-full mr-[2.75px] transition-all duration-300 ease-in-out"
        style={{ 
          top: `${indicatorOffset}px`,
          transform: 'translateY(-50%)',
          opacity: activeFolder !== null || activeFolder === -1 ? 1 : 0,
        }}
      />

      <nav className="w-full space-y-2 px-2">
        <SidebarButton 
          ref={activeFolder === null ? activeButtonRef : null}
          icon={<Home size={20} />} 
          text="Home" 
          active={activeFolder === null}
          showTooltip
          onClick={() => handleFolderClick(null)}
        />
      </nav>

      <div className="w-8 h-px bg-[#2A2A2A] my-4" />

      <div className="w-full">
        <div className="space-y-1 px-2">
          <SidebarButton
            ref={activeFolder === MIND_FOLDER_ID ? activeButtonRef : null}
            icon={<Brain size={20} />}
            text="Mind"
            showTooltip
            active={activeFolder === MIND_FOLDER_ID}
            onClick={() => handleFolderClick(null, true)}
            color="#f43f5e"
          />
          
          {folders.map((folder) => {
            const IconComponent = iconComponents[folder.icon as keyof typeof iconComponents] || Folder;
            // Convert StrictFolder to FolderType when needed
            const folderAsType: FolderType = {
              _id: folder._id,
              name: folder.name,
              theme: folder.theme,
              icon: folder.icon,
              userId: folder.userId
            };
            
            return (
              <div key={folder._id} className="relative">
                {editingFolder?._id === folder._id ? (
                  <FolderEditInput
                    folder={folderAsType}
                    onSave={handleFolderEdit}
                    onCancel={() => setEditingFolder(null)}
                  />
                ) : (
                  <SidebarButton
                    ref={activeFolder === folder._id ? activeButtonRef : null}
                    icon={<IconComponent size={20} />}
                    text={folder.name}
                    showTooltip
                    active={activeFolder === folder._id}
                    onClick={() => handleFolderClick(folderAsType)}
                    onContextMenu={(e) => handleContextMenu(e, folderAsType)}
                    color={themeColors[folder.theme as keyof typeof themeColors]}
                  />
                )}
              </div>
            );
          })}
          <SidebarButton
            icon={<Plus size={20} />}
            text="New Folder"
            showTooltip
            onClick={onCreateFolder}
          />
        </div>
      </div>

      <div className="mt-auto space-y-2 w-full px-2">
        <SidebarButton icon={<Users size={20} />} text="Invite friends" showTooltip />
        <SidebarButton icon={<HelpCircle size={20} />} text="Support" showTooltip />
        <SidebarButton 
          icon={<User size={20} />} 
          text="Account" 
          showTooltip 
          onClick={handleAccountClick}
          active={!!accountMenu}
        />
      </div>

      {contextMenu && (
        <FolderContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onEdit={() => {
            setEditingFolder(contextMenu.folder);
            setContextMenu(null);
          }}
          onDelete={() => {
            handleFolderDelete(contextMenu.folder._id);
            setContextMenu(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}

      {accountMenu && (
        <AccountMenu
          position={accountMenu}
          onClose={() => setAccountMenu(null)}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
});

Sidebar.displayName = 'Sidebar';

const SidebarButton = forwardRef<HTMLButtonElement, SidebarButtonProps>(({ 
  icon, 
  text, 
  active = false, 
  showTooltip = false,
  onClick,
  color,
  onContextMenu
}, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`w-full flex items-center justify-center p-2 rounded-lg group relative
        ${active 
          ? 'bg-[#2A2A2A] text-white' 
          : 'text-gray-400 hover:bg-[#2A2A2A] hover:text-white'
        }`}
      style={color ? { color } : undefined}
    >
      {icon}
      {showTooltip && text && (
        <span className="absolute left-full ml-2 px-2 py-1 bg-[#2A2A2A] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-[9999]">
          {text}
        </span>
      )}
    </button>
  );
});

SidebarButton.displayName = 'SidebarButton';

function FolderEditInput({ 
  folder, 
  onSave, 
  onCancel 
}: { 
  folder: FolderType; 
  onSave: (id: string, name: string) => void; 
  onCancel: () => void; 
}) {
  const [name, setName] = useState(folder.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(folder._id, name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-2 py-1">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-[#2A2A2A] text-white rounded px-2 py-1 text-sm"
        autoFocus
        onBlur={onCancel}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
      />
    </form>
  );
}

function FolderContextMenu({ position, onEdit, onDelete, onClose }: Omit<FolderContextMenuProps, 'folder'>) {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="fixed bg-[#2A2A2A] rounded-lg shadow-lg py-1 z-50"
      style={{ top: position.y, left: position.x }}
    >
      <button
        onClick={onEdit}
        className="w-full px-4 py-2 text-sm text-white hover:bg-[#3A3A3A] flex items-center gap-2"
      >
        <Edit2 size={16} />
        Edit
      </button>
      <button
        onClick={onDelete}
        className="w-full px-4 py-2 text-sm text-red-400 hover:bg-[#3A3A3A] flex items-center gap-2"
      >
        <Trash size={16} />
        Delete
      </button>
    </div>
  );
}

function AccountMenu({ position, onClose, onLogout }: AccountMenuProps) {
  const { data: session } = useSession();

  useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="fixed bg-[#2A2A2A] rounded-lg shadow-lg py-1 z-50 w-64"
      style={{ 
        top: position.y,
        left: position.x,
        transform: 'translateX(0)'
      }}
    >
      <div className="px-4 py-3 border-b border-[#3A3A3A]">
        <div className="font-medium text-white">{session?.user?.name}</div>
        <div className="text-sm text-gray-400">{session?.user?.email}</div>
      </div>

      <button
        onClick={onLogout}
        className="w-full px-4 py-2 text-sm text-red-400 hover:bg-[#3A3A3A] flex items-center gap-2"
      >
        <LogOut size={16} />
        Log out
      </button>
    </div>
  );
} 