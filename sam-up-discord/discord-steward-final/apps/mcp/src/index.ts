import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const apiUrl = process.env.STEWARD_API_URL ?? "http://127.0.0.1:4317";
const parsedApiUrl = new URL(apiUrl);
if (!new Set(["127.0.0.1", "localhost", "[::1]"]).has(parsedApiUrl.hostname)) {
  throw new Error("STEWARD_API_URL must point to a loopback address.");
}
const token = process.env.STEWARD_LOCAL_TOKEN;
if (!token) throw new Error("STEWARD_LOCAL_TOKEN is required for the Antigravity MCP server.");

const server = new McpServer(
  {name: "discord-steward", version: "1.0.0"},
  {instructions: "Inspect before planning. Preview before applying. Never apply a structural plan without showing every operation and receiving explicit user approval."},
);

server.registerTool("steward_health", {
  title: "Discord Steward Health",
  description: "Check whether the local Discord Steward daemon and Discord connection are healthy.",
  inputSchema: z.object({}),
  annotations: {readOnlyHint: true, destructiveHint: false},
}, async () => text(await request("/health", {auth: false})));

server.registerTool("steward_inspect_server", {
  title: "Inspect Discord Server",
  description: "Read the one configured Discord server, save a snapshot, and return roles, channels, bots, AutoMod rules, permissions, and ticket-system hints. Makes no Discord changes.",
  inputSchema: z.object({}),
  annotations: {readOnlyHint: true, destructiveHint: false},
}, async () => text(await request("/api/snapshot")));

server.registerTool("steward_generate_setup_plan", {
  title: "Generate Setup Plan",
  description: "Compare apps/daemon/config/server.yaml with the live server and store an immutable setup plan. Does not apply changes.",
  inputSchema: z.object({}),
  annotations: {readOnlyHint: true, destructiveHint: false},
}, async () => text(await request("/api/plans/generate", {method: "POST"})));

server.registerTool("steward_generate_role_color_plan", {
  title: "Generate Role Color Plan",
  description: "Inspect the live server and store an immutable color-only plan for configured human roles. It cannot create roles or change permissions, names, channels, or bot roles.",
  inputSchema: z.object({}),
  annotations: {readOnlyHint: true, destructiveHint: false},
}, async () => text(await request("/api/plans/generate-role-colors", {method: "POST"})));

server.registerTool("steward_list_plans", {
  title: "List Setup Plans",
  description: "List recent setup plans and statuses.",
  inputSchema: z.object({}),
  annotations: {readOnlyHint: true, destructiveHint: false},
}, async () => text(await request("/api/plans")));

server.registerTool("steward_preview_plan", {
  title: "Preview Setup Plan",
  description: "Return one immutable plan including operations, risk levels, hash, expiry, and confirmation code. Review it with the user before apply.",
  inputSchema: z.object({planId: z.string().min(1)}),
  annotations: {readOnlyHint: true, destructiveHint: false},
}, async ({planId}) => text(await request(`/api/plans/${encodeURIComponent(planId)}`)));

server.registerTool("steward_apply_plan", {
  title: "Apply Approved Setup Plan",
  description: "Apply an immutable Discord structural plan. This changes roles, channels, and permission overwrites. Only call after explicit user approval of the exact plan.",
  inputSchema: z.object({
    planId: z.string().min(1),
    confirmationCode: z.string().min(6),
    reason: z.string().min(5),
  }),
  annotations: {readOnlyHint: false, destructiveHint: true, idempotentHint: false},
}, async ({planId, confirmationCode, reason}) => text(await request(`/api/plans/${encodeURIComponent(planId)}/apply`, {
  method: "POST", body: {confirmationCode, reason},
})));

server.registerTool("steward_rollback_plan", {
  title: "Rollback Setup Plan",
  description: "Reverse supported operations from an applied or failed plan. This deletes resources created by the plan and restores saved channel overwrites.",
  inputSchema: z.object({planId: z.string().min(1), reason: z.string().min(5)}),
  annotations: {readOnlyHint: false, destructiveHint: true, idempotentHint: false},
}, async ({planId, reason}) => text(await request(`/api/plans/${encodeURIComponent(planId)}/rollback`, {
  method: "POST", body: {reason},
})));



server.registerTool("steward_audit_log", {
  title: "Read Audit Log",
  description: "Read recent configuration, moderation, error, and rollback audit events.",
  inputSchema: z.object({}),
  annotations: {readOnlyHint: true, destructiveHint: false},
}, async () => text(await request("/api/audit")));

const transport = new StdioServerTransport();
await server.connect(transport);

function text(value: unknown) {
  return {content: [{type: "text" as const, text: JSON.stringify(value, null, 2)}]};
}

async function request(path: string, options: {method?: "GET" | "POST"; body?: unknown; auth?: boolean} = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(options.auth === false ? {} : {"x-steward-token": token}),
      ...(options.body ? {"content-type": "application/json"} : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const body = await response.json().catch(() => ({error: `HTTP ${response.status}`}));
  if (!response.ok) throw new Error(typeof body === "object" && body && "error" in body ? String(body.error) : `HTTP ${response.status}`);
  return body;
}
