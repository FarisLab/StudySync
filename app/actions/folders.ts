'use server'

import { connectToDatabase } from '../lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import { ObjectId, WithId, Document } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { MongoDBFolder } from '../types/mongodb';

// Types
interface FolderUpdateInput {
  id: string;
  name?: string;
  theme?: string;
  icon?: string;
}

interface Folder {
  _id: string;
  name: string;
  theme?: string;
  icon?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateFolderData {
  name: string;
  theme?: string;
  icon?: string;
}

// Helper function to convert ObjectId to string
const convertFolder = (folder: MongoDBFolder): Folder => ({
  _id: folder._id.toString(),
  name: folder.name,
  theme: folder.theme,
  icon: folder.icon,
  userId: folder.userId,
  createdAt: folder.createdAt,
  updatedAt: folder.updatedAt,
});

// Get all folders for current user
export async function getFolders(): Promise<Folder[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Unauthorized");
    }
    
    const userId = session.user.id;
    const { db } = await connectToDatabase();
    
    const userFolders = await db.collection('folders').find({ 
      userId: userId 
    }).toArray();
    
    return userFolders.map((doc: WithId<Document>) => 
      convertFolder(doc as unknown as MongoDBFolder)
    );
  } catch (error) {
    console.error('Error fetching folders:', error);
    throw new Error('Failed to fetch folders');
  }
}

// Create new folder
export async function createFolder(data: CreateFolderData): Promise<Folder> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Unauthorized");
    }

    const { db } = await connectToDatabase();

    const folder = {
      ...data,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('folders').insertOne(folder);
    
    const newFolder: Folder = convertFolder({
      _id: result.insertedId,
      ...folder
    });

    revalidatePath('/folders');
    return newFolder;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw new Error('Failed to create folder');
  }
}

// Delete folder
export async function deleteFolder(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Unauthorized");
    }

    const { db } = await connectToDatabase();

    // Verify ownership
    const folder = await db.collection('folders').findOne({
      _id: new ObjectId(id),
      userId: session.user.id
    });

    if (!folder) {
      throw new Error('Folder not found or unauthorized');
    }

    await db.collection('folders').deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id
    });

    revalidatePath('/folders');
    return { success: true };
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw new Error('Failed to delete folder');
  }
}

// Update folder
export async function updateFolder({ id, ...updateData }: FolderUpdateInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Unauthorized");
    }

    const { db } = await connectToDatabase();

    // Verify ownership
    const folder = await db.collection('folders').findOne({
      _id: new ObjectId(id),
      userId: session.user.id
    });

    if (!folder) {
      throw new Error('Folder not found or unauthorized');
    }

    await db.collection('folders').updateOne(
      { _id: new ObjectId(id), userId: session.user.id },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    revalidatePath('/folders');
    return { success: true };
  } catch (error) {
    console.error('Error updating folder:', error);
    throw new Error('Failed to update folder');
  }
} 