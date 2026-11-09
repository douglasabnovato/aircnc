/* Reserva: pedido de um dev para um spot em uma data; approved fica null até o dono decidir */
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  date: { type: String, required: true },
  approved: { type: Boolean, default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  spot: { type: mongoose.Schema.Types.ObjectId, ref: "Spot", required: true, index: true },
}, { timestamps: true });

BookingSchema.index({ user: 1, spot: 1, date: 1 }, { unique: true });
/* No máximo uma reserva aprovada por spot e data, garantida pelo banco mesmo com dois cliques ao mesmo tempo */
BookingSchema.index({ spot: 1, date: 1 }, { unique: true, partialFilterExpression: { approved: true } });

const Booking = mongoose.model("Booking", BookingSchema);
/* Falha ao criar índice (ex.: aprovações em dobro antigas no banco) não pode passar em silêncio */
Booking.on("index", (err) => { if (err) console.error("Índice de reservas não criado:", err.message); });

module.exports = Booking;
/* Fim de Booking.js */
