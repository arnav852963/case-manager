import {asyncHandler} from "../utilities/asyncHandler.js";
import admin from "firebase-admin";
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
import {prisma} from "../utilities/prisma.js";
import {ApiError} from "../utilities/ApiError.js";
import {ApiResponse} from "../utilities/ApiResponse.js";
import {auditLog} from "../utilities/auditlog.js";
dotenv.config({
    path:"./.env"
})

const generateAccessRefreshToken =  (info_access , info_refresh)=>{
    const accessToken =  jwt.sign(info_access , process.env.ACCESS_TOKEN_SECRET , {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });

    const refreshToken = jwt.sign(info_refresh , process.env.REFRESH_TOKEN_SECRET , {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    });

    return {
        accessToken:accessToken,
        refreshToken:refreshToken
    }

};






const firebase_login = asyncHandler(async (req,res)=>{
    const {idToken} = req.body;

    if(!idToken) throw new Error("idToken is required");

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if(!decodedToken) throw new Error("Invalid idToken")
    const {  email , name , email_verified } = decodedToken;
    if(!email_verified) throw new ApiError(400 , "please verify your email before logging in");

     const exists = await prisma.User.findUnique({
         where:{
             email:email
         }

     });

    if(exists) throw new ApiError(400 , " please login using normal login");


    const user = await prisma.User.create({
        data:{
            email:email,
            username:name,

        }

    });
    if(!user) throw new ApiError( 500 , "Error creating user");
    const {accessToken , refreshToken} = generateAccessRefreshToken({
        id:user.id,
        role:user.role,

    } , {
        id:user.id
    });
    if(!accessToken || !refreshToken) throw new ApiError(500 , "Error generating tokens");
    const user_refreshed = await prisma.User.update({
        where:{
            id:user.id
        },
        data:{
            refreshToken:refreshToken
        },
        select:{
            id:true,
            email:true,
            username:true,
            role:true
        }
    });
    const options = {
        httpOnly:true,
        secure:true
    };

    const log = auditLog({
        userId:user.id,
        entity:"User",
        entityId:user.id,
        action:"LOGIN",

    })
    if(!log) throw new ApiError(500 , "login log not created");

    return res
        .status(201)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , refreshToken , options)
        .json(new ApiResponse(200 ,{
            user:user_refreshed,
            accessToken:accessToken,
            refreshToken:refreshToken
        }, "user logged in successfully via firebase" ));




    



})


const logout = asyncHandler(async (req,res)=>{
    const user = await prisma.User.update({
        where:{
            id:req.user.id
        },
        data:{
            refreshToken:null
        }

    });
    const log = auditLog({
        userId:user.id,
        entity:"User",
        entityId:user.id,
        action:"LOGOUT",

    })
    if(!log) throw new ApiError(500 , "login log not created");

    return res
        .status(201)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(200 , {} , "user logged out successfully"));


})


const adminRegister = asyncHandler(async (req,res)=>{
    // This function can be implemented to register admin users if needed
});

const adminLogin = asyncHandler(async (req,res)=>{
    // This function can be implemented to login admin users if needed
});

const managerFinanceLogin = asyncHandler(async (req,res)=>{
    // This function can be implemented to login manager and finance users if needed
});

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const token = req?.cookies?.refreshToken;
    if(!token) throw new ApiError(401 , "Login required");
    const decoded = await jwt.verify(token , process.env.REFRESH_TOKEN_SECRET);
    if(!decoded) throw new ApiError(401 , "Invalid refresh token , login required");
    const user = await prisma.User.findUnique({
        where:{
            id:decoded.id
        }

    });
    if(!user) throw new ApiError(401 , "Invalid refresh token , login required");
    if(user.refreshToken !== token) throw new ApiError(401 , "Token mismatch , login required");
    const {accessToken , refreshToken} = generateAccessRefreshToken({
        id:user.id,
        role:user.role

    } , {
        id:user.id
    });
    if(!accessToken || !refreshToken) throw new ApiError(500 , "Error generating tokens");
    const user_refreshed = await prisma.User.update({
        where:{
            id:user.id
        },
        data:{
            refreshToken:refreshToken
        },
        select:{
            id:true,
            email:true,
            username:true,
            role:true
        }
    });
    const options = {
        httpOnly:true,
        secure:true
    };

    return res
        .status(201)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , refreshToken , options)
        .json(new ApiResponse(200 ,{
            user:user_refreshed,
            accessToken:accessToken,
            refreshToken:refreshToken
        }, "Access token refreshed successfully" ));

});
export {firebase_login  , logout ,refreshAccessToken   };