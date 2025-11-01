import { chatWithBot } from "../controllers/aimodel.controller.js";
import { diagnose, getReports } from "../controllers/aimodel.controller.js";
import { Router } from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = "./uploads";
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept audio files
        if (file.mimetype.startsWith('audio/') || file.originalname.toLowerCase().endsWith('.wav')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    }
});

const router = Router();

router.post("/chat", chatWithBot);



router.post("/process_audio",verifyToken, upload.single("audio"), diagnose);


router.get("/reports",verifyToken,getReports);

export default router;