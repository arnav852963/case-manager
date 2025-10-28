import {asyncHandler} from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import {prisma} from "../utilities/prisma.js";
import {ApiResponse} from "../utilities/ApiResponse.js";
import {auditLog} from "../utilities/auditlog.js";

const getLogs = asyncHandler(async (req, res) => {
    const logs = await prisma.AuditLog.findMany({
        orderBy:{
            timestamp:"desc"
        },
        include:{
            user:{
                select:{
                    username:true,
                    email:true,
                    role:true
                }
            },
            case:{
                select:{
                    id:true,
                    description:true,

                }
            }
        }
    });
    if (!logs || logs.length === 0) throw new ApiError(404, "No logs found");
    res.status(200).json(new ApiResponse(200, { logs: logs, totalLogs: logs.length }, "Logs fetched successfully"));
});


const systemInfo = asyncHandler(async (req, res) => {
    const userCount = await prisma.User.count({});
    const caseCount = await prisma.Case.count({});
    const paymentsCount = await prisma.Payment.count({});
    const serviceRecordCount = await prisma.ServiceRecord.count({});
    if(!userCount && !caseCount && !paymentsCount && !serviceRecordCount) throw new ApiError(500 , "Failed to fetch system info");

    res.status(200).json(new ApiResponse(200 , {
        totalUsers:userCount,
        totalCases:caseCount,
        totalPayments:paymentsCount,
        totalServiceRecords:serviceRecordCount
    } , "System info fetched successfully"));

})
const getUsersByRole = asyncHandler(async (req, res) => {
    const {role} = req.params;
    if(!role) throw new ApiError(400 , "Role is required");
    const users = await prisma.User.findMany({
        where:{
            role:role
        },
       orderBy:{
        createdAt:"desc"
       }
    });

    if(!users || users.length ===0) throw new ApiError(404 , `No users found with role ${role}`);

    for (let i = 0; i < users.length; i++) {
        users[i].password ="";
        users[i].refreshToken ="";

    }
    res.status(200).json(new ApiResponse(200 , {
        users:users,
        totalUsers:users.length
    } , `Users with role ${role} fetched successfully`));

})



const getUsers = asyncHandler(async (req, res) => {
    const users = await prisma.User.findMany({
        where:{
            role:{not:"admin"}
        },
        select:{
            password:false,
            refreshToken:false
        }
    });
    if(!users || users.length ===0) throw new ApiError(500, "No users found");
    const managers = []
    const finance =[]
    users.forEach((user)=>{
        if(user.role ==="MANAGER") {managers.push(user)}
        if(user.role ==="FINANCE") finance.push(user)

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


const getAllPayments = asyncHandler(async (req, res) => {


    const payments = await prisma.Payment.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { username: true, email: true } },
            case: { select: { id: true, description: true } }
        },

    });
    if(!payments || payments.length ===0) throw new ApiError(404 , "No payments found in the system");

    let count_fail =0;
    let count_success =0;
    let count_process =0;
    payments.forEach((payment)=>{
        if(payment.status ==="SUCCESS") count_success++;
        if(payment.status ==="FAILED") count_fail++;
        if(payment.status !=="SUCCESS" && payment.status!=="FAILED") count_process++;
    })



    return res.status(200).json(
        new ApiResponse(200, { payments:payments, total: payments.length,successful:count_success , failed:count_fail , in_process:count_process }, "All payments fetched successfully")
    );
});

const assignRoleToUser = asyncHandler(async (req,res)=>{
    const {userId}= req.params
    const {role} = req.body
    if(!userId || !role) throw new ApiError(400, "All fields are required")
    const user = await prisma.User.update({
        where:{id:userId},
        data:{role:role},

    })
    if(!user) throw new ApiError(404, "User not found")
    user.password = ""
    user.refreshToken =""
    const log = await auditLog({
        userId:req.user.id,
        entity:"User",
        entityId:user.id,
        action:"ASSIGN"

    })
    if(!log) throw new ApiError(500 , "user log not created");
    res.status(200).json(new ApiResponse(200, user, "User role updated successfully"))
});

const getCasesAdmin = asyncHandler(async (req, res) => {
    const cases = await prisma.Case.findMany({
        include:{
            createdBy:{
                select:{
                    username:true,
                    email:true
                }
            },
            assignedTo:{
                select:{
                    username:true,
                    email:true
                }
            }
        }
    });
    if (!cases || cases.length === 0) throw new ApiError(404, "No cases found");
    res.status(200).json(new ApiResponse(200, { cases: cases, totalCases: cases.length }, "Cases fetched successfully"));

})
export {getUsers , getUsersByRole , getLogs , getAllPayments , systemInfo, assignRoleToUser , getCasesAdmin}

