const DESTINATIONS = [
  { name: "Amalfi Coast", country: "Italy",   things: ["Boat tour", "Hiking", "Swimming", "Limoncello", "Positano"] },
  { name: "Greece",       country: "Greece",  things: ["Island hop", "Acropolis", "Sailing", "Beach", "Wine tasting"] },
  { name: "Sevilla",      country: "Spain",   things: ["Flamenco", "Tapas", "Alcázar", "Cathedral", "Markets"] },
  { name: "Florence",     country: "Italy",   things: ["Uffizi", "Duomo", "Gelato", "The David", "Wine"] },
  { name: "Cannes",       country: "France",  things: ["Beach", "Monaco day trip", "Yacht", "Markets", "Nice"] },
  { name: "Finland",      country: "Finland", things: ["Sauna", "Kayaking", "Midnight sun", "Hiking", "Reindeer"] },
  { name: "Dublin",       country: "Ireland", things: ["Guinness", "Cliffs of Moher", "Pub crawl", "Kilkenny", "Galway"] },
  { name: "Castiglione della Pescaia", country: "Italy", things: ["Blue Flag beaches", "Pisa day trip", "Florence day trip", "Seafood", "Giannutri island"] },
];

const CORS = {
  "Access-Control-Allow-Origin": "https://salilpant27.github.io",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));

    if (url.pathname === "/") {
      if (body.password !== env.PASSWORD) return json({ success: false });
      const raw = await env.VOTES.get("votes");
      const votes = raw ? JSON.parse(raw) : {};
      return json({ success: true, destinations: DESTINATIONS, votes });
    }

    if (url.pathname === "/vote") {
      if (body.password !== env.PASSWORD) return json({ success: false }, 401);
      const raw = await env.VOTES.get("votes");
      const votes = raw ? JSON.parse(raw) : {};
      const { destination, direction } = body;
      votes[destination] = (votes[destination] || 0) + (direction === "up" ? 1 : -1);
      await env.VOTES.put("votes", JSON.stringify(votes));
      return json({ success: true, votes });
    }

    return json({ error: "Not found" }, 404);
  }
};
