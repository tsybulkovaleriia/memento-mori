import type { FastifyInstance } from "fastify";

export async function collectionsRoutes(app: FastifyInstance) {
  // POST /api/collections
  app.post("/collections", async (request, reply) => {
    // TODO: create in DB, return uuid
    return reply.status(201).send({ uuid: "stub" });
  });

  // GET /api/collections/:uuid
  app.get<{ Params: { uuid: string } }>("/collections/:uuid", async (request, reply) => {
    const { uuid } = request.params;
    // TODO: query from DB
    return reply.status(404).send({ error: "Not found" });
  });

  // PUT /api/collections/:uuid
  app.put<{ Params: { uuid: string } }>("/collections/:uuid", async (request, reply) => {
    return { updated: true };
  });

  // POST /api/collections/:uuid/clone
  app.post<{ Params: { uuid: string } }>("/collections/:uuid/clone", async (request, reply) => {
    return reply.status(201).send({ uuid: "new-stub" });
  });
}
