import {Router} from "express";

const healthcheckRoute = Router();
healthcheckRoute.route("/healthcheck").get(healthcheckRoute)

export default healthcheckRoute