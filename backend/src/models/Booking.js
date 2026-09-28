/* Reserva: pedido de um dev para um spot em uma data; approved fica null até o dono decidir */
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  date: { type: String, required: true },
  approved: { type: Boolean, default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  spot: { type: mongoose.Schema.Types.ObjectId, ref: "Spot", required: true, index: true },
}, { timestamps: true });

BookingSchema.index({ user: 1, spot: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Booking", BookingSchema);
/* Fim de Booking.js */
