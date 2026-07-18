import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";

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

      const emailVerificationToken = jwt.sign({
            email: user.email,
      }, process.env.JWT_SECRET);

      await sendEmail({
            to: email,
            subject: "Account Activation",
            text: "Please verify your account by clicking on the link",
            html: `
                  <h1>Account Activation</h1>
                  <p>Hi ${username} welcome to perplexity</p>
                  <p>Please verify your account by clicking on the link</p>
                  <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}">Verify email</a>
            `
      });


      res.status(201).json({
            message: "User registered successfully",
            success: true,
            data: user
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
                  <a href="http://localhost:3000/login">Login Here</a>
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
 * @description login user and send response to user
*/

export async function loginController(req, res) {
      const { email, password } = req.body;

      const user = await userModel.findOne({ email });

      const isPasswordMatch = user.comparePassword(password);

      if (!isPasswordMatch) {
            return res.status(400).json({
                  message: "Invalid Credentials",
                  success: false,
                  err: "invalid credentials"
            })
      }

      if (!user.verified) {
            return res.status(400).json({
                  message: "Account not verified",
                  success: false,
                  err: "account not verified"
            })
      }

      const token = jwt.sign({
            id: user._id,
            username: user.username,
      }, process.env.JWT_SECRET, { expiresIn: "7d" });

      res.cookie("token", token);

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
                  verified: user.verified
            }
      })
}