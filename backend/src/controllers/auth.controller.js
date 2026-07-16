import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";


export async function register(req, res) {

      const { username, email, password } = req.body;
      const isUserAlreadyExsist = await userModel.findOne({ $or: [{ email }, { username }] });

      if (isUserAlreadyExsist) {
            return res.status(400).json({
                  message: "User already exists",
                  sucess: false,
                  err: "user already exsist"
            })
      }

      const user = await userModel.create({ username, email, password });

      await sendEmail({
            to: email,
            subject: "Account Activation",
            text: "Please verify your account by clicking on the link",
            html: `
                  <h1>Account Activation</h1>
                  <p>Hi ${username} welcome to perplexity</p>
                  <p>Please verify your account by clicking on the link</p>
            `
      });


      res.status(201).json({
            message: "User registered successfully",
            success: true,
            data: user
      })

}