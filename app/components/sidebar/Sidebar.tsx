'use client'

import { useState, ReactNode, forwardRef, ForwardedRef, useImperativeHandle, useEffect, useRef } from 'react'
import { Home, Users, HelpCircle, User, Folder, Plus, Mouse, Camera, Eraser, TestTube, Trash, FileBox, Send, Inbox, Edit2, Brain, LogOut, Search, PenTool, BookOpen, Book, Globe } from 'lucide-react'
import { FolderType } from '../../hooks/useFolders'
import { useNotification } from '@/app/contexts/NotificationContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { useSession } from 'next-auth/react';
import { getFolders, createFolder } from '@/app/actions/folders';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Topic } from '@/app/types';
import { SpaceType } from '@/app/types/topics';
import { CreateTopicDialog } from '../topics/CreateTopicDialog.tsx';

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
  isExtended?: boolean;
  onExtendedChange?: (extended: boolean) => void;
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

export const Sidebar = forwardRef(({ onCreateFolder, onFolderSelect, isExtended, onExtendedChange }: SidebarProps, ref: ForwardedRef<SidebarRef>) => {
  const [folders, setFolders] = useState<FolderType[]>([]);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isHubActive, setIsHubActive] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (activeButtonRef.current) {
      const buttonRect = activeButtonRef.current.getBoundingClientRect();
      const buttonCenter = buttonRect.top + (buttonRect.height / 2);
      setIndicatorOffset(buttonCenter);
    }
  }, [activeFolder]);

  const refreshFolders = async () => {
    try {
      const fetchedFolders = await getFolders();
      setFolders(fetchedFolders);
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
    setIsHubActive(true);
    onExtendedChange?.(!!(folder && !isMind));
    onFolderSelect(folder, isMind);
    
    if (folder) {
      fetchTopics(folder._id);
    }
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
        setFolders(prevFolders => [...prevFolders, newFolder]);
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
        setFolders(fetchedFolders);
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

  const getSpaceIcon = (type: SpaceType) => {
    switch (type) {
      case 'notes':
        return <PenTool size={20} />;
      case 'quiz':
        return <Brain size={20} />;
      case 'flashcards':
        return <BookOpen size={20} />;
      default:
        return <Book size={20} />;
    }
  };

  // Replace the nested folder rendering with a simple map
  const renderFolders = () => (
    <div className="space-y-1">
      {folders.map(folder => {
        const IconComponent = iconComponents[folder.icon as keyof typeof iconComponents] || Folder;
        const folderAsType: FolderType = {
          _id: folder._id,
          name: folder.name,
          theme: folder.theme,
          icon: folder.icon,
          userId: folder.userId
        };

        return (
          <div key={folder._id}>
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
    </div>
  );

  // Fetch topics for a folder
  const fetchTopics = async (folderId: string) => {
    try {
      const response = await fetch(`/api/topics?folderId=${folderId}`);
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    // You might want to add a prop for handling topic selection
    // onTopicSelect?.(topic);
  };

  if (!isClient || loading) {
    return (
      <div className="fixed top-0 left-0 w-16 h-screen bg-[#1A1A1A] border-r border-[#2A2A2A] py-4 flex flex-col items-center z-10">
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="fixed top-0 left-0 w-16 h-screen bg-[#1A1A1A] border-r border-[#2A2A2A] py-4 flex flex-col items-center z-10">
        <div className="text-red-500 text-sm px-2">
          {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Sidebar - Always visible */}
      <div className="fixed top-0 left-0 w-16 h-screen bg-[#1A1A1A] border-r border-[#2A2A2A] py-1 flex flex-col items-center z-10">
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

        <div className="w-full px-2 mb-4">
          <SidebarButton
            ref={activeFolder === MIND_FOLDER_ID ? activeButtonRef : null}
            icon={<Brain size={20} />}
            text="Mind"
            showTooltip
            active={activeFolder === MIND_FOLDER_ID}
            onClick={() => handleFolderClick(null, true)}
            color="#f43f5e"
          />
        </div>

        <div className="w-8 h-px bg-[#2A2A2A] mb-4" />

        <div className="w-full flex-1 overflow-y-auto">
          <div className="space-y-1 px-2">
            {renderFolders()}
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
      </div>

      {/* Extended Sidebar Panel */}
      {isExtended && (
        <div 
          className="fixed top-0 left-16 w-[300px] h-screen bg-[#1A1A1A] border-r border-[#2A2A2A] p-4 overflow-y-auto z-10"
          style={{ 
            transition: 'transform 0.3s ease-in-out',
            transform: isExtended ? 'translateX(0)' : 'translateX(-100%)'
          }}
        >
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#2A2A2A] text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Hub Tab */}
          <div 
            onClick={() => {
              setActiveFolder(null);
              setIsHubActive(true);
              onExtendedChange?.(true);
              onFolderSelect(null, false);
            }}
            className={`
              p-3 mb-4 bg-[#2A2A2A] rounded-lg hover:bg-[#3A3A3A] 
              transition-colors cursor-pointer
              ${isHubActive ? 'ring-2 ring-blue-500' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-blue-500" />
              <div>
                <h3 className="text-white text-sm font-medium">Study Hub</h3>
                <p className="text-gray-400 text-xs">Discover and share resources</p>
              </div>
            </div>
          </div>

          {/* Separator Line */}
          <div className="h-px bg-[#2A2A2A] my-4" />

          {/* Topics List */}
          <div className="space-y-2">
            {topics
              .filter(topic => topic.title.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(topic => (
                <div
                  key={topic._id}
                  onClick={() => handleTopicClick(topic)}
                  className={`
                    p-3 bg-[#2A2A2A] rounded-lg hover:bg-[#3A3A3A] 
                    transition-colors cursor-pointer
                    ${selectedTopic?._id === topic._id ? 'ring-2 ring-blue-500' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white text-sm font-medium">{topic.title}</h3>
                      <p className="text-gray-400 text-xs mt-1">{topic.type}</p>
                    </div>
                    {getSpaceIcon(topic.type as SpaceType)}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {topic.type === 'notes' && `Last edited: ${new Date(topic.updatedAt).toLocaleDateString()}`}
                    {topic.type === 'quiz' && 'Quiz'}
                    {topic.type === 'flashcards' && 'Flashcards'}
                  </div>
                </div>
              ))}
            {topics.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No topics yet
              </div>
            )}
          </div>

          {/* Create Topic Button */}
          <button
            onClick={() => setIsCreateNoteOpen(true)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            New Topic
          </button>
        </div>
      )}

      {/* Context Menu and Account Menu remain the same */}
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

      {activeFolder && (
        <CreateTopicDialog 
          isOpen={isCreateNoteOpen}
          onClose={() => setIsCreateNoteOpen(false)}
          onSubmit={async (noteData) => {
            try {
              await fetch('/api/topics', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  type: 'notes',
                  title: noteData.title,
                  folderId: activeFolder || undefined,
                  content: {
                    text: '',
                    lastEdited: new Date(),
                  },
                }),
              });
              setIsCreateNoteOpen(false);
              if (activeFolder) {
                fetchTopics(activeFolder);
              }
            } catch (err) {
              console.error('Error creating note:', err);
            }
          }}
        />
      )}
    </>
  );
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
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={300}>
        <Tooltip.Trigger asChild>
          <button
            ref={ref}
            onClick={onClick}
            onContextMenu={onContextMenu}
            className={`
              w-full flex items-center justify-center p-2 rounded-lg
              transition-all duration-200 ease-in-out
              ${active 
                ? 'bg-[#2A2A2A] text-white scale-105' 
                : 'text-gray-400 hover:bg-[#2A2A2A] hover:text-white hover:scale-105'
              }
              hover:shadow-lg
              active:scale-95
            `}
            style={color ? { color } : undefined}
          >
            {icon}
          </button>
        </Tooltip.Trigger>
        {showTooltip && text && (
          <Tooltip.Portal>
            <Tooltip.Content
              className="
                px-3 py-2 
                bg-[#2A2A2A] 
                text-white text-sm 
                rounded-md 
                shadow-lg
                select-none
                animate-in fade-in-50 
                data-[state=closed]:animate-out 
                data-[state=closed]:fade-out-0 
                data-[state=closed]:zoom-out-95
                data-[side=bottom]:slide-in-from-top-2 
                data-[side=top]:slide-in-from-bottom-2
              "
              side="right"
              sideOffset={5}
            >
              {text}
              <Tooltip.Arrow className="fill-[#2A2A2A]" />
            </Tooltip.Content>
          </Tooltip.Portal>
        )}
      </Tooltip.Root>
    </Tooltip.Provider>
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