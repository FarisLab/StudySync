import clientPromise from './mongodb-adapter';

export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db("studysync");
  return { db, client };
}