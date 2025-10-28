import {Router} from "express";
import {adminLoginRegister, firebase_login, logout, refreshAccessToken} from "../controllers/auth.controller.js";
import {jwt_auth} from "../middlewares/jwt_auth.middleware.js";

const authRoutes = Router();

authRoutes.route("/firebaseLogin").post(firebase_login);
authRoutes.route("/logout").patch(jwt_auth , logout)
authRoutes.route("/refresh").patch(refreshAccessToken)
authRoutes.route("/adminAuth").post(adminLoginRegister)

export default authRoutes