import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";

/**
 * @description Controller for user registration
 * @param {import("express").Request} req
 * @param {import("express").Response} res
*/

/**
 * @description Signs a fresh verification token for a user and emails them
 * the activation link. Shared by register() and resendVerificationEmail()
 * so both paths always issue a real, current token.
 * @param {{ username: string, email: string }} user
 */
async function sendVerificationEmail(user) {
      const emailVerificationToken = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
      );

      await sendEmail({
            to: user.email,
            subject: "Account Activation",
            text: "Please verify your account by clicking on the link",
            html: `
                  <h1>Account Activation</h1>
                  <p>Hi ${user.username} welcome to perplexor Ai</p>
                  <p>Please verify your account by clicking on the link</p>
                  <a href="${process.env.BACKEND_URL}/api/auth/verify-email?token=${emailVerificationToken}">Verify email</a>
            `
      });
}

/**
 * @description Controller for user registration
 * @param {import("express").Request} req
 * @param {import("express").Response} res
*/

export async function register(req, res) {

      const { username, email, password } = req.body;
      const isUserAlreadyExsist = await userModel.findOne({ $or: [{ email }, { username }] });

      if (isUserAlreadyExsist) {
            return res.status(400).json({
                  message: "User with same name or email already exists",
                  success: false,
                  err: "user already exsist"
            })
      }

      const user = await userModel.create({ username, email, password });

      // await sendVerificationEmail(user);

      res.status(201).json({
            message: "User registered successfully",
            success: true,
            data: {
                  username: user.username,
                  email: user.email,
            }
      })

}


/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @description verify the user ans send account activation and redirect response to user
*/

export async function verifyEmail(req, res) {
      const { token } = req.query;

      try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await userModel.findOne({ email: decoded.email });

            if (!user) {
                  return res.status(400).json({
                        message: "User not found",
                        success: false,
                        err: "user not found"
                  })
            }

            user.verified = true;

            await user.save();

            const html = `
                  <h1>Account Verified</h1>
                  <p>Hi ${user.username} welcome to perplexity</p>
                  <p>Your account has been verified successfully</p>
                  <a href=${process.env.FRONTEND_URL}>Login Here</a>
                  <p> having problem resend link?</p>
            `

            return res.send(html);
      }
      catch (err) {
            return res.status(400).json({
                  message: "Invalid token",
                  success: false,
                  err: "invalid token"
            })
      }
}

/** 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @description resend the account verification link again
*/
export async function resendVerificationEmail(req, res) {
      try {

            const { email } = req.query;

            if (!email) {
                  return res.status(400).json({
                        message: "Email is required",
                        success: false,
                        err: "email is required"
                  })
            }

            const user = await userModel.findOne({ email });

            if (!user) {
                  return res.status(404).json({
                        message: "user not found",
                        success: false,
                        err: "user not found"
                  })
            }


            if (user.verified) {
                  return res.status(400).json({
                        message: "account already verified please loing to continue",
                        success: false,
                        err: "account already verified"
                  })
            }

            await sendVerificationEmail(user);

            return res.status(200).json({
                  message: "Verification email resent successfully",
                  success: true,
                  data: {
                        email: user.email
                  }
            });

      } catch (err) {
            res.status(500).json({
                  message: "Unexpected Error Accours!",
                  success: false,
                  err: err
            })
      }
}


/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @description login user and send response to user
*/

export async function loginController(req, res) {
      const { email, password } = req.body;

      const user = await userModel.findOne({ email }).select("+password");

      if (!user) {
            return res.status(404).json({
                  message: "user not found",
                  success: false,
                  err: "user not found"
            });
      }

      const isPasswordMatch = await user.comparePassword(password);

      if (!isPasswordMatch) {
            return res.status(400).json({
                  message: "Invalid Credentials",
                  success: false,
                  err: "invalid credentials"
            })
      }

      /*if (!user.verified) {
            return res.status(400).json({
                  message: "Account not verified",
                  success: false,
                  err: "account not verified",
                  data: {
                        email: user.email
                  }
            })
      }*/

      const token = jwt.sign({
            id: user._id,
            username: user.username,
      }, process.env.JWT_SECRET, { expiresIn: "7d" });

      res.cookie("token", token, {
            httpOnly: true,
            secure: true,      // HTTPS only
            sameSite: "none",  // Required for cross-site cookies
            maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
            message: "Loign Sucessfully",
            success: true,
            user: {
                  id: user._id,
                  username: user.username,
                  email: user.email,
            }
      });
}

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @description get current logged in user
*/

export async function getMe(req, res) {
      const userId = req.user.id;

      const user = await userModel.findById(userId).select("-password");

      if (!user) {
            return res.status(404).json({
                  message: "User not found",
                  success: false,
                  err: "user not found"
            })
      }

      res.status(200).json({
            message: "User found successfully",
            success: true,
            user: {
                  id: user._id,
                  username: user.username,
                  email: user.email,
                  verified: user.verified,
                  createdAt: user.createdAt,
                  updatedAt: user.updatedAt
            }
      })
}

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @description logout user
 */
export async function logOut(req, res) {
      try {
            res.clearCookie("token", {
                  httpOnly: true,
                  secure: true,
                  sameSite: "none",
            });

            return res.status(200).json({
                  message: "Logged out successfully",
                  success: true,
            });

      } catch (error) {

            res.status(500).json({
                  message: "LogOut Failed!",
                  success: false,
                  err: error
            })

      }
}