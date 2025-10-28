import jwt from "jsonwebtoken";
import {asyncHandler} from "../utilities/asyncHandler.js";
import {ApiError} from "../utilities/ApiError.js";
export const finance_auth = asyncHandler(async (req,_,next)=>{
    try {
        const token = req?.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) throw new ApiError("please login to access this resource");

        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decodedToken) throw new ApiError("Invalid token");
        if (decodedToken.role !== "FINANCE") throw new ApiError(403, "you are not authorized to access this resource")

        next();
    } catch (e){
        throw new ApiError(401, `error in jwt_auth middleware -->${e.message}`);
    }


})