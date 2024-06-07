
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://user:${process.env.NEXT_MONGO_PASS}@bot.kit2lhj.mongodb.net/?retryWrites=true&w=majority&appName=Bot`;

const connect = async () => {
    mongoose.connect( uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export default async function run(data) {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const dbName = "personal_website";
    const collectionName = "messages";
  
    // Create references to the database and collection in order to run
    // operations on them.
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    try {
      const result = await collection.insertOne(data);
      console.log(`documents successfully inserted.\n`);
    } catch (err) {
      console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
    }
  
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}


