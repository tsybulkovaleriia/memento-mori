import Fastify from "fastify";
import cors from "@fastify/cors";
import { placesRoutes } from "./routes/places";
import { collectionsRoutes } from "./routes/collections";

const app = Fastify({ logger: true });

async function main() {
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  });

  await app.register(placesRoutes, { prefix: "/api" });
  await app.register(collectionsRoutes, { prefix: "/api" });

  app.get("/health", async () => ({ status: "ok" }));

  const port = Number(process.env.PORT ?? 4000);
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`API running on http://localhost:${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
