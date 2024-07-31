const { MongoClient } = require('mongodb');
const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

async function duplicateDocuments() {
  try {
    await client.connect();
    const database = client.db('drumshopdb');
    const collection = database.collection('events');

    const documents = await collection.find().toArray();

    const newDocuments = documents.map(doc => {
      const newDoc1 = { ...doc };
      const newDoc2 = { ...doc };
      delete newDoc1._id;
      delete newDoc2._id;
      return [newDoc1, newDoc2];
    }).flat();

    await collection.insertMany(newDocuments);
  } finally {
    await client.close();
  }
}

duplicateDocuments().catch(console.error);
