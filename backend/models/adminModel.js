// models/admin.model.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      sparse: true, // for admins only
    },
    userId: {
      type: String,
      unique: true,
      sparse: true, // for superadmins only
    },
    password: String,   // for admins
    password1: String,  // for superadmins
    password2: String,  // for superadmins
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash passwords before saving
adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified("password1")) {
    this.password1 = await bcrypt.hash(this.password1, 10);
  }
  if (this.isModified("password2")) {
    this.password2 = await bcrypt.hash(this.password2, 10);
  }
  next();
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
