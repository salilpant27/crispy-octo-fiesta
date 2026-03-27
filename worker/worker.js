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
      const [rawVotes, rawDest] = await Promise.all([
        env.VOTES.get("votes"),
        env.VOTES.get("destinations"),
      ]);
      const votes = rawVotes ? JSON.parse(rawVotes) : {};
      const destinations = rawDest ? JSON.parse(rawDest) : [];
      return json({ success: true, destinations, votes });
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
