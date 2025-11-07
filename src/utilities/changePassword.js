import {ApiError} from "./ApiError.js";
import admin from "./firebaseAdmin.js";
import dotenv from "dotenv";
dotenv.config({
    path:"./.env"
})
export const changePasswordMethod = async (oldPassword, newPassword, user) => {
    const firebase = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY_WEB}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email:user?.email,
                password: oldPassword,
                returnSecureToken: true,
            }),
        }
    );

    const data = await firebase.json();
    if (data.error) throw new ApiError(401, "Invalid old password");
    const updatePassword = await admin.auth().updateUser(data.localId, { password: newPassword });
    if(!updatePassword) throw new ApiError(500 , "Failed to update password in Firebase");
    return true

}