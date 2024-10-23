// pages/api/users/update.js
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb'; // Import ObjectId

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const client = await clientPromise;
    const db = client.db('sample_mflix'); // Use your database name

    const { id, name, email, password } = req.body; // Assuming you're sending these fields

    try {
      const result = await db.collection('users').updateOne(
        { _id: new ObjectId(id) }, // Use ObjectId for MongoDB document ID
        { $set: { name, email, password } }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}