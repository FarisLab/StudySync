export type SpaceType = 'notes' | 'quiz' | 'flashcards' | 'study-guide' | 'solving' | 'learning' | 'research' | 'chatting';

export interface BaseSpace {
  _id: string;
  type: SpaceType;
  title: string;
  folderId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  description?: string;
  lastAccessed?: Date;
}

export interface NoteSpace extends BaseSpace {
  type: 'notes';
  content: {
    text: string;
    attachments?: {
      type: 'image' | 'file' | 'link';
      url: string;
      name: string;
    }[];
    lastEdited: Date;
    tags?: string[];
    collaborators?: string[];
    version?: number;
  };
}

export interface QuizSpace extends BaseSpace {
  type: 'quiz';
  content: {
    questions: QuizQuestion[];
    settings: QuizSettings;
    attempts: QuizAttempt[];
    lastAttempt?: Date;
    averageScore?: number;
    timeLimit?: number; // in minutes
  };
}

export interface FlashcardSpace extends BaseSpace {
  type: 'flashcards';
  content: {
    cards: Flashcard[];
    settings: FlashcardSettings;
    stats: FlashcardStats;
    lastReview?: Date;
    nextReview?: Date;
  };
}

export interface StudyGuideSpace extends BaseSpace {
  type: 'study-guide';
  content: {
    sections: StudySection[];
    objectives: string[];
    resources: Resource[];
    progress: number;
    estimatedTime: number; // in minutes
  };
}

// Supporting interfaces
interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points: number;
}

interface QuizSettings {
  shuffleQuestions: boolean;
  showExplanations: boolean;
  passingScore: number;
  allowRetries: boolean;
  timeLimit?: number;
}

interface QuizAttempt {
  date: Date;
  score: number;
  timeSpent: number;
  answers: {
    questionId: string;
    answer: string | number;
    correct: boolean;
  }[];
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  hints?: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  lastReviewed?: Date;
  nextReview?: Date;
  repetitions: number;
  easeFactor: number;
}

interface FlashcardSettings {
  reviewAlgorithm: 'spaced-repetition' | 'random' | 'sequential';
  showHints: boolean;
  autoPlay: boolean;
  cardsPerSession: number;
}

interface FlashcardStats {
  totalCards: number;
  mastered: number;
  learning: number;
  needsReview: number;
  averageEaseFactor: number;
}

interface StudySection {
  id: string;
  title: string;
  content: string;
  order: number;
  completed: boolean;
  timeSpent: number;
}

interface Resource {
  id: string;
  type: 'link' | 'file' | 'reference';
  title: string;
  url?: string;
  description?: string;
}

export type SpaceDocument = 
  | NoteSpace 
  | QuizSpace 
  | FlashcardSpace 
  | StudyGuideSpace; 