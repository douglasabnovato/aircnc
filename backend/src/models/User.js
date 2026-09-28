/* Usuário: identificado pelo e-mail (único), com hash de senha (scrypt) */
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
/* Fim de User.js */
