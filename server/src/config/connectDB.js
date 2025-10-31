import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        
        if (!mongoUri) {
            throw new Error("MONGO_URI environment variable is not set");
        }
        
        if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
            throw new Error(`Invalid MONGO_URI format. Expected "mongodb://" or "mongodb+srv://", got: ${mongoUri.substring(0, 20)}...`);
        }
        
        // Connect to MongoDB
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        
    } catch (error) {
        console.error("Error in connecting Database:", error.message);
        process.exit(1);
    }  
}

export default connectDB