import mongoose from "mongoose"; // ✅ This is the ESM way

const userSchema = new mongoose.Schema(
  {
    // 1. UNIQUE IDENTIFIERS & AUTH
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true, // automatically converts email to lowercase
      trim: true, // removes any unncessary white spaces
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Prevents password from being returned in queries by default
      minlength: [8, "Password must be at least 8 characters long"],
    },

    // 2. PROFILE ESSENTIALS
    username: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple nulls if username is optional
      trim: true,
    },
    avatar: {
      type: String,
      default: "default-avatar.png",
    },

    // 3. ACCOUNT STATUS & SECURITY
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
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: [String],
      select: false, // Prevents refreshToken from being returned in queries by default
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  },
);

// Middleware: Hash password before saving
userSchema.pre("save", async function () {
  // 1. Only hash if the password actually changed
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(11);
    this.password = await bcrypt.hash(this.password, salt);
    // 💡 No next() call needed here!
  } catch (error) {
    // 2. Simply throw the error; Mongoose will catch it
    throw error;
  }
});

const User = mongoose.model("User", userSchema);
export default User;
