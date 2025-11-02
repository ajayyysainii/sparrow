import { Router } from "express";
import { CallController } from "../controllers/call.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";
import checkAndDeductCredit from "../middlewares/credit.middleware.js";


const callController = new CallController();
const router = Router();


router.get("/call-list", verifyToken, callController.getCallList);
router.get("/total-cost", verifyToken, callController.getTotalCost);
router.post("/save", verifyToken, callController.saveCall);
router.get("/call-report-status/:callid", verifyToken, callController.checkCallReportStatus);
router.get("/call-report/:callid", verifyToken, checkAndDeductCredit, callController.getCallReport);

export default router;