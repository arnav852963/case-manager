import {asyncHandler} from "../utilities/asyncHandler.js";
import {ApiResponse} from "../utilities/ApiResponse.js";

export const healthcheckController = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200 , {} , "OK REPORT"))
});
