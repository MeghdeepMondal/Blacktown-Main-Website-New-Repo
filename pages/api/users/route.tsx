// pages/api/users/route.ts
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { PrismaClient } from '@prisma/client'; // Add this import

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('sample_mflix'); // Use your database name
  

  switch (req.method) {
    case 'POST':
      const { name, email, password } = req.body; // Assuming you're sending these fields
      try {
        const result = await db.collection('users').insertOne({ name, email, password });
        res.status(201).json(result.ops[0]); // Return the created user document
      } catch (error) {
        console.error('Database insert error:', error); // Log the error
        res.status(500).json({ error: 'Failed to create user' });
      }
      break;

    case 'GET':
      try {
        const users = await db.collection('users').find({}).toArray(); // Retrieve all users
        res.status(200).json(users); // Return the list of users
      } catch (error) {
        console.error('Database fetch error:', error); // Log the error
        res.status(500).json({ error: 'Failed to fetch users' });
      }
      break;

    case 'PUT':
      const { id, updatedData } = req.body; // Assuming you're sending the user ID and updated data
      try {
        const result = await db.collection('users').updateOne(
          { _id: new ObjectId(id) }, // Convert string ID to ObjectId
          { $set: updatedData }
        );
        if (result.modifiedCount === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully' });
      } catch (error) {
        console.error('Database update error:', error); // Log the error
        res.status(500).json({ error: 'Failed to update user' });
      }
      break;

    case 'DELETE':
      const { userId } = req.body; // Assuming you're sending the user ID to delete
      try {
        const result = await db.collection('users').deleteOne({ _id: new ObjectId(userId) }); // Convert string ID to ObjectId
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
      } catch (error) {
        console.error('Database delete error:', error); // Log the error
        res.status(500).json({ error: 'Failed to delete user' });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
}
