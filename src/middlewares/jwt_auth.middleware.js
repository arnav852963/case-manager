import jwt from "jsonwebtoken";
import {asyncHandler} from "../utilities/asyncHandler.js";
import {ApiError} from "../utilities/ApiError.js";

import {prisma} from "../utilities/prisma.js";

export const jwt_auth = asyncHandler(async (req,_,next)=>{
    try {
        const token = req?.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) throw new ApiError("please login to access this resource");

        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decodedToken) throw new ApiError("Invalid token");
        const user = await prisma.User.findUnique({
            where:{
                id:decodedToken?.id
            }
        })
        if(!user) throw new ApiError(500 , "user not found ")
        req.user = user;
        next();


    } catch (e) {
        throw new ApiError(401, `error in jwt_auth middleware -->${e.message}`);

    }
})

