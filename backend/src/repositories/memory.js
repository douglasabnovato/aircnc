/* Repositórios em memória com o mesmo contrato do Mongo (testes e demonstração local) */
const { randomUUID } = require("node:crypto");

function createMemoryRepos() {
  const users = new Map();
  const spots = new Map();
  const bookings = new Map();
  const id = () => randomUUID().replace(/-/g, "").slice(0, 24);

  /* Reserva com spot e usuário embutidos, como o populate do Mongo */
  const populated = (b) => b && { ...b, spot: spots.get(b.spot) || null, user: users.get(b.user) ? { _id: b.user, email: users.get(b.user).email } : null };

  return {
    users: {
      async findByEmail(email) {
        for (const u of users.values()) if (u.email === email) return u;
        return null;
      },
      async create(email, passwordHash) {
        for (const u of users.values()) if (u.email === email) throw Object.assign(new Error("dup"), { code: "DUPLICATE" });
        const u = { _id: id(), email, passwordHash };
        users.set(u._id, u);
        return u;
      },
      async claim(uid, passwordHash) {
        const u = users.get(uid);
        if (!u || u.passwordHash) return false;
        u.passwordHash = passwordHash;
        return true;
      },
      async findById(uid) { return users.get(uid) || null; },
    },
    spots: {
      async create(data) {
        const s = { _id: id(), ...data, createdAt: new Date().toISOString() };
        spots.set(s._id, s);
        return s;
      },
      async byTech(tech) { return [...spots.values()].filter((s) => s.techs.some((t) => t.toLowerCase() === tech.toLowerCase())).reverse(); },
      async byOwner(uid) { return [...spots.values()].filter((s) => s.user === uid).reverse(); },
      async findById(sid) { return spots.get(sid) || null; },
    },
    bookings: {
      async create(data) {
        for (const b of bookings.values()) {
          if (b.user === data.user && b.spot === data.spot && b.date === data.date) { const e = new Error("duplicate"); e.code = "DUPLICATE"; throw e; }
        }
        const b = { _id: id(), approved: null, ...data };
        bookings.set(b._id, b);
        return populated(b);
      },
      async findById(bid) { return populated(bookings.get(bid)); },
      async setApproved(bid, approved) { bookings.get(bid).approved = approved; return populated(bookings.get(bid)); },
      async pendingForSpots(ids) { return [...bookings.values()].filter((b) => ids.includes(b.spot) && b.approved === null).map(populated); },
    },
  };
}

module.exports = { createMemoryRepos };
/* Fim de memory.js */
