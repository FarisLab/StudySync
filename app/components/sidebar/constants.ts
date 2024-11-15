import { Mouse, FileBox, Camera, Eraser, TestTube, Trash, Folder, Send, Inbox } from 'lucide-react';

// Icon components mapping
export const iconComponents = {
  'Computer Mouse': Mouse,
  'Photo Stack': FileBox,
  'Camera': Camera,
  'Eraser': Eraser,
  'Test Tube': TestTube,
  'Trash': Trash,
  'Folder': Folder,
  'Paperplane': Send,
  'Tray': Inbox,
} as const;

// Theme colors mapping
export const themeColors = {
  lime: '#84cc16',
  lychee: '#ec4899',
  mango: '#f97316',
  plum: '#a855f7',
  blueberry: '#3b82f6',
  kiwi: '#22c55e',
  pitaya: '#d946ef',
  smoothie: '#06b6d4',
  macaron: '#f43f5e',
} as const;

export type IconType = keyof typeof iconComponents;
export type ThemeType = keyof typeof themeColors; 