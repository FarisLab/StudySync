import { ObjectId } from 'mongodb';

export interface MongoDBDocument {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoDBFolder extends MongoDBDocument {
  name: string;
  theme?: string;
  icon?: string;
  userId: string;
  parentId?: ObjectId;
}

export interface MongoDBTopic extends MongoDBDocument {
  type: string;
  title: string;
  folderId?: ObjectId;
  content?: string;
  userId: string;
} 