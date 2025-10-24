import {Router} from "express";
import jwt from "jsonwebtoken";
import {manager_auth} from "../middlewares/manager_auth.middleware.js";
import {addNoteToServiceRecord, getServiceRecordByCaseId} from "../controllers/servicerecord.controller.js";

const servicerecordsRoutes= Router();
servicerecordsRoutes.use(jwt)

servicerecordsRoutes.route("/getCaseRecords/:caseId").get(manager_auth , getServiceRecordByCaseId)
servicerecordsRoutes.route("/addNote/:recordId").patch(manager_auth , addNoteToServiceRecord)

export default servicerecordsRoutes