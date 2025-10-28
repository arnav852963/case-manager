import {asyncHandler} from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import {prisma} from "../utilities/prisma.js";
import {ApiResponse} from "../utilities/ApiResponse.js";
import {encryptPassword} from "../utilities/encrypt.js";
import admin from "../utilities/firebaseAdmin.js";
import {auditLog} from "../utilities/auditlog.js";

const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;


    const existingUser = await prisma.User.findUnique({ where: { email } });
    if (existingUser) {
        throw new ApiError(400, "User with this email already exists");
    }
try {
    const firebaseuser = await admin.auth().createUser({
        email,
        password,
        displayName: name
    })
    if(!firebaseuser) throw new ApiError(500, "Failed to create user in Firebase");
} catch (e) {
    throw new ApiError(500, "Failed to create user in Firebase");
}

    const newUser = await prisma.User.create({
        data: {
            username:name,
            email:email,
            password:encryptPassword(password),
            role:role,
            byAdmin:true
        },
        select:{
            password:false
        }
    });



    if(!newUser) throw new ApiError(500, "Failed to create user");
    const log = auditLog({
        userId:req.user.id,
        entity:"User",
        entityId:newUser.id,
        action:"CREATE"

    })
    if(!log) throw new ApiError(500 , "user log not created");

    res.status(201).json(new ApiResponse(201, newUser, "User created successfully"));

});


const getUserProfile= asyncHandler(async (req,res)=>{
    const userId = req?.user?.id;
    if(req?.user?.role !=="CLIENT"){

    }
    const user = await prisma.User.findUnique({
        where:{
            id:userId
        },
        select:{
            username:true,
            email:true,
            role:true,
            createdAt:true,
            isActive:true,
            casesCreated:{

                id:true,
                description:true,
                status:true,
                createdAt:true,


            },
            casesAssigned:{
                id:true,
                description:true,
                status:true,
                createdAt:true,

            },
            payments:true,
            attachments:true


        }



    });
    if(!user) throw new ApiError(404, "User not found");

    res.status(200).json(new ApiResponse(200, user, "User profile fetched successfully"));
});






const  deleteUser = asyncHandler(async (req,res)=>{
    const {userId} = req.params
    if(!userId) throw new ApiError(400, "User ID is required")

    const user = await prisma.User.delete({
        where:{id:userId}
    })
    if(!user) throw new ApiError(404, "User not found")
    const log = await auditLog({
        userId:req.user.id,
        entity:"User",
        entityId:user.id,
        action:"DELETE"

    })
    if(!log) throw new ApiError(500 , "user log not created");

    res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"))
});




const searchUsers = asyncHandler(async (req,res)=>{
    const {query } = req.query;
    if(!query.trim()) throw new ApiError(400, "Search query is required");
  let {page} = req.query;
    page = page ? parseInt(page) : 1;
    const skip = (page -1) * 10;
    const users = await prisma.User.findMany({
        where:{
            OR:[
                {username:{contains:query , mode:"insensitive"}},
                {email:{contains:query , mode:"insensitive"}}
            ],
            role:{not:"ADMIN"}
        },
        skip:skip,
        take:10,
        orderBy:{createdAt:"desc"},

    });
    if(!users || users.length ===0) throw new ApiError(404, "No users found matching the query");
    return res
        .status(200)
        .json(new ApiResponse(200, {
            users:users

        }, "users fetched successfully"));

});


const changePassword = asyncHandler(async (req,res)=>{
    const {oldPassword , newPassword , confirmPassword} = req.body;
    if(!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) throw new ApiError(400 , "All fields are required");
    if(newPassword !== confirmPassword) throw new ApiError(400 , "New password and confirm password do not match");
    const firebase = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: req?.user?.email,
                password: oldPassword,
                returnSecureToken: true,
            }),
        }
    );

    const data = await firebase.json();
    if (data.error) throw new ApiError(401, "Invalid old password");
    await admin.auth().updateUser(data.localId, { password: newPassword });
    const log = auditLog({
        userId:req.user.id,
        entity:"User",
        entityId:req.user.id,
        action:"PASSWORD_RESET"

    })
    if(!log) throw new ApiError(500 , "user log not created");
    return res
        .status(200)
        .json(new ApiResponse(200 , {} , "Password changed successfully , kindly login again"));

});

export { createUser ,  getUserProfile ,  deleteUser,searchUsers , changePassword};