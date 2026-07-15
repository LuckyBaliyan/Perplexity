import mongoose, { Schema } from "mongoose";

/**
 * Chat Schema — represents a single conversation thread between a user and the AI.
 * A chat holds a title (auto-generated from the first query), references the owner User,
 * and tracks metadata like focus mode, source count, and pinned/archived state.
 * All messages belonging to this thread reference this chat via a foreign key.
*/

const chatSchema = new Schema(
      {
            // The user who owns this conversation thread
            user: {
                  type: Schema.Types.ObjectId,
                  ref: "User",
                  required: true,
                  index: true, // Indexed for fast lookup of all chats by user
            },

            // Auto-generated title from the first user query in the thread
            title: {
                  type: String,
                  trim: true,
                  default: "New Chat",
                  maxlength: [200, "Title cannot exceed 200 characters"],
            },

      },
      {
            timestamps: true, // Adds createdAt and updatedAt automatically
      }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

/**
 * Compound index to efficiently fetch a user's non-archived chats
 * sorted by most recently active, which is the default history view.
*/
chatSchema.index({ user: 1 });

const chatModel = mongoose.model("Chat", chatSchema);

export default chatModel;
