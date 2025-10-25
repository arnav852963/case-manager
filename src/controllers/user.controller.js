import {asyncHandler} from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import {prisma} from "../utilities/prisma.js";
import {ApiResponse} from "../utilities/ApiResponse.js";
import {encryptPassword} from "../utilities/encrypt.js";


const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;


    const existingUser = await prisma.User.findUnique({ where: { email } });
    if (existingUser) {
        throw new ApiError(400, "User with this email already exists");
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

    res.status(201).json(new ApiResponse(201, newUser, "User created successfully"));

});

const getUsers = asyncHandler(async (req, res) => {
    const users = await prisma.User.findMany({
        where:{
            role:{not:"admin"}
        },
        select:{
            password:false
        }
    });
    if(!users || users.length ===0) throw new ApiError(500, "No users found");
    const managers = []
    const finance =[]
    users.forEach((user)=>{
        if(user.role ==="manager") {managers.push(user)}
         if(user.role ==="finance") finance.push(user)

    })


    res.status(200).json(new ApiResponse(200, {
        users:users,
        totalUsers:users.length,
        managers:managers,
        finance:finance,
        totalManagers:managers.length,
        totalFinance:finance.length
    }, "Users fetched successfully"));
});

const getUserProfile= asyncHandler(async (req,res)=>{
    const userId = req.user.id;
    const user = await prisma.User.findUnique({
        where:{id:userId},
        select:{
            password:false,
            refreshToken:false
        }
    });
    if(!user) throw new ApiError(404, "User not found");

    res.status(200).json(new ApiResponse(200, user, "User profile fetched successfully"));
});

const assignRoleToUser = asyncHandler(async (req,res)=>{
    const {userId}= req.params
    const {role} = req.body
    if(!userId || !role) throw new ApiError(400, "All fields are required")
    const user = await prisma.User.update({
        where:{id:userId},
        data:{role:role},
        select:{
            password:false,
            refreshToken:false
        }
    })
    if(!user) throw new ApiError(404, "User not found")
    res.status(200).json(new ApiResponse(200, user, "User role updated successfully"))
});

const  deleteUser = asyncHandler(async (req,res)=>{
    const {userId} = req.params
    if(!userId) throw new ApiError(400, "User ID is required")
    const user = await prisma.User.delete({
        where:{id:userId}
    })
    if(!user) throw new ApiError(404, "User not found")
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
            role:{not:"admin"}
        },
        skip:skip,
        take:10,
        orderedBy:{createdAt:"desc"},
        select:{
            password:false,
            refreshToken:false
        }
    });
    if(!users || users.length ===0) throw new ApiError(404, "No users found matching the query");
    return res
        .status(200)
        .json(new ApiResponse(200, {
            users:users

        }, "users fetched successfully"));

});

export { createUser , getUsers , getUserProfile , assignRoleToUser , deleteUser,searchUsers};