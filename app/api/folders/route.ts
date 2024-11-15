import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { ObjectId } from 'mongodb';
import { Folder } from '../../types';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const userFolders = await db.collection('folders')
      .find({ userId: session.user.id })
      .sort({ name: 1 })
      .toArray();

    const formattedFolders = userFolders.map(folder => ({
      _id: folder._id.toString(),
      name: folder.name,
      theme: folder.theme || 'default',
      icon: folder.icon || 'Folder',
      userId: folder.userId,
      createdAt: folder.createdAt.toISOString(),
      updatedAt: folder.updatedAt.toISOString()
    }));

    return NextResponse.json(formattedFolders);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in GET /api/folders:', error);
    }
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
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

    return NextResponse.json(newFolder);
  } catch (error) {
    console.error('Error in POST /api/folders:', error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // First verify the folder belongs to the user
    const folder = await db.collection('folders').findOne({
      _id: new ObjectId(id),
      userId: session.user.id
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found or unauthorized' }, { status: 404 });
    }

    // Then delete it
    await db.collection('folders').deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();
    const { db } = await connectToDatabase();

    // First verify the folder belongs to the user
    const folder = await db.collection('folders').findOne({
      _id: new ObjectId(id),
      userId: session.user.id
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found or unauthorized' }, { status: 404 });
    }

    // Then update it
    await db.collection('folders').updateOne(
      { _id: new ObjectId(id), userId: session.user.id },
      { $set: { ...req.body, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 });
  }
} 