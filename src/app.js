import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookie from "cookie-parser"
import {rate_limit} from "./middlewares/ratelimiter.js";

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


export {app}