
import express from "express"
import cors from "cors"
import 'dotenv/config'
import connectDB from "./config/connectDB.js"
import MODULE_ROUTE_MAPPING from "./app.js";
import morgan from 'morgan'


const app = express();
const port=process.env.PORT || 4000

// Initialize server only after database connection
const startServer = async () => {
    try {
        // Wait for database connection
        await connectDB();
        
        // Verify connection before proceeding
        const mongoose = (await import("mongoose")).default;
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Database connection not established");
        }

        // Set up middleware
        app.use(cors({
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        })) 
        app.use(morgan("dev"))
        // Body parsers - these handle JSON and URL-encoded, but NOT multipart/form-data (multer handles that)
        app.use(express.json({ limit: '50mb' }))
        app.use(express.urlencoded({ extended: true, limit: '50mb' }));

        // Routes
        app.get("/",(req,res)=>{
            res.send("Call Backend !!")
        });

        MODULE_ROUTE_MAPPING.forEach(({prefix,router})=>{
            app.use(prefix,router);
        })

        app.listen(port, () => {
            console.log(`Server is connected to ${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
