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
    const {  email , name , role, email_verified } = decodedToken;
    if(!email_verified) throw new ApiError(400 , "please verify your email before logging in");

     const exists = await prisma.User.findUnique({
         where:{
             email:email
         }

     });

    if(exists && !exists.byAdmin) throw new ApiError(400 , "user already exists , please login instead");
    if(exists && exists.byAdmin) {
        const {accessToken , refreshToken} = generateAccessRefreshToken({
            id:exists.id,
            role:exists.role,

        } , {
            id:exists.id
        });
        if(!accessToken || !refreshToken) throw new ApiError(500 , "Error generating tokens");
        const user_refreshed = await prisma.User.update({
            where:{
                id:exists.id
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
            userId:exists.id,
            entity:"User",
            entityId:exists.id,
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
    }

    if(role === "ADMIN") {
        if(email !== process.env.ADMIN_EMAIL_VERIFY) throw new ApiError(400 , "not authorised to sign in as admin")
    }
    const user = await prisma.User.create({
        data:{
            email:email,
            username:name,
            role:role
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

export {firebase_login  , logout };