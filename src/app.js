import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookie from "cookie-parser"
import {rate_limit} from "./middlewares/ratelimiter.middleware.js";

dotenv.config({
    path:"./.env"
})

const app =express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));

app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({extended:true,limit:'16kb'}));
app.use(express.static("public"));
app.use(cookie())
app.use(rate_limit)


import authRoutes from "./routes/auth.routes.js";
app.use("/api/v1/auth" , authRoutes);

import userRoutes from "./routes/user.routes.js";
app.use("/api/v1/users" , userRoutes);

import caseRoutes from "./routes/case.routes.js";
app.use("/api/v1/cases" , caseRoutes);

import servicerecordsRoutes from "./routes/servicerecords.routes.js";
app.use("/api/v1/servicerecords" , servicerecordsRoutes);

import paymentRoutes from "./routes/payment.routes.js";
app.use("/api/v1/payments" , paymentRoutes);

import attachmentsRoutes from "./routes/attachments.routes.js";
app.use("/api/v1/attachments" , attachmentsRoutes);

import adminRoutes from "./routes/admin.routes.js";
app.use("/api/v1/admin" , adminRoutes);

export {app}