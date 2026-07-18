import { Router } from "express";
import { registerValidator } from "../validators/auth.validator.js";
import { register, verifyEmail } from "../controllers/auth.controller.js";
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

export default authRouter;