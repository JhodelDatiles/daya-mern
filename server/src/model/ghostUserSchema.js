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
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: [8, "Password must be at least 8 characters long"],
    },

    username: {
      type: String,
      sparse: true,
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verification: {
      token: {
        type: String,
        default: null,
      },
      version: {
        type: Number,
        default: 1,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true },
);

// Delete the entire document after 24 hours
ghostUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

ghostUserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(11);
  this.password = await bcrypt.hash(this.password, salt);
});

const GhostUser = mongoose.model("GhostUser", ghostUserSchema);
export default GhostUser;