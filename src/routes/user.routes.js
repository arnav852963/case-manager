import {Router} from "express";
import {jwt_auth} from "../middlewares/jwt_auth.middleware.js";
import {admin_auth} from "../middlewares/admin_auth.middleware.js";
import {
    assignRoleToUser,
    createUser,
    deleteUser,
    getUserProfile,
    getUsers,
    searchUsers
} from "../controllers/user.controller.js";

import {manager_auth} from "../middlewares/manager_auth.middleware.js";

const userRoutes = Router();
userRoutes.route("/createUser").post(jwt_auth , admin_auth , createUser)
userRoutes.route("/getUsers").get(jwt_auth , admin_auth , getUsers)
userRoutes.route("/getProfile").get(jwt_auth , getUserProfile)
userRoutes.route("/assignRole/:userId").post(jwt_auth,admin_auth,assignRoleToUser)
userRoutes.route("/deleteUser/:userId").delete(jwt_auth,admin_auth,deleteUser)
userRoutes.route("/search").get(jwt_auth,manager_auth,searchUsers)

export  default  userRoutes;