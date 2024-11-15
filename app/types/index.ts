export interface Space {
  id: string
  name: string
  type: string
  timestamp: Date
}

export interface Folder {
  _id: string;
  name: string;
  theme: string;
  icon: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  _id: string;
  type: string;
  title: string;
  folderId?: string;
  content?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}