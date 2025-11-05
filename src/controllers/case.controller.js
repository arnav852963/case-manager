import {asyncHandler} from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import {prisma} from "../utilities/prisma.js";
import {ApiResponse} from "../utilities/ApiResponse.js";
import {auditLog} from "../utilities/auditlog.js";

const createCase = asyncHandler(async (req, res) => {
    const {  description } = req.body;
    if (!description || !description.trim())  throw ApiError(400, "Title and description are required");
    const newCase = await prisma.Case.create({
        data: {

            description: description,
            createdById: req.user.id
        }
    });
    if (!newCase) throw new ApiError(500, "Failed to create case");

    const serviceRecord = await prisma.ServiceRecord.create({
        data:{
            caseId:newCase.id,
            userId:req.user.id,
            description:`a case was created by the user`,

        }

    });
    if(!serviceRecord) throw new ApiError(500 , "service record not created");
    const log = await auditLog({
        userId:req.user.id,
        entity:"Case",
        entityId:newCase.id,
        action:"CREATE"

    })
    if(!log) throw new ApiError(500 , "case log not created");

    res.status(201).json(new ApiResponse(201, newCase, "Case created successfully"));
});



const getCasesManager = asyncHandler(async (req, res) => {
    const cases = await prisma.Case.findMany({
        where: {
            assignedToId: req.user.id // only manager can access
        }
    });
    if (!cases || cases.length === 0) throw new ApiError(404, "No cases found for this manager");
    res.status(200).json(new ApiResponse(200, { cases: cases, totalCases: cases.length }, "Cases fetched successfully for manager"));
})

const getCaseId = asyncHandler(async (req, res) => {
    const { caseId } = req.params;
    if (!caseId) throw new ApiError(400, "Case ID is required");
    const caseItem = await prisma.Case.findUnique({
        where: {
            id: caseId
        },
        include:{
            createdBy:true,
            assignedTo:true ,
            attachments:true,
            serviceRecords:true,
            payments:true,
            auditLogs:true
        }

    });
    if (!caseItem) throw new ApiError(500, "Case not found");
    res.status(200).json(new ApiResponse(200, caseItem, "Case fetched successfully"));
});

const assignCase = asyncHandler(async (req, res) => {
    const { caseId, managerId } = req.params;
    if (!caseId || !managerId) throw new ApiError(400, "Case ID and Manager ID are required");
    const assignedCase = await prisma.Case.update({
        where: {
            id: caseId
        },
        data: {
            assignedToId: managerId
        }
    });
    if (!assignedCase) throw new ApiError(500, "Failed to assign case to manager");
    const serviceRecord = await prisma.ServiceRecord.create({
        data:{
            caseId:caseId,
            userId:managerId,
            description:`a case was assigned to the manager`,
            status:"IN_PROGRESS"

        }
    })
    if(!serviceRecord) throw new ApiError(500 , "service record not created");
    const log = await auditLog({
        userId:req?.user?.id,
        entity:"Case",
        entityId:caseId,
        action:"ASSIGN"

    })
    if(!log) throw new ApiError(500 , "case log not created");
    res.status(200).json(new ApiResponse(200, assignedCase, "Case assigned to manager successfully"));
});

const updateCaseStatus = asyncHandler(async (req, res) => {
    const { caseId } = req.params;
    const { status } = req.body;
    if (!caseId || !status) throw new ApiError(400, "Case ID and status are required");
    const updatedCase = await prisma.Case.update({
        where: {
            id: caseId
        },
        data: {
            status: status
        }
    });
    if (!updatedCase) throw new ApiError(500, "Failed to update case status");
    let statService = "IN_PROGRESS";
    if (status === "COMPLETED" || status === "CLOSED") statService = "DONE";
    if (status === "PENDING" || status === "UNDER_REVIEW") statService = "TODO";

    const serviceRecord = await prisma.ServiceRecord.create({
        data:{
            caseId:caseId,
            userId:req.user.id,
            description:`case status updated to ${status}`,
            status:statService

        }
    })
    if(!serviceRecord) throw new ApiError(500 , "service record not created");
    const log = auditLog({
        userId:req.user.id,
        entity:"Case",
        entityId:updatedCase.id,
        action:"UPDATE"

    })
    if(!log) throw new ApiError(500 , "case log not created");
    res.status(200).json(new ApiResponse(200, updatedCase, "Case status updated successfully"));
});

const deleteCase = asyncHandler(async (req, res) => {
    const { caseId } = req.params;
    if (!caseId) throw new ApiError(400, "Case ID is required");
    const deletedCase = await prisma.Case.delete({
        where: {
            id: caseId
        }
    });
    if (!deletedCase) throw new ApiError(500, "Failed to delete case");
    const log = auditLog({
        userId:req.user.id,
        entity:"Case",
        entityId:deletedCase.id,
        action:"DELETE"

    })
    if(!log) throw new ApiError(500 , "case log not created");
    res.status(200).json(new ApiResponse(200, {}, "Case deleted successfully"));
});

const searchCases = asyncHandler(async (req, res) => {
    const { query } = req.query;
    let  {page}  = req.query;
    page = page ? parseInt(page) : 1;
    if (!query || !query.trim()) throw new ApiError(400, "Search query is required");
    const cases = await prisma.Case.findMany({
        where: {
            description: { contains: query, mode: 'insensitive' }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * 10,
        take: 10
    });
    if (!cases || cases.length === 0) throw new ApiError(404, "No cases fetched");
    res.status(200).json(new ApiResponse(200,  cases, "Cases fetched successfully for search query"));
});
export { createCase ,  getCasesManager , getCaseId,assignCase , updateCaseStatus , deleteCase , searchCases}