// pages/api/users/create.js
import { PrismaClient } from '@prisma/client'; // Import PrismaClient
const prisma = new PrismaClient(); // Initialize PrismaClient

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, password } = req.body; // Assuming you're sending these fields

    try {
      // Create a new user using Prisma
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password,
        },
      });
      res.status(201).json(user); // Return the created user document
    } catch (error) {
      console.error('Database insert error:', error); // Log the error
      res.status(500).json({ error: 'Failed to create user', details: error.message }); // Include error details
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}