import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDatabase = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`, {
            /*serverSelectionTimeoutMS:8000,
            socketTimeoutMS: 45000,
            connectTimeoutMS:10000,*/
        }) ;
          console.log("MongodB connected successfuly");
             console.log("MongoDB host:", mongoose.connection.host);
        console.log("MongoDB name:", mongoose.connection.name);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1)
    }
}


export default connectDatabase;