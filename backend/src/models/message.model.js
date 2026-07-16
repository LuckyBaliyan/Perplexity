import mongoose, { Schema } from "mongoose";

/**
 * Message Schema — represents a single turn in a chat thread.
 * Each message is either a user query or an AI-generated answer.
 * AI messages (role: "assistant") may include cited web sources and
 * related follow-up questions suggested by the AI.
*/

const messageSchema = new Schema(
      {
            // Reference to the parent chat thread this message belongs to
            chat: {
                  type: Schema.Types.ObjectId,
                  ref: "Chat",
                  required: true,
                  index: true, // Indexed for fast lookup of all messages in a thread
            },

            /**
             * Role of the message sender:
             *  - "user" → A query typed by the human user
             *  - "ai" → AI-generated response
            */
            role: {
                  type: String,
                  enum: ["user", "ai"],
                  required: true,
            },

            // The actual text content of the message (markdown supported for AI responses)
            content: {
                  type: String,
                  required: [true, "Message content cannot be empty"],
                  trim: true,
            },

            /**
             * AI-generated follow-up question suggestions shown below each answer.
             * Helps users dive deeper into a topic, similar to Perplexity's "Related" section.
            */
            relatedQuestions: {
                  type: [String],
                  default: [],
            }
      },
      {
            timestamps: true, // Adds createdAt and updatedAt automatically
      }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

/**
 * Compound index to efficiently fetch all messages in a thread in chronological order.
 * This is the primary read pattern (load a chat → fetch all its messages in order).
*/
messageSchema.index({ chat: 1, createdAt: 1 });

const messageModel = mongoose.model("Messages", messageSchema);

export default messageModel;
