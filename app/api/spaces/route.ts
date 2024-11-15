import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { SpaceDocument } from '@/app/types/topics';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');

    if (!folderId) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Verify the folder belongs to the user
    const folder = await db.collection('folders').findOne({
      _id: new ObjectId(folderId),
      userId: session.user.id
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found or unauthorized' }, { status: 404 });
    }

    const spaces = await db.collection('spaces')
      .find({
        folderId: new ObjectId(folderId),
        userId: session.user.id
      })
      .sort({ updatedAt: -1 })
      .toArray();

    // Convert MongoDB ObjectIds to strings
    const formattedSpaces = spaces.map(space => ({
      ...space,
      _id: space._id.toString(),
      folderId: space.folderId.toString()
    }));

    return NextResponse.json(formattedSpaces);
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching spaces:', error);
    }
    return NextResponse.json({ error: 'Failed to fetch spaces' }, { status: 500 });
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

    // Verify folder belongs to user
    if (data.folderId) {
      const folder = await db.collection('folders').findOne({
        _id: new ObjectId(data.folderId),
        userId: session.user.id
      });

      if (!folder) {
        return NextResponse.json({ error: 'Folder not found or unauthorized' }, { status: 404 });
      }
    }

    const space = {
      ...data,
      folderId: new ObjectId(data.folderId),
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('spaces').insertOne(space);

    const newSpace: SpaceDocument = {
      ...space,
      _id: result.insertedId.toString(),
      folderId: space.folderId.toString(),
    };

    return NextResponse.json(newSpace);
  } catch (error) {
    console.error('Error creating space:', error);
    return NextResponse.json({ error: 'Failed to create space' }, { status: 500 });
  }
} 