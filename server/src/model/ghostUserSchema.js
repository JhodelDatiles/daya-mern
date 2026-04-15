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
      sparse: true,
      trim: true,
    },
    verification: {
      token: { type: String, required: true },
      expiresAt: { type: Date, required: true },
    },
  },
  { timestamps: true }
);

// TTL
ghostUserSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 10 }
);

// hash password
ghostUserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(11);
  this.password = await bcrypt.hash(this.password, salt);
});

const GhostUser = mongoose.model("GhostUser", ghostUserSchema);
export default GhostUser;