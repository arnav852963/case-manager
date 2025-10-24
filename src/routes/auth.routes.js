import {Router} from "express";
import {firebase_login, logout} from "../controllers/auth.controller.js";
import {jwt_auth} from "../middlewares/jwt_auth.middleware.js";

const authRoutes = Router();

authRoutes.route("/firebaseLogin").post(firebase_login);
authRoutes.route("/logout").patch(jwt_auth , logout)


export default authRoutes