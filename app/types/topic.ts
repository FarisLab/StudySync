import { ObjectId } from 'mongodb';

export interface Topic {
  _id: ObjectId;
  type: 'notes' | 'quiz' | 'flashcards';
  title: string;
  folderId: ObjectId;
  content: {
    text?: string;
    questions?: Array<{
      question: string;
      answer: string;
    }>;
    cards?: Array<{
      front: string;
      back: string;
    }>;
    lastEdited: Date;
  };
  userId: string;
  createdAt: Date;
  updatedAt: Date;
} 