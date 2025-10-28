import {asyncHandler} from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import {prisma} from "../utilities/prisma.js";
import {ApiResponse} from "../utilities/ApiResponse.js";
import {auditLog} from "../utilities/auditlog.js";

const getServiceRecordByCaseId = asyncHandler(async (req, res) => {
    const { caseId } = req.params;
    if (!caseId) throw new ApiError(400, "Case ID is required");

    const serviceRecords = await prisma.ServiceRecord.findMany({
        where: {
            caseId: caseId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    if (!serviceRecords || serviceRecords.length === 0) throw new ApiError(404, "No service records found for this case");
    res.status(200).json(new ApiResponse(200, { serviceRecords }, "Service records fetched successfully"));
});

const addNoteToServiceRecord = asyncHandler(async (req, res) => {
    const { recordId } = req.params;
    const {note} = req.body;
    if (!recordId || !note||!note.trim()) throw new ApiError(400, "Record ID and note are required");
    const existing = await prisma.ServiceRecord.findUnique({ where: { id: recordId } });
    if (!existing) throw new ApiError(404, "Service record not found");
    const serviceRecord = await prisma.ServiceRecord.update({
        where: {
            id: recordId
        },
        data: {
            notes: {
                push: note
            }
        }
    });
    if(!serviceRecord) throw new ApiError(500 , "Failed to add note to service record");

    const log = await auditLog({
        userId:req.user.id,
        entity:"ServiceRecord",
        entityId:serviceRecord.id,
        action:"ADD_NOTE"

    })
    if(!log) throw new ApiError(500 , "service record log not created");

    res.status(200).json(new ApiResponse(200, serviceRecord, "Note added to service record successfully"));



});
export {getServiceRecordByCaseId , addNoteToServiceRecord };