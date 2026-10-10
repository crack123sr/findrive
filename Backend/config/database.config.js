import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let connectionPromise;

const connectDatabase = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI environment variable is required");
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGODB_URI)
            .then(({ connection }) => {
                console.log("MongoDB connected successfully");
                console.log("MongoDB host:", connection.host);
                console.log("MongoDB name:", connection.name);
                return connection;
            })
            .catch((error) => {
                connectionPromise = undefined;
                console.error("Error connecting to MongoDB:", error);
                throw error;
            });
    }

    try {
        return await connectionPromise;
    } finally {
        if (mongoose.connection.readyState === 1) {
            connectionPromise = undefined;
        }
    }
};

export default connectDatabase;