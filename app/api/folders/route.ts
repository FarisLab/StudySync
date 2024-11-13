import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { ObjectId, WithId, Document } from 'mongodb';
import { Folder } from '../../types';
import { MongoDBFolder } from '../../types/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const userFolders = await db.collection('folders')
      .find({ userId: session.user.id })
      .toArray();

    const formattedFolders: Folder[] = userFolders.map((doc: WithId<Document>) => {
      const mongoFolder = doc as unknown as MongoDBFolder;
      return {
        ...mongoFolder,
        _id: mongoFolder._id.toString(),
      };
    });

    return NextResponse.json(formattedFolders);
  } catch (error) {
    console.error('Error in GET /api/folders:', error);
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('POST /api/folders - Session:', {
      id: session?.user?.id,
      name: session?.user?.name,
      email: session?.user?.email
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, theme, icon } = await req.json();
    const { db } = await connectToDatabase();

    // Create folder with explicit userId
    const folder = {
      name,
      theme,
      icon,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Creating folder with data:', folder);

    const result = await db.collection('folders').insertOne(folder);
    
    // Return the complete folder object with _id
    const newFolder = {
      _id: result.insertedId,
      ...folder
    };
    
    console.log('Created folder:', newFolder);

    // Verify folder was saved
    const savedFolder = await db.collection('folders').findOne({ _id: result.insertedId });
    console.log('Verified saved folder:', savedFolder);

    return NextResponse.json(newFolder, { status: 201 });
  } catch (error) {
    console.error('Error creating folder:', error);
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