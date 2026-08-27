import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

export const dbConnect = async function (): Promise<void> {
  if (connection.isConnected) {
    return;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  try {
    const db = await mongoose.connect(uri);
    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    connection.isConnected = undefined;
    throw error instanceof Error ? error : new Error("MongoDB connection failed");
  }
};
