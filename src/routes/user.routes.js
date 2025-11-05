import {Router} from "express";
import {jwt_auth} from "../middlewares/jwt_auth.middleware.js";
import {admin_auth} from "../middlewares/admin_auth.middleware.js";
import {
     changePassword, completeProfile,
    createUser,

    getUserProfile,

    searchUsers
} from "../controllers/user.controller.js";

import {manager_auth} from "../middlewares/manager_auth.middleware.js";
import {logout} from "../controllers/auth.controller.js";

const userRoutes = Router();
userRoutes.route("/createUser").post(jwt_auth , admin_auth , createUser) // -
userRoutes.route("/completeProfile").patch(jwt_auth , completeProfile) // -
userRoutes.route("/getProfile").get(jwt_auth , getUserProfile)

userRoutes.route("/search").get(jwt_auth,manager_auth,searchUsers) // -
userRoutes.route("/changePassword").patch(jwt_auth , changePassword)
export  default  userRoutes;