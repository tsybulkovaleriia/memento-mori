import type { FastifyInstance } from "fastify";

export async function placesRoutes(app: FastifyInstance) {
  // GET /api/places
  app.get("/places", async (request, reply) => {
    // TODO: query from DB
    return { places: [], total: 0 };
  });

  // GET /api/places/random
  app.get("/places/random", async (request, reply) => {
    // TODO: query from DB
    return { place: null };
  });

  // GET /api/places/:id
  app.get<{ Params: { id: string } }>("/places/:id", async (request, reply) => {
    const { id } = request.params;
    // TODO: query from DB
    return reply.status(404).send({ error: "Not found" });
  });
}
