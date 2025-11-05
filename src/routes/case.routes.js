import {Router} from "express";
import {jwt_auth} from "../middlewares/jwt_auth.middleware.js";
import {
    assignCase,
    createCase, deleteCase,
    getCaseId,
    getCasesManager, searchCases,
    updateCaseStatus
} from "../controllers/case.controller.js";
import {admin_auth} from "../middlewares/admin_auth.middleware.js";
import {manager_auth} from "../middlewares/manager_auth.middleware.js";

const caseRoutes= Router();

caseRoutes.use(jwt_auth);

caseRoutes.route("/createCase").post(createCase) //-

caseRoutes.route("/getCasesManager").get(manager_auth , getCasesManager);
caseRoutes.route("/getCase/:caseId").get( getCaseId); //-
caseRoutes.route("/assignCase/:caseId/:managerId").patch(admin_auth , assignCase);
caseRoutes.route("/updateCaseStatus/:caseId").patch(manager_auth , updateCaseStatus);
caseRoutes.route("/deleteCase/:caseId").delete(deleteCase);
caseRoutes.route("/searchCases").get( manager_auth,searchCases);

export default caseRoutes;