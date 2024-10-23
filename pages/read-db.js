// pages/testdb.js
import clientPromise from '@/lib/mongodb';

export async function getServerSideProps() {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('sample_mflix'); // Replace 'sample_mflix' with your actual database name

    // Fetch documents from the collection
    const data = await db.collection('users') // Replace 'users' with your actual collection name
      .find({})
      .toArray();

    return {
      props: {
        data: JSON.parse(JSON.stringify(data)), // Serialize the MongoDB data
      },
    };
  } catch (error) {
    console.error(error);
    return {
      notFound: true, // Handle the error by returning a 404 or appropriate message
    };
  }
}

// Page component to display fetched data
export default function TestDB({ data }) {
  return (
    <div>
      <h1>Data from MongoDB</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
