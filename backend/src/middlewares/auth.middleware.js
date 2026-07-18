import jwt from "jsonwebtoken"


/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @description Auth middleware to verify JWT token
*/

export function authUser(req, res, next) {
      const token = req.cookies.token;

      if (!token) {
            return res.status(401).json({
                  message: "Unauthorized",
                  success: false,
                  err: "No token provided"
            });
      }

      try {

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();

      } catch (err) {

            return res.status(401).json({
                  message: "Unauthorized",
                  success: false,
                  err: "Invalid token"
            });

      }
}