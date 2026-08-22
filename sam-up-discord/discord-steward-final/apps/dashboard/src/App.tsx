import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, clearPassword, getPassword, setPassword } from "./api";

type Tab = "overview" | "server" | "plans" | "audit";
interface Health {status: string; discordConnected: boolean; guildId: string; guildName: string | null; startedAt: string; version: string}
interface Snapshot {guildName: string; memberCount: number; verificationLevel: number; roles: Array<{id: string; name: string; position: number; permissions: string[]}>; channels: Array<{id: string; name: string; type: string; parentId: string | null; permissionOverwrites: unknown[]}>; bots: Array<{id: string; displayName: string}>; automodRules: unknown[]; ticketHints: Array<{kind: string; name: string; reason: string}>}
interface Plan {id: string; status: string; createdAt: string; expiresAt: string; confirmationCode: string; hash: string; operations: Array<{id: string; kind: string; risk: string; description: string}>}

export function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(getPassword()));
  const [tab, setTab] = useState<Tab>("overview");
  const [health, setHealth] = useState<Health | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!authenticated) return;
    setError("");
    try {
      const [h, p, a] = await Promise.all([
        fetch("/health").then((r) => r.json()),
        api<Plan[]>("/api/plans"),
        api<any[]>("/api/audit"),
      ]);
      setHealth(h); setPlans(p); setAudit(a);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [authenticated]);

  useEffect(() => { void refresh(); }, [refresh]);

  if (!authenticated) return <Login onSuccess={() => setAuthenticated(true)} />;

  const inspect = async () => run(async () => setSnapshot(await api<Snapshot>("/api/snapshot")));
  const generatePlan = async () => run(async () => { await api("/api/plans/generate", {method: "POST"}); await refresh(); setTab("plans"); });
  async function run(action: () => Promise<void>) {
    setBusy(true); setError("");
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brandMark">DS</div><div><strong>Discord Steward</strong><span>Local control center</span></div></div>
      <nav>{(["overview", "server", "plans", "audit"] as Tab[]).map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</nav>
      <div className="sidebarFooter"><span className={`dot ${health?.discordConnected ? "online" : ""}`} />{health?.discordConnected ? "Discord connected" : "Disconnected"}<button className="link" onClick={() => {clearPassword(); setAuthenticated(false);}}>Lock</button></div>
    </aside>
    <main>
      <header><div><p className="eyebrow">ONE-SERVER STUDENT ORG SYSTEM</p><h1>{title(tab)}</h1></div><div className="actions"><button onClick={() => void refresh()} disabled={busy}>Refresh</button><button className="primary" onClick={() => void generatePlan()} disabled={busy}>Generate setup plan</button></div></header>
      {error && <div className="error">{error}</div>}
      {tab === "overview" && <Overview health={health} snapshot={snapshot} plans={plans} onInspect={inspect} busy={busy} />}
      {tab === "server" && <ServerMap snapshot={snapshot} onInspect={inspect} busy={busy} />}
      {tab === "plans" && <Plans plans={plans} refresh={refresh} run={run} />}
      {tab === "audit" && <Audit events={audit} />}
    </main>
  </div>;
}

function Login({onSuccess}: {onSuccess: () => void}) {
  const [value, setValue] = useState(""); const [error, setError] = useState("");
  async function login(e: FormEvent) {
    e.preventDefault(); setPassword(value);
    try { await api("/api/plans"); onSuccess(); } catch { clearPassword(); setError("Incorrect dashboard password or daemon unavailable."); }
  }
  return <div className="login"><form onSubmit={login}><div className="brandMark large">DS</div><p className="eyebrow">LOCAL ACCESS ONLY</p><h1>Discord Steward</h1><p>Enter the dashboard password from your local <code>.env</code> file.</p><input autoFocus type="password" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Dashboard password" /><button className="primary" type="submit">Unlock control center</button>{error && <div className="error">{error}</div>}</form></div>;
}

function Overview({health, snapshot, plans, onInspect, busy}: any) {
  return <>
    <section className="metrics">
      <Metric label="Runtime" value={health?.discordConnected ? "Connected" : "Offline"} detail={health?.guildName ?? "Waiting for Discord"} />
      <Metric label="Plans" value={String(plans.length)} detail={`${plans.filter((p: Plan) => p.status === "applied").length} applied`} />
    </section>
    <section className="panel hero"><div><p className="eyebrow">SAFE FIRST STEP</p><h2>Inspect before changing the server</h2><p>The inspector inventories roles, channels, permission overwrites, bots, AutoMod, and likely verification-ticket resources without modifying Discord.</p><button className="primary" onClick={onInspect} disabled={busy}>Run live inspection</button></div><div className="heroStat"><span>{snapshot?.memberCount ?? "—"}</span><small>members in latest snapshot</small></div></section>
    <section className="grid2"><div className="panel"><h3>Guardrails</h3><ul className="checks"><li>Single configured guild only</li><li>No Discord admin commands</li><li>Administrator permission rejected</li><li>Frozen plans and confirmation codes</li><li>Shadow moderation by default</li></ul></div><div className="panel"><h3>Ticket-system hints</h3>{snapshot?.ticketHints?.length ? snapshot.ticketHints.slice(0, 6).map((hint: any) => <div className="row" key={`${hint.kind}-${hint.name}`}><span>{hint.kind}</span><strong>{hint.name}</strong></div>) : <Empty text="Run an inspection to discover the existing verification system." />}</div></section>
  </>;
}

function ServerMap({snapshot, onInspect, busy}: any) {
  if (!snapshot) return <div className="panel"><Empty text="No live snapshot loaded." /><button className="primary" onClick={onInspect} disabled={busy}>Inspect server</button></div>;
  return <section className="grid2"><div className="panel"><h3>Roles</h3>{snapshot.roles.sort((a: any,b: any)=>b.position-a.position).map((role: any) => <div className="resource" key={role.id}><strong>{role.name}</strong><span>{role.permissions.length} permissions · position {role.position}</span></div>)}</div><div className="panel"><h3>Channels</h3>{snapshot.channels.sort((a: any,b: any)=>a.position-b.position).map((channel: any) => <div className="resource" key={channel.id}><strong>{channel.type === "GuildCategory" ? channel.name : `#${channel.name}`}</strong><span>{channel.type} · {channel.permissionOverwrites.length} overwrites</span></div>)}</div></section>;
}

function Plans({plans, refresh, run}: {plans: Plan[]; refresh: () => Promise<void>; run: (a:()=>Promise<void>)=>Promise<void>}) {
  const [selected, setSelected] = useState<Plan | null>(plans[0] ?? null);
  useEffect(() => { if (!selected && plans[0]) setSelected(plans[0]); }, [plans, selected]);
  async function apply(plan: Plan) { const reason = prompt("Audit reason for applying this exact plan:"); if (!reason) return; await run(async () => { await api(`/api/plans/${plan.id}/apply`, {method:"POST", body:{confirmationCode: plan.confirmationCode, reason}}); await refresh(); }); }
  async function rollback(plan: Plan) { const reason = prompt("Reason for rollback:"); if (!reason) return; await run(async () => { await api(`/api/plans/${plan.id}/rollback`, {method:"POST", body:{reason}}); await refresh(); }); }
  return <section className="split"><div className="panel list">{plans.length ? plans.map((plan) => <button key={plan.id} className={selected?.id === plan.id ? "selected" : ""} onClick={() => setSelected(plan)}><strong>{plan.id.slice(0, 18)}</strong><span>{plan.status} · {plan.operations.length} operations</span></button>) : <Empty text="No plans generated yet." />}</div><div className="panel">{selected ? <><div className="planHead"><div><span className={`badge ${selected.status}`}>{selected.status}</span><h2>{selected.id}</h2></div><code>{selected.hash.slice(0, 16)}…</code></div><p>Expires {new Date(selected.expiresAt).toLocaleString()}</p><div className="operations">{selected.operations.map((op) => <div className="operation" key={op.id}><span className={`risk ${op.risk}`}>{op.risk}</span><div><strong>{op.kind}</strong><p>{op.description}</p></div></div>)}</div><div className="confirm"><span>Confirmation code</span><code>{selected.confirmationCode}</code></div><div className="actions">{selected.status === "planned" && <button className="danger" onClick={() => void apply(selected)}>Apply exact plan</button>}{["applied","failed"].includes(selected.status) && <button className="danger" onClick={() => void rollback(selected)}>Rollback</button>}</div></> : <Empty text="Select a plan." />}</div></section>;
}



function Audit({events}: {events: any[]}) { return <section className="panel timeline">{events.map((event) => <div key={event.id}><span className="timelineDot" /><div><strong>{event.action}</strong><p>{event.reason || "No reason supplied"}</p><small>{new Date(event.createdAt).toLocaleString()} · {event.actor}</small></div></div>)}{!events.length && <Empty text="No audit events yet." />}</section>; }
function Metric({label,value,detail}:{label:string;value:string;detail:string}) { return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>; }
function Empty({text}:{text:string}) { return <p className="empty">{text}</p>; }
function title(tab: Tab) { return ({overview:"Operations overview",server:"Server map",plans:"Setup plans",audit:"Audit history"})[tab]; }
