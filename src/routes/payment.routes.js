import {Router} from "express";
import {jwt_auth} from "../middlewares/jwt_auth.middleware.js";
import {
    createPayment, downloadInvoice,
    getAllPayments,
    getPaymentsByCaseId,
    giveRefund,
    updatePayment
} from "../controllers/payment.controller.js";
import {finance_auth} from "../middlewares/finance_auth.middleware.js";

const paymentRoutes = Router();
paymentRoutes.use(jwt_auth)

paymentRoutes.route("/createPayment").post(createPayment);
paymentRoutes.route("/updatePayment/:paymentId").patch( finance_auth , updatePayment);
paymentRoutes.route("/getPaymentsByCase/:caseId").get( finance_auth , getPaymentsByCaseId);
paymentRoutes.route("/getAllPayments").get( finance_auth , getAllPayments);
paymentRoutes.route("/refund").post(finance_auth , giveRefund)
paymentRoutes.route("/download").get(jwt_auth , downloadInvoice)
export default paymentRoutes