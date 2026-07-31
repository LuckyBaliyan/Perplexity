import { Router } from "express";
import { registerValidator } from "../validators/auth.validator.js";
import { register, verifyEmail, resendVerificationEmail, logOut } from "../controllers/auth.controller.js";
import { loginValidator } from "../validators/auth.validator.js";
import { loginController, getMe } from "../controllers/auth.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";


const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
*/
authRouter.post("/register", registerValidator, register);


/**
 * @route POST /api/auth/login
 * @description Login user
 * @access Public
*/

authRouter.post("/login", loginValidator, loginController)


/**
 * @route GET /api/auth/get-me
 * @description Get current logged in user
 * @access Private
*/

authRouter.get("/get-me", authUser, getMe);


/**
 * @route GET /api/auth/verify-email
 * @description Verify user email
 * @access Public
*/
authRouter.get("/verify-email", verifyEmail);

/**
 * @route GET /api/auth/resend-verification-email
 * @description Resend verification email to user
 * @access Public
*/
authRouter.get("/resend-verification-email", resendVerificationEmail);

/**
 * @route POST /api/auth/logout
 * @description Logout user
 * @access Private
*/
authRouter.post("/logOut", authUser, logOut);

export default authRouter;