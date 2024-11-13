export interface BaseDocument {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends BaseDocument {
  name?: string;
  email: string;
  image?: string;
  emailVerified?: Date;
}

export interface FolderDocument extends BaseDocument {
  name: string;
  icon: string;
  theme: string;
  userId: string;
  spaces?: SpaceDocument[];
}

export interface SpaceDocument extends BaseDocument {
  type: 'notes' | 'quiz' | 'flashcards';
  title: string;
  content: any;
  folderId: string;
  userId: string;
} 