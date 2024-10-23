// pages/api/users/delete.js
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb'; // Import ObjectId

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const client = await clientPromise;
    const db = client.db('sample_mflix'); // Use your database name

    const { id } = req.body; // Assuming you're sending the document ID to delete

    try {
      const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}