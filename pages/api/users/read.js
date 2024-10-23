// pages/api/users/read.js
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('sample_mflix'); // Use your database name

  try {
    const users = await db.collection('users').find({}).toArray(); // Fetch all users
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}