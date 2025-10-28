import {app} from "./app.js";
import dotenv from "dotenv";
import {ApiError} from "./utilities/ApiError.js";
import db from "./db/index.js";
dotenv.config({
    path:"./.env"
});
db().then(()=>{
    app.listen(process.env.PORT , ()=>{
        console.log("running at " , process.env.PORT);
    })
    app.on("error" , (error) =>{
        console.log("error for listening " , error);
        throw error;
    })

})
.catch((e)=>{
    throw new ApiError(500 , `error in prisma ->${e.message}`)
})