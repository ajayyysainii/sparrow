
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
                    // Default to development mode if NODE_ENV is not explicitly set to 'production'
                    const isProduction = process.env.NODE_ENV === 'production';
                    
                    if (!isProduction) {
                        // In development, allow localhost and 127.0.0.1 on any port (http or https)
                        const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
                                           origin.startsWith('http://localhost:') || 
                                           origin.startsWith('http://127.0.0.1:') ||
                                           origin.startsWith('https://localhost:') ||
                                           origin.startsWith('https://127.0.0.1:');
                        if (isLocalhost) {
                            callback(null, true);
                        } else {
                            // Log for debugging
                            console.log('CORS blocked origin (dev mode):', origin);
                            callback(new Error('Not allowed by CORS'));
                        }
                    } else {
                        // In production, only allow specific origins
                        console.log('CORS blocked origin (prod mode):', origin);
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
