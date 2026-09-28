/* Spot: espaço oferecido por uma empresa; a URL pública da imagem é montada pela API */
const mongoose = require("mongoose");

const SpotSchema = new mongoose.Schema({
  thumbnail: { type: String, required: true },
  company: { type: String, required: true, trim: true },
  price: { type: Number, default: 0, min: 0 },
  techs: { type: [String], index: true },
  techsLower: { type: [String], index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model("Spot", SpotSchema);
/* Fim de Spot.js */
