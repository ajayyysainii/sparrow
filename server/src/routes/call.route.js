import { Router } from "express";
import { CallController } from "../controllers/call.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";


const callController = new CallController();
const router = Router();


router.get("/call-list", verifyToken, callController.getCallList);
router.post("/save", verifyToken, callController.saveCall);
router.get("/call-report-status/:callid", verifyToken, callController.checkCallReportStatus);
router.get("/call-report/:callid", verifyToken, callController.getCallReport);

export default router;