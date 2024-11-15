'use server'

import { connectToDatabase } from '@/app/lib/mongodb';
import { Folder } from '@/app/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { ObjectId } from 'mongodb';

export async function createFolder(data: { name: string; theme: string; icon: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { db } = await connectToDatabase();

    const folder = {
      name: data.name,
      theme: data.theme,
      icon: data.icon,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('folders').insertOne(folder);
    
    const newFolder: Folder = {
      _id: result.insertedId.toString(),
      name: folder.name,
      theme: folder.theme,
      icon: folder.icon,
      userId: folder.userId,
      createdAt: folder.createdAt.toISOString(),
      updatedAt: folder.updatedAt.toISOString()
    };

    return newFolder;
  } catch (error) {
    console.error('Error in createFolder:', error);
    throw error;
  }
}

export async function getFolders(): Promise<Folder[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { db } = await connectToDatabase();
    const folders = await db.collection('folders')
      .find({ userId: session.user.id })
      .sort({ name: 1 })
      .toArray();

    return folders.map(folder => ({
      _id: folder._id.toString(),
      name: folder.name,
      theme: folder.theme || 'default',
      icon: folder.icon || 'Folder',
      userId: folder.userId,
      createdAt: folder.createdAt.toISOString(),
      updatedAt: folder.updatedAt.toISOString()
    }));
  } catch (error) {
    console.error('Error in getFolders:', error);
    throw error;
  }
}

export async function deleteFolder(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { db } = await connectToDatabase();
    await db.collection('folders').deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id
    });

    return { success: true };
  } catch (error) {
    console.error('Error in deleteFolder:', error);
    throw error;
  }
}

export async function updateFolder(id: string, data: Partial<Folder>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { db } = await connectToDatabase();
    await db.collection('folders').updateOne(
      { _id: new ObjectId(id), userId: session.user.id },
      { $set: { ...data, updatedAt: new Date() } }
    );

    return { success: true };
  } catch (error) {
    console.error('Error in updateFolder:', error);
    throw error;
  }
} 