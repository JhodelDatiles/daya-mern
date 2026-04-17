// src/model/ghostUserSchema.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const ghostUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    username: {
      type: String,
      trim: true,
      sparse: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verification: {
      token: {
        type: String, // FIX: was [String]
        required: true,
      },
      version: {
        type: Number,
        default: 1,
      },
      expiresAt: {
        type: Date,
        required: true,
      },
    },
  },
  { timestamps: true }
);

// REMOVE TTL (you already confirmed it causes confusion)
// ghostUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

ghostUserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(11);
  this.password = await bcrypt.hash(this.password, salt);
});

const GhostUser = mongoose.model("GhostUser", ghostUserSchema);
export default GhostUser;