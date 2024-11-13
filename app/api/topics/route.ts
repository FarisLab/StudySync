import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId, WithId, Document } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { Topic } from '../../types';
import { MongoDBTopic } from '../../types/mongodb';

interface TopicQuery {
  userId: string;
  folderId?: ObjectId;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');

    const { db } = await connectToDatabase();
    
    // Verify the folder belongs to the user if folderId is provided
    if (folderId) {
      const folder = await db.collection('folders').findOne({
        _id: new ObjectId(folderId),
        userId: session.user.id
      });

      if (!folder) {
        return NextResponse.json({ error: 'Folder not found or unauthorized' }, { status: 404 });
      }
    }

    const query: TopicQuery = {
      userId: session.user.id,
      ...(folderId && { folderId: new ObjectId(folderId) }),
    };

    const topics = await db.collection('topics')
      .find(query)
      .sort({ updatedAt: -1 })
      .toArray();

    // Convert _id and folderId to string using MongoDBTopic type
    const formattedTopics: Topic[] = topics.map((doc: WithId<Document>) => {
      const mongoTopic = doc as unknown as MongoDBTopic;
      return {
        ...mongoTopic,
        _id: mongoTopic._id.toString(),
        folderId: mongoTopic.folderId ? mongoTopic.folderId.toString() : undefined,
      };
    });

    return NextResponse.json(formattedTopics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, title, folderId, content } = await req.json();
    const { db } = await connectToDatabase();

    // Verify folder belongs to user before creating topic
    if (folderId) {
      const folder = await db.collection('folders').findOne({
        _id: new ObjectId(folderId),
        userId: session.user.id
      });

      if (!folder) {
        return NextResponse.json({ error: 'Folder not found or unauthorized' }, { status: 404 });
      }
    }

    const topic = {
      type,
      title,
      folderId: folderId ? new ObjectId(folderId) : null,
      content,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('topics').insertOne(topic);

    const newTopic: Topic = {
      _id: result.insertedId.toString(),
      type: topic.type,
      title: topic.title,
      folderId: topic.folderId ? topic.folderId.toString() : undefined,
      content: topic.content,
      userId: topic.userId,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
    };

    return NextResponse.json(newTopic, { status: 201 });
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
} 