const asyncHandler =  (func)=>{

    return async (req , res , next)=>{
        try{
            const response = await func(req,res,next)

        } catch (e) {
            console.log("error in asynchandler" , e.message);
            let statusCode = 0;
            if(e.code>=100 && e.code<=1000) statusCode=e.code;
            else statusCode =500;
            res.status(statusCode).json({
                message:e.message,
                status: false,
                statusCode:statusCode

            })


        }


    }
}
export {asyncHandler}

