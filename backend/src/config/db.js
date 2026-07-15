import mongoose from "mongoose";

/**
 * Connects to the MongoDB database using the MONGODB_URI environment variable.
 * Uses Mongoose's connect method and returns the connection instance.
 * Throws an error and exits the process if the connection fails,
 * preventing the server from starting in a broken state.
 */
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);

    console.log(
      `MongoDB connected! Host: ${connectionInstance.connection.host}`
    );

    return connectionInstance;
  } catch (error) {
    console.error(" MongoDB connection failed:", error.message);
    process.exit(1); // Exit with failure code so the process doesn't run without a DB
  }
};

export default connectDB;
