import {Router} from "express";
import {jwt_auth} from "../middlewares/jwt_auth.middleware.js";
import {addAttachmentToCase, deleteAttachment, getAttachmentsByCase} from "../controllers/attachment.controller.js";

const attachmentsRoutes = Router();
attachmentsRoutes.use(jwt_auth)

attachmentsRoutes.route("/addAttachmentToCase/:caseId").post(addAttachmentToCase)
attachmentsRoutes.route("/getAttachments/:caseId").get(getAttachmentsByCase)
attachmentsRoutes.route("/deleteAttachment/:attachmentId").delete(deleteAttachment)


export default attachmentsRoutes