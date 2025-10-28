import {Router} from "express";
import {jwt_auth} from "../middlewares/jwt_auth.middleware.js";
import {admin_auth} from "../middlewares/admin_auth.middleware.js";
import admin from "firebase-admin";
import {getLogs, getUsers, getUsersByRole, getAllPayments, systemInfo , assignRoleToUser , getCasesAdmin} from "../controllers/admin.controller.js";


const adminRoutes= Router();
adminRoutes.use(jwt_auth , admin_auth)

adminRoutes.route("/getLogs").get(getLogs)
adminRoutes.route("/getUsers").get(getUsers)
adminRoutes.route("/getUserByRole").get(getUsersByRole)
adminRoutes.route("/getAllPayments").get(getAllPayments)
adminRoutes.route("/getSystemInfo").get(systemInfo)
adminRoutes.route("/assignRole/:userId").post(assignRoleToUser)
adminRoutes.route("/getCasesAdmin").get( getCasesAdmin);


export default adminRoutes