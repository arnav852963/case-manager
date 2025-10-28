import {prisma} from "./prisma.js";
import {ApiError} from "./ApiError.js";
import {ApiResponse} from "./ApiResponse.js";

export const auditLog = async (audit_details={})=>{
    try {
        if(!audit_details) throw new ApiError(500 , "info empty");
        const  log = await prisma.AuditLog.create({
            data: audit_details
        });
        if(!log) throw new ApiError(500 , "could not create audit log");

        return true;



    } catch (e) {
        throw new ApiError(500 , `error in audit log utility -->${e.message}`);


    }
}