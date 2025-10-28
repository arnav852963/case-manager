import {asyncHandler} from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import {prisma} from "../utilities/prisma.js";
import {ApiResponse} from "../utilities/ApiResponse.js";
import {auditLog} from "../utilities/auditlog.js";
import {generateInvoice} from "../utilities/invoice.js";
import {upload} from "../utilities/cloudinary.js";
import axios from "axios";
import path from "path";

const createPayment = asyncHandler(async (req, res) => {
const {caseId  , amount , method , remark} = req.body;
if(!caseId || !amount || !method) throw new ApiError(400 , "caseId , amount and method are required");

const payment = await prisma.Payment.create({
    data: {
        caseId: caseId,
        amount: amount,
        paymentMethod: method,
        remark: remark,
        userId: req.user.id
    }
});

if(!payment) throw new ApiError(500 , "Failed to create payment");

const log = await auditLog({
    userId:req.user.id,
    entity:"Payment",
    entityId:payment.id,
    action:"PAYMENT"

})
if(!log) throw new ApiError(500 , "payment log not created");

res.status(201).json(new ApiResponse(201, payment, "Payment created successfully"));
});

const updatePayment = asyncHandler(async (req, res) => {
    const {paymentId} = req.params;
    const {status , transactionId ="" , referenceCode =""} = req.body

    if(!paymentId || !status) throw new ApiError(400 , "paymentId and status  is required");

    const existingPayment = await prisma.Payment.findUnique({
        where:{
            id:paymentId
        }
    });
    if(!existingPayment) throw new ApiError(404 , "Payment not found");
if(status === "SUCCESS" && (!transactionId  || !referenceCode)){
    throw new ApiError(400 , "transactionId and referenceCode are required for SUCCESS status");
}
if(status==="SUCCESS" && transactionId.trim() && referenceCode.trim()){
    const updateStatus = await prisma.Payment.update({
        where:{
            id:paymentId
        },
        data:{
            status:status,
            transactionId:transactionId,
            referenceCode:referenceCode
        },
        include:{
            user:true,
            case:true
        }
    });
    if(!updateStatus) throw new ApiError(500 , "Failed to update payment status");
    const invoice_path = await generateInvoice(updateStatus , updateStatus.user , updateStatus.case )
    if(!invoice_path) throw new ApiError(500 , "Failed to generate invoice");
    const upload_invoice = await upload(invoice_path)
    if(!upload_invoice?.url) throw new ApiError(500 , "Failed to upload invoice");

    const pay = await prisma.Payment.update({
        where:{
            id:updateStatus.id
        },
        data:{
            invoiceUrl:upload_invoice?.url || ""
        }

    })
    if(!pay) throw new ApiError(500 , "Failed to update payment with invoice url");

    const log = await auditLog({
        userId:req.user.id,
        entity:"Payment",
        entityId:updateStatus.id,
        action:"UPDATE"

    })
    if(!log) throw new ApiError(500 , "payment log not created");

    res.status(200).json(new ApiResponse(200, pay, "Payment  successful"));


}
    const updateStatus = await prisma.Payment.update({
        where:{
            id:paymentId
        },
        data:{
            status:status
        }
    });
    if(!updateStatus) throw new ApiError(500 , "Failed to update payment status");

    const log = await  auditLog({
        userId:req.user.id,
        entity:"Payment",
        entityId:updateStatus.id,
        action:"UPDATE"

    })
    if(!log) throw new ApiError(500 , "payment log not created");

    res.status(200).json(new ApiResponse(200, updateStatus, "Payment status updated successfully"));

});

const getPaymentsByCaseId = asyncHandler(async (req, res) => {
    const {caseId} = req.params;
    if(!caseId) throw new ApiError(400 , "caseId is required");

    const payments = await prisma.Payment.findMany({
        where:{
            caseId:caseId
        },
        select:{
            id:true,
            amount:true,
            method:true,
            status:true,
            transactionId:true,
            referenceCode:true,
            remark:true,
            createdAt:true,
            updatedAt:true,
            user:{
                select:{
                    id:true,
                    username:true,
                    email:true,
                    role:true
                }
            },
            case:{
                select:{
                    createdById:true,
                    assignedToId:true,
                    status:true

    }
            }

        }

    })
    if(!payments || payments.length ===0) throw new ApiError(404 , "No payments found for this case");

    res.status(200).json(new ApiResponse(200, {
        paymentDetail:payments[0],
        userDetails:payments[0].user,
        caseDetails:payments[0].case
    }, "Payments fetched successfully for the case"))
});

const getAllPayments = asyncHandler(async (req, res) => {
    let {page} = req.query;
    page = page ? parseInt(page) : 1;
    const skip = (page -1) * 10;

    const payments = await prisma.Payment.findMany({
        skip:skip,
        take:10,
        orderBy:{
            createdAt:"desc"
        },
        select:{
            id:true,
            amount:true,
            method:true,
            status:true,
            transactionId:true,
            referenceCode:true,
            remark:true,
            createdAt:true,
            updatedAt:true,
            user:{
                select:{
                    id:true,
                    username:true,
                    email:true,
                    role:true
                }
            },
            case:{
                select:{
                    createdById:true,
                    assignedToId:true,
                    status:true

                }
            }

        }

    })
    if(!payments || payments.length ===0) throw new ApiError(404 , "No payments found");

    res.status(200).json(new ApiResponse(200, payments, "Payments fetched successfully"))
});

const giveRefund = asyncHandler(async (req, res) => {
    const {paymentId, amount, reason} = req.body;
    if (!paymentId || !amount || !reason) throw new ApiError(400, "paymentId , amount and reason are required");

    const existingPayment = await prisma.Payment.findUnique({
        where: {
            id: paymentId
        }
    });
    if (!existingPayment) throw new ApiError(404, "Payment not found");

    if (existingPayment.status !== "SUCCESS") throw new ApiError(400, "Only successful payments can be refunded");


    const refundRecord = await prisma.Refund.create({
        data:{
            paymentId:paymentId,
            amount: parseFloat(amount),
            reason:reason,
            processedBy:req?.user?.id

            },

        });
    if(!refundRecord) throw new ApiError(500 , "Failed to create refund record");
    const refund = await prisma.Payment.update({
        where:{
            id:paymentId
        },
        data:{
            status:"REFUNDED",
            remark:reason
        }
    });
    if(!refund) throw new ApiError(500 , "Failed to process refund");
    const log = await auditLog({
        userId:req.user.id,
        entity:"Refund",
        entityId:refundRecord.id,
        action:"REFUND"

    })
    if(!log) throw new ApiError(500 , "payment log not created");

    res.status(200).json(new ApiResponse(200, refundRecord, "Payment refunded successfully"));





});



 const downloadInvoice = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    if (!paymentId) throw new ApiError(400, "Payment ID is required");

    const payment = await prisma.Payment.findUnique({
        where: { id: paymentId },
        select: { invoiceUrl: true, userId: true }
    });

    if (!payment || !payment.invoiceUrl)
        throw new ApiError(404, "Invoice not found");

    if (req.user.role !== "ADMIN" && req.user.id !== payment.userId)
        throw new ApiError(403, "Access denied to this invoice");

    const response = await axios.get(payment.invoiceUrl, {
        responseType: "arraybuffer"
    });

    const fileName = path.basename(payment.invoiceUrl);

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(response.data);
    return
});


export {createPayment, updatePayment, getPaymentsByCaseId, getAllPayments, giveRefund , downloadInvoice};