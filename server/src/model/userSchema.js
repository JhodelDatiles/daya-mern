import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    // 1. UNIQUE IDENTIFIERS & AUTHENTICATION
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // prevents duplicate accounts
      lowercase: true, // normalize email
      trim: true, // remove spaces
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"], // basic email validation
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // do NOT return password in queries
      minlength: [8, "Password must be at least 8 characters long"],
    },

    // 2. PROFILE INFORMATION
    username: {
      type: String,
      // unique: true,
      sparse: true, // allows multiple null values
      trim: true,
    },

    avatar: {
      type: String,
      default: "default-avatar.png",
    },

    // 3. ACCOUNT STATUS & ROLES
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

    // 4. EMAIL VERIFICATION SYSTEM
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    verification: {
      token: {
        type: String,
        default: null, // stores verification token
      },
      expiresAt: {
        type: Date,
        default: null, // expiration time of token
      },
    },

    codeExpires: {
      type: Date, // used for OTP / reset codes
    },

    // 5. SESSION MANAGEMENT (REFRESH TOKENS)
    refreshToken: {
      type: [String],
      default: [], // ensures array is always initialized
      select: false, // hidden unless explicitly selected
    },
  },
  {
    timestamps: true, // auto add createdAt & updatedAt
  },
);

// PASSWORD HASHING MIDDLEWARE
userSchema.pre("save", async function () {
  // Only hash if password was modified
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(11); // generate salt
    this.password = await bcrypt.hash(this.password, salt); // hash password
  } catch (error) {
    throw error; // let mongoose handle error
  }
});

// MODEL EXPORT
const User = mongoose.model("User", userSchema);
export default User;
