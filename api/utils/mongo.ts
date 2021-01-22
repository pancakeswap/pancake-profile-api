import mongoose, { Mongoose } from "mongoose";

let cachedDb: Mongoose | null = null;

/**
 * @see https://vercel.com/guides/deploying-a-mongodb-powered-api-with-node-and-vercel
 */
export const connectToDatabase = async (): Promise<Mongoose> => {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGO_URI ?? "mongodb://localhost:27017/";
  const client = await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    dbName: process.env.MONGO_DATABASE,
  });

  cachedDb = client;
  return client;
};
