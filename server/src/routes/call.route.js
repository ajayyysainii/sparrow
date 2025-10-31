import { Router } from "express";
import { CallController } from "../controllers/call.controller.js";


const callController = new CallController();
const router = Router();


router.get("/call-list", callController.getCallList);
router.get("/call-report-status/:callid", callController.checkCallReportStatus);
router.get("/call-report/:callid", callController.getCallReport);

export default router;