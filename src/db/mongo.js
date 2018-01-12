import {MongoClient as mongoClient} from 'mongodb';

let client;

async function connect() {
  // Connection URL
  const url = 'mongodb://localhost:27017';
  // Database Name
  const dbName = 'eksisong';

  try {
    client = await mongoClient.connect(url);
    console.log('Connected to Mongo');
  } catch (err) {
    console.log(err.stack);
  }
}

async function insertOne(object, collectionName, dbName = 'eksisong') {
  try {
    let count = await client.db(dbName).collection(collectionName).find(object).count();
    if (count > 0) {
      return;
    } else {
      await client.db(dbName).collection(collectionName).insertOne(object);
    }
  } catch (err) {
    console.log(err.stack);
  }
}

export {connect, insertOne};
