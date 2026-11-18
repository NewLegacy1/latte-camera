module.exports = function handler(request, response) {
  response.setHeader("Cache-Control", "private, no-store");
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.writeHead(405).end();
    return;
  }
  const country = request.headers["x-vercel-ip-country"];
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify({ country: typeof country === "string" && /^[A-Z]{2}$/.test(country) ? country : null }));
};
