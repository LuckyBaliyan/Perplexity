import { body, validationResult } from "express-validator";

/**
 * Validation rules for the Register API.
 * Each rule uses express-validator's `body()` to validate specific fields from req.body.
 * The last entry in the array is an inline middleware that collects any validation errors
 * and returns a 400 response if any exist — so no separate validate function is needed.
*/
export const registerValidator = [
      // Validate 'username': must be a non-empty string with max 60 characters
      body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLength({ max: 60 })
            .withMessage("Username cannot exceed 60 characters"),

      // Validate 'email': must be a non-empty, properly formatted email address
      body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Please provide a valid email address")
            .normalizeEmail(),

      // Validate 'password': must be present and at least 6 characters long
      body("password")
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),

      /**
       * Inline validation handler — collects all errors from the rules above.
       * If any validation failed, responds immediately with 400 and the error list.
       * Otherwise calls next() to continue to the actual controller.
       */
      (req, res, next) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                  return res.status(400).json({
                        success: false,
                        message: "Validation failed",
                        errors: errors.array().map((err) => ({
                              field: err.path,
                              message: err.msg,
                        })),
                  });
            }

            next();
      },
];


export const loginValidator = [

      body("email").trim().notEmpty().withMessage("Email is required").isEmail().
            withMessage("Please provide a valid email address").normalizeEmail(),

      body("password").notEmpty().withMessage("Password is required").isLength({ min: 5, max: 15 }).
            withMessage("Password must be between 5 and 15 characters long"),

      (req, res, next) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                  return res.status(400).json({
                        sucess: false,
                        message: "Validation Failed",
                        data: errors
                  })
            }
            next()
      }

]
