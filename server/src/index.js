
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

        // Set up middleware - CORS configuration
        const allowedOrigins = [
            process.env.FRONTEND_URL // Additional frontend URL from env
        ].filter(Boolean); // Remove undefined values
        
        app.use(cors({
            origin: function (origin, callback) {
                // Allow requests with no origin (like mobile apps, Postman, etc.)
                if (!origin) return callback(null, true);
                
                // Check if origin is in allowed list
                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    // In development, allow localhost on any port
                    if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) {
                        callback(null, true);
                    } else {
                        callback(new Error('Not allowed by CORS'));
                    }
                }
            },
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
