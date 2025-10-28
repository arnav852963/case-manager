import {Router} from "express";
import jwt from "jsonwebtoken";
import {manager_auth} from "../middlewares/manager_auth.middleware.js";
import {addNoteToServiceRecord, getServiceRecordByCaseId} from "../controllers/servicerecord.controller.js";
import {jwt_auth} from "../middlewares/jwt_auth.middleware.js";

const servicerecordsRoutes= Router();
servicerecordsRoutes.use(jwt_auth)

servicerecordsRoutes.route("/getCaseRecords/:caseId").get(manager_auth , getServiceRecordByCaseId)
servicerecordsRoutes.route("/addNote/:recordId").patch(manager_auth , addNoteToServiceRecord)

export default servicerecordsRoutes