import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

/**
 * User Schema — stores account credentials, profile data, and authentication tokens.
 * Passwords are hashed before saving using bcrypt.
 * Provides instance methods to compare passwords and generate JWT tokens.
*/

const userSchema = new Schema(
      {
            // Username of the user
            username: {
                  type: String,
                  required: [true, "Username is required"],
                  trim: true,
                  maxlength: [60, "Username cannot exceed 60 characters"],
            },

            // Unique email used for login
            email: {
                  type: String,
                  required: [true, "Email is required"],
                  unique: true,
                  lowercase: true,
                  trim: true,
            },

            // Hashed password — never stored in plain text
            password: {
                  type: String,
                  required: [true, "Password is required"],
                  minlength: [6, "Password must be at least 6 characters"],
            },

            // verification status of the user 
            verified: {
                  type: Boolean,
                  default: false,
            }
      },
      {
            timestamps: true, // Adds createdAt and updatedAt automatically
      }
);

// ─── Pre-save Hook ────────────────────────────────────────────────────────────

/**
 * Hashes the user's password before saving to the database.
 * Only runs if the password field has been modified to avoid re-hashing.
 */
userSchema.pre("save", async function (next) {
      if (!this.isModified("password")) return next();
      this.password = await bcrypt.hash(this.password, 12);
      next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * Compares a plain-text password against the stored hashed password.
 * Returns true if they match, false otherwise.
 * @param {string} candidatePassword - The password entered by the user during login
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
};

const userModel = mongoose.model("User", userSchema);

export default userModel;
