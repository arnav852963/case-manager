import rateLimit from "express-rate-limit";

export const rate_limit = rateLimit({
    windowMs:15*60*1000,
    max:100,
    message:"Too many requests , please try after sometime",
    standardHeaders:true,
    legacyHeaders:false
})

export const auth_Limiter = rateLimit({
    windowMs:5*60*1000,
    max:10,
    message:"Too many attempts , please try after ssometime",
    standardHeaders:true,
    legacyHeaders:false
})