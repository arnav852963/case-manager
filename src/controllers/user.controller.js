import {asyncHandler} from "../utilities/asyncHandler.js";
import admin from "firebase-admin";
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config({
    path:"./.env"
})

const generateAccessRefreshToken = (info_access , info_refresh)=>{
    const accessToken = jwt.sign(info_access , process.env.ACCESS_TOKEN_SECRET , {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })

    const refreshToken = jwt.sign(info_refresh , process.env.REFRESH_TOKEN_SECRET , {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })

    return {
        accessToken:accessToken,
        refreshToken:refreshToken
    }

}




const register = asyncHandler(async (req,res)=>{

    



})