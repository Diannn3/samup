import cors from "@fastify/cors";
import Fastify, { type FastifyRequest } from "fastify";
import { z } from "zod";
import type { StewardService } from "./service.js";

export async function createApi(service: StewardService) {
  const app = Fastify({logger: {level: service.env.LOG_LEVEL}});
  await app.register(cors, {
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["content-type", "x-steward-token", "x-dashboard-password"],
  });

  app.get("/health", async () => service.health());

  app.addHook("preHandler", async (request, reply) => {
    if (request.url === "/health") return;
    if (!authorized(request, service)) {
      return reply.code(401).send({error: "Unauthorized local control request."});
    }
  });

  app.get("/api/snapshot", async () => service.inspect());
  app.get("/api/plans", async () => service.repository.listPlans(service.env.DISCORD_GUILD_ID));
  app.get("/api/plans/:id", async (request, reply) => {
    const id = z.object({id: z.string()}).parse(request.params).id;
    const plan = await service.repository.getPlan(id);
    if (!plan) return reply.code(404).send({error: "Plan not found"});
    return plan;
  });
  app.post("/api/plans/generate", async () => service.generatePlan());
  app.post("/api/plans/generate-role-colors", async () => service.generateRoleColorPlan());
  app.post("/api/plans/:id/apply", async (request) => {
    const {id} = z.object({id: z.string()}).parse(request.params);
    const body = z.object({confirmationCode: z.string(), reason: z.string().min(5)}).parse(request.body);
    return service.applyPlan(id, body.confirmationCode, body.reason);
  });
  app.post("/api/plans/:id/rollback", async (request) => {
    const {id} = z.object({id: z.string()}).parse(request.params);
    const body = z.object({reason: z.string().min(5)}).parse(request.body);
    return service.rollbackPlan(id, body.reason);
  });

  app.get("/api/audit", async () => service.repository.listAudit(service.env.DISCORD_GUILD_ID));

  return app;
}

function authorized(request: FastifyRequest, service: StewardService): boolean {
  const mcpToken = request.headers["x-steward-token"];
  const dashboardPassword = request.headers["x-dashboard-password"];
  return mcpToken === service.env.STEWARD_LOCAL_TOKEN || dashboardPassword === service.env.DASHBOARD_PASSWORD;
}
