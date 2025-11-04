import {asyncHandler} from "../utilities/asyncHandler.js";
import admin from "../utilities/firebaseAdmin.js";
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


    const {idToken  } = req.body;

    if(!idToken) throw new Error("idToken is required");

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if(!decodedToken) throw new Error("Invalid idToken")
    const {  email  } = decodedToken;
    if(!email ) throw new ApiError(400 , "Email not found in token");


     const exists = await prisma.User.findUnique({
         where:{
             email:email
         }

     });

    if(exists) {
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
                role:true
            }
        });
        const options = {
            httpOnly:true,
            secure:true
        };

        const log = await auditLog({
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


    const user = await prisma.User.create({
        data:{
            email:email,


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
            role:true
        }
    });

    const options = {
        httpOnly:true,
        secure:true
    };

    const log = await auditLog({
        userId:user.id,
        entity:"User",
        entityId:user.id,
        action:"CREATE",

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
    if(!user) throw new ApiError(500 , "Error logging out user");

    return res
        .status(201)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(200 , {} , "user logged out successfully"));


})


const adminLoginRegister = asyncHandler(async (req,res)=>{


    const {idToken} = req.body;
    if(!idToken) throw new ApiError("idToken is required");
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if(!decodedToken) throw new ApiError("Invalid idToken")
    const {  email } = decodedToken;
    // if(!email_verified) throw new ApiError(400 , "please verify your email before registering as admin");

    if(email !== process.env.ADMIN_EMAIL_VERIFY) throw new ApiError(403 , "Unauthorized to register as admin");
     const exists = await prisma.User.findUnique({
         where:{
             email:email
         }
        });

     if(exists) {

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
                 role:true
             }
         });
         if(!user_refreshed) throw new ApiError(500 , "Error refreshing admin user");


         const options = {
             httpOnly:true,
             secure:true
         };


         const log = await auditLog({
             userId:user_refreshed.id,
             entity:"User",
             entityId:user_refreshed.id,
             action:"LOGIN",

         })

         if(!log) throw new ApiError(500 , "login log not created")



         return res
             .status(201)
             .cookie("accessToken" , accessToken , options)
             .cookie("refreshToken" , refreshToken , options)
             .json(new ApiResponse(200 ,{
                 user:user_refreshed,
                 accessToken:accessToken,
                 refreshToken:refreshToken
             }, "Admin user logged in successfully" ));
     }


    const user = await prisma.User.create({
        data:{
            email:email,
            role:"ADMIN"
        }

    });
    if(!user) throw new ApiError( 500 , "Error creating admin user");
    const log = await auditLog({
        userId:user.id,
        entity:"User",
        entityId:user.id,
        action:"CREATE",

    })
    if(!log) throw new ApiError(500 , "admin register log not created");
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
        .json(new ApiResponse(201 , user , "Admin user registered successfully" ));

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
export {firebase_login  , logout ,refreshAccessToken  , adminLoginRegister  };