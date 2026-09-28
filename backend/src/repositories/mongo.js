/* Repositórios sobre Mongoose: devolvem objetos simples no formato usado pela API */
const User = require("../models/User");
const Spot = require("../models/Spot");
const Booking = require("../models/Booking");

/* Converte documento em objeto simples com ids em texto */
function plain(doc) {
  if (!doc) return null;
  const o = typeof doc.toObject === "function" ? doc.toObject() : doc;
  const out = { ...o, _id: String(o._id) };
  if (o.user && typeof o.user === "object" && !o.user.email) out.user = String(o.user);
  if (o.spot && typeof o.spot === "object" && !o.spot.company) out.spot = String(o.spot);
  delete out.__v;
  delete out.techsLower;
  return out;
}

/* Popula spot e usuário (só e-mail) de uma reserva */
async function populated(id) {
  const b = await Booking.findById(id).populate("spot").populate("user", "email").lean();
  if (!b) return null;
  return { ...plain(b), spot: b.spot ? plain(b.spot) : null, user: b.user ? { _id: String(b.user._id), email: b.user.email } : null };
}

function createMongoRepos() {
  return {
    users: {
      async findByEmail(email) { return plain(await User.findOne({ email }).lean()); },
      /* Cria a conta; e-mail repetido (índice único) vira erro DUPLICATE */
      async create(email, passwordHash) {
        try { return plain((await User.create({ email, passwordHash })).toObject()); }
        catch (err) { if (err.code === 11000) throw Object.assign(new Error("dup"), { code: "DUPLICATE" }); throw err; }
      },
      /* Conta antiga sem senha: grava a primeira senha de forma atômica (só se ainda não houver) */
      async claim(id, passwordHash) {
        const r = await User.updateOne({ _id: id, passwordHash: { $exists: false } }, { $set: { passwordHash } });
        return r.modifiedCount === 1;
      },
      async findById(id) { return plain(await User.findById(id).lean().catch(() => null)); },
    },
    spots: {
      async create(data) { return plain(await Spot.create({ ...data, techsLower: data.techs.map((t) => t.toLowerCase()) })); },
      async byTech(tech) { return (await Spot.find({ techsLower: tech.toLowerCase() }).sort({ createdAt: -1 }).limit(50).lean()).map(plain); },
      async byOwner(userId) { return (await Spot.find({ user: userId }).sort({ createdAt: -1 }).lean()).map(plain); },
      async findById(id) { return plain(await Spot.findById(id).lean().catch(() => null)); },
    },
    bookings: {
      async create(data) {
        try {
          const b = await Booking.create(data);
          return populated(b._id);
        } catch (err) {
          if (err.code === 11000) { const e = new Error("duplicate"); e.code = "DUPLICATE"; throw e; }
          throw err;
        }
      },
      async findById(id) { return populated(id).catch(() => null); },
      async setApproved(id, approved) { await Booking.updateOne({ _id: id }, { approved }); return populated(id); },
      async pendingForSpots(spotIds) {
        const list = await Booking.find({ spot: { $in: spotIds }, approved: null }).sort({ createdAt: 1 }).select("_id").lean();
        return Promise.all(list.map((b) => populated(b._id)));
      },
    },
  };
}

module.exports = { createMongoRepos };
/* Fim de mongo.js */
