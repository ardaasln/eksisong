import {MongoClient as mongoClient} from 'mongodb';
import assert from 'assert';

async function connect() {
  // Connection URL
  const url = 'mongodb://localhost:27017';
  // Database Name
  const dbName = 'eksisong';

  let client;

  try {
    client = await mongoClient.connect(url);
    console.log('Connected to Mongo');

    const db = client.db(dbName);
    return db;
  } catch (err) {
    console.log(err.stack);
  }
}

export {connect};
