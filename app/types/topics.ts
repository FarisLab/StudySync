export type SpaceType = 'notes' | 'quiz' | 'writing' | 'flashcards' | 'study-guide' | 'solving' | 'learning' | 'research' | 'chatting';

export interface BaseSpace {
  _id: string;
  type: SpaceType;
  title: string;
  folderId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteSpace extends BaseSpace {
  type: 'notes';
  content: {
    text: string;
    attachments?: string[];
    lastEdited: Date;
    tags?: string[];
  };
}

export interface QuizSpace extends BaseSpace {
  type: 'quiz';
  content: {
    questions: {
      question: string;
      options: string[];
      answer: number;
    }[];
    lastAttempt?: Date;
    score?: number;
  };
}

export interface FlashcardSpace extends BaseSpace {
  type: 'flashcards';
  content: {
    cards: {
      front: string;
      back: string;
    }[];
    lastReview?: Date;
    mastery?: number;
  };
}

export type SpaceDocument = NoteSpace | QuizSpace | FlashcardSpace; 