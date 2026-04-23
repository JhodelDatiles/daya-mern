import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
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

    avatar: {
      type: String,
      default: "default-avatar.png",
    },

    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verification: {
      token: { type: String, default: null },
      version: { type: Number, default: 1 },
      expiresAt: { type: Date, default: null },
    },

    refreshToken: {
      type: [String],
      default: [],
      select: false,
    },

    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

// password hashing
userSchema.pre("save", async function () {
  if (this.$locals?.skipHash) return;
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(11);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
export default User;
