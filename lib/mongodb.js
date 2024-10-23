import { MongoClient } from 'mongodb';

//Remove this later Raj!
console.log('Mongo URI:', process.env.MONGODB_URI);

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to ensure the client is reused
  if (!global._mongoClient) {
    client = new MongoClient(uri, options);
    global._mongoClient = client;
  }
  clientPromise = global._mongoClient.connect();
} else {
  // In production mode, it's better to create a new client instance
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
