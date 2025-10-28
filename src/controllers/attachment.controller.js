import {asyncHandler} from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import {prisma} from "../utilities/prisma.js";
import {ApiResponse} from "../utilities/ApiResponse.js";
import {auditLog} from "../utilities/auditlog.js";
import {upload} from "../utilities/cloudinary.js";

const addAttachmentToCase = asyncHandler(async (req, res) => {
    const {caseId} = req.params;
    if (!caseId) throw new ApiError(400, "Case ID is required");

    const localPaths = req?.files?.attachments
    if (!localPaths || localPaths.length === 0) throw new ApiError(400, "At least one attachment is required");
    const cloud_uploads = []
    for(let i=0; i<localPaths.length; i++){
        const upload_result = await upload(localPaths[i].path)
        if(!upload_result.url) throw new ApiError(500, "Failed to upload attachment to cloud")
        cloud_uploads.push(upload_result.url)
    }
    const attachment =await prisma.Attachment.create({
        data:{
            userId:req?.user?.id,
            caseId:caseId,
            attachments: cloud_uploads
        }
    });

    if(!attachment) throw new ApiError(500, "Failed to add attachment to case");

    const log = await auditLog({
        userId:req.user.id,
        entity:"Attachment",
        entityId:attachment.id,
        action:"CREATE"

    })
    if(!log) throw new ApiError(500 , "attachment log not created");

    res.status(201).json(new ApiResponse(201, attachment, "Attachment added to case successfully"));



}
);

const getAttachmentsByCase = asyncHandler(async (req, res) => {
    const {caseId} = req.params;
    if (!caseId) throw new ApiError(400, "Case ID is required");

    const attachments = await prisma.Attachment.findMany({
        where:{
            caseId:caseId
        },
        select:{
            attachments: true,

            createdAt:true,
            user:{
                select:{
                    id:true,
                    username:true,
                    email:true
                }
            }
        }
    });
    if(!attachments || attachments.length ===0) throw new ApiError(404, "No attachments found for this case");

    res.status(200).json(new ApiResponse(200, {
        attachments: attachments[0].attachments,
        user:attachments[0].user
    }, "Attachments fetched successfully for the case"));



});

const deleteAttachment = asyncHandler(async (req, res) => {
    const {attachmentId} = req.params;
    if (!attachmentId) throw new ApiError(400, "Attachment ID is required");

    const attachment = await prisma.Attachment.findUnique({
        where:{
            id:attachmentId
        }
    });
    if(!attachment) throw new ApiError(404, "Attachment not found");

    const deletedAttachment = await prisma.Attachment.delete({
        where:{
            id:attachmentId
        }
    });
    if(!deletedAttachment) throw new ApiError(500, "Failed to delete attachment");

    const log = await auditLog({
        userId:req.user.id,
        entity:"Attachment",
        entityId:deletedAttachment.id,
        action:"DELETE"

    })
    if(!log) throw new ApiError(500 , "attachment log not created");

    res.status(200).json(new ApiResponse(200, {}, "Attachment deleted successfully"));

});
export {addAttachmentToCase, getAttachmentsByCase, deleteAttachment};