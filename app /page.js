"use client";

import { useEffect, useMemo, useState } from "react";
import { seedData } from "../lib/seed";
import {
  canTeamEnter,
  competitionById,
  generateRoundRobin,
  playerStats,
  refereeById,
  requiredLineup,
  requiredSquad,
  standings,
  teamById,
  uid,
  venueById
} from "../lib/matchday";

const STORAGE_KEY = "matchday-web-v1";
const navItems = ["Home", "Team", "Competitions", "Fixtures", "Stats", "Venues", "Referee"];
const roles = ["Manager", "Player", "Venue Owner", "Referee"];

function cloneSeed() {
  return JSON.parse(JSON.stringify(seedData));
}

function Badge({ team, small = false }) {
  return <div className={`teamBadge ${small ? "small" : ""}`}>{team?.badge || "MD"}</div>;
}

function Pill({ children, tone = "default" }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

function Empty({ title, text }) {
  return <div className="empty"><div className="emptyIcon">⚽</div><h3>{title}</h3><p>{text}</p></div>;
}

function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="modalBackdrop" onMouseDown={onClose}>
      <div className={`modal ${wide ? "wide" : ""}`} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modalHeader"><h2>{title}</h2><button className="iconButton" onClick={onClose}>×</button></div>
        {children}
      </div>
    </div>
  );
}

function AppShell({ role, setRole, active, setActive, children, resetDemo }) {
  const visible = navItems.filter((item) => {
    if (role === "Player") return ["Home", "Team", "Competitions", "Fixtures", "Stats"].includes(item);
    if (role === "Venue Owner") return ["Home", "Competitions", "Fixtures", "Stats", "Venues", "Referee"].includes(item);
    if (role === "Referee") return ["Home", "Fixtures", "Stats", "Referee"].includes(item);
    return true;
  });

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand"><div className="brandMark">M</div><div><strong>MatchDay</strong><span>Play. Compete. Remember.</span></div></div>
        <nav>{visible.map((item) => <button key={item} className={active === item ? "active" : ""} onClick={() => setActive(item)}><span>{navIcon(item)}</span>{item}</button>)}</nav>
        <div className="sidebarBottom">
          <span className="mutedLabel">Demo as</span>
          <select value={role} onChange={(event) => { setRole(event.target.value); setActive("Home"); }}>
            {roles.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="textButton" onClick={resetDemo}>Reset demo data</button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar"><div><span className="eyebrow">MATCHDAY SOCIAL FOOTBALL</span><h1>{active}</h1></div><div className="profile"><div className="avatar">TM</div><div><strong>Tshego</strong><span>{role}</span></div></div></header>
        {children}
      </main>
    </div>
  );
}

function navIcon(item) {
  return { Home: "⌂", Team: "♟", Competitions: "🏆", Fixtures: "◷", Stats: "▥", Venues: "⌖", Referee: "⚑" }[item];
}

export default function MatchDayPage() {
  const [data, setData] = useState(cloneSeed);
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState("Manager");
  const [active, setActive] = useState("Home");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const managerTeam = data.teams.find((team) => team.managerId === "u-manager-1") || null;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setData(JSON.parse(saved));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, ready]);

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function resetDemo() {
    setData(cloneSeed());
    setActive("Home");
    notify("Demo data reset.");
  }

  if (!ready) return <div className="loading">Loading MatchDay…</div>;

  const common = { data, setData, role, managerTeam, setModal, notify, setActive };
  let content = <Dashboard {...common} />;
  if (active === "Team") content = <TeamView {...common} />;
  if (active === "Competitions") content = <Competitions {...common} />;
  if (active === "Fixtures") content = <Fixtures {...common} />;
  if (active === "Stats") content = <Stats {...common} />;
  if (active === "Venues") content = <Venues {...common} />;
  if (active === "Referee") content = <RefereeCentre {...common} />;

  return (
    <AppShell role={role} setRole={setRole} active={active} setActive={setActive} resetDemo={resetDemo}>
      {content}
      {modal?.type === "player" && <PlayerModal {...common} onClose={() => setModal(null)} />}
      {modal?.type === "competition" && <CompetitionModal {...common} onClose={() => setModal(null)} />}
      {modal?.type === "venue" && <VenueModal {...common} onClose={() => setModal(null)} />}
      {modal?.type === "lineup" && <LineupModal {...common} fixtureId={modal.fixtureId} onClose={() => setModal(null)} />}
      {modal?.type === "officiate" && <OfficiateModal {...common} fixtureId={modal.fixtureId} onClose={() => setModal(null)} />}
      {toast && <div className="toast">{toast}</div>}
    </AppShell>
  );
}

function Dashboard({ data, role, managerTeam, setActive, setModal }) {
  const teamFixtures = managerTeam ? data.fixtures.filter((fixture) => fixture.homeTeamId === managerTeam.id || fixture.awayTeamId === managerTeam.id) : [];
  const nextFixture = teamFixtures.filter((fixture) => fixture.status !== "Played").sort((a, b) => a.date.localeCompare(b.date))[0];
  const played = teamFixtures.filter((fixture) => fixture.status === "Played");
  const wins = played.filter((fixture) => (fixture.homeTeamId === managerTeam?.id && fixture.homeScore > fixture.awayScore) || (fixture.awayTeamId === managerTeam?.id && fixture.awayScore > fixture.homeScore)).length;
  const goals = playerStats(data).filter((row) => row.teamId === managerTeam?.id).reduce((sum, row) => sum + row.goals, 0);
  const roleCopy = {
    Manager: ["Build the squad. Join the competition. Set the line-up.", "Create or discover competitions and manage your team from one place."],
    Player: ["Your team. Your fixtures. Your numbers.", "Follow the next match and see how you are performing across competitions."],
    "Venue Owner": ["Turn your venue into a football community.", "Create competitions, approve teams and coordinate fixtures and referees."],
    Referee: ["Everything you need before the whistle.", "Review assigned fixtures, line-ups and capture match events live."]
  }[role];

  return <section className="pageStack">
    <div className="hero">
      <div><Pill tone="green">{role} workspace</Pill><h2>{roleCopy[0]}</h2><p>{roleCopy[1]}</p><div className="heroActions">
        {role === "Manager" && <><button className="primary" onClick={() => setActive("Competitions")}>Find a competition</button><button className="secondary" onClick={() => setModal({ type: "player" })}>Invite player</button></>}
        {role === "Venue Owner" && <button className="primary" onClick={() => setModal({ type: "competition" })}>Create competition</button>}
        {role === "Referee" && <button className="primary" onClick={() => setActive("Referee")}>View assignments</button>}
        {role === "Player" && <button className="primary" onClick={() => setActive("Fixtures")}>View fixtures</button>}
      </div>
      </div>
      <div className="heroBall">⚽</div>
    </div>
    <div className="metricGrid">
      <Metric label="Team wins" value={wins} sub={`${played.length} matches played`} />
      <Metric label="Goals scored" value={goals} sub="Recorded match events" />
      <Metric label="Competitions" value={data.competitions.filter((c) => c.teamIds.includes(managerTeam?.id)).length} sub="Current team entries" />
      <Metric label="Trophies" value={managerTeam?.trophies || 0} sub="Team honours" />
    </div>
    <div className="twoCol">
      <div className="panel"><div className="panelHeader"><div><span className="eyebrow">UP NEXT</span><h3>Next fixture</h3></div><button className="textButton" onClick={() => setActive("Fixtures")}>All fixtures →</button></div>
        {nextFixture ? <FixtureCard data={data} fixture={nextFixture} /> : <Empty title="No upcoming fixture" text="Join a competition to get a match on the calendar." />}
      </div>
      <div className="panel"><div className="panelHeader"><div><span className="eyebrow">FORM</span><h3>Recent results</h3></div></div>
        <div className="resultList">{played.slice(-4).reverse().map((fixture) => <CompactResult key={fixture.id} data={data} fixture={fixture} />)}</div>
      </div>
    </div>
  </section>;
}

function Metric({ label, value, sub }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{sub}</small></div>;
}

function TeamView({ data, setData, managerTeam, role, setModal, notify }) {
  if (!managerTeam) return <Empty title="No team yet" text="Create a team to start your MatchDay journey." />;
  const players = data.players.filter((player) => player.teamId === managerTeam.id);
  const minimum = requiredSquad(managerTeam.format);
  function removePlayer(id) {
    setData((prev) => ({ ...prev, players: prev.players.filter((player) => player.id !== id) }));
    notify("Player removed from squad.");
  }
  return <section className="pageStack">
    <div className="teamHero panel"><div className="teamIdentity"><Badge team={managerTeam} /><div><Pill tone="green">{managerTeam.format}</Pill><h2>{managerTeam.name}</h2><p>{managerTeam.location} · {players.length} registered players</p></div></div><div className="eligibility"><span>Competition eligibility</span><strong>{players.length >= minimum ? "Ready to compete" : `${minimum - players.length} more player(s) needed`}</strong><div className="progress"><i style={{ width: `${Math.min(100, (players.length / minimum) * 100)}%` }} /></div></div></div>
    <div className="panel"><div className="panelHeader"><div><span className="eyebrow">SQUAD</span><h3>Registered players</h3></div>{role === "Manager" && <button className="primary smallBtn" onClick={() => setModal({ type: "player" })}>+ Add player</button>}</div>
      <div className="playerGrid">{players.map((player) => <div className="playerCard" key={player.id}><div className="playerNo">{player.number}</div><div><strong>{player.name}</strong><span>{player.position}</span></div>{role === "Manager" && <button className="iconButton danger" onClick={() => removePlayer(player.id)}>×</button>}</div>)}</div>
    </div>
  </section>;
}

function PlayerModal({ data, setData, managerTeam, onClose, notify }) {
  const [form, setForm] = useState({ name: "", number: "", position: "Forward" });
  function submit(event) {
    event.preventDefault();
    if (!managerTeam || !form.name.trim() || !form.number) return;
    const player = { id: uid("player"), teamId: managerTeam.id, name: form.name.trim(), number: Number(form.number), position: form.position };
    setData((prev) => ({ ...prev, players: [...prev.players, player] }));
    onClose(); notify(`${player.name} added to ${managerTeam.name}.`);
  }
  return <Modal title="Invite / add player" onClose={onClose}><form onSubmit={submit} className="formStack"><label>Player name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" autoFocus /></label><div className="formRow"><label>Jersey number<input type="number" min="1" max="99" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} /></label><label>Position<select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}><option>Goalkeeper</option><option>Defender</option><option>Midfielder</option><option>Forward</option></select></label></div><p className="formHint">In production this action will send an invite. For this runnable prototype the player is added immediately.</p><button className="primary" type="submit">Add player</button></form></Modal>;
}

function Competitions({ data, setData, managerTeam, role, setModal, notify }) {
  function requestJoin(competition) {
    if (!managerTeam) return;
    const eligibility = canTeamEnter(data, managerTeam.id, competition);
    if (!eligibility.ok) return notify(eligibility.reason);
    setData((prev) => ({ ...prev, competitions: prev.competitions.map((item) => item.id === competition.id ? { ...item, requests: [...(item.requests || []), { id: uid("request"), teamId: managerTeam.id, status: "Pending" }] } : item) }));
    notify("Join request sent to the competition owner.");
  }

  function decide(compId, requestId, decision) {
    setData((prev) => {
      const competitions = prev.competitions.map((competition) => {
        if (competition.id !== compId) return competition;
        const request = (competition.requests || []).find((item) => item.id === requestId);
        return {
          ...competition,
          teamIds: decision === "Accepted" && request && !competition.teamIds.includes(request.teamId) ? [...competition.teamIds, request.teamId] : competition.teamIds,
          requests: (competition.requests || []).map((item) => item.id === requestId ? { ...item, status: decision } : item)
        };
      });
      return { ...prev, competitions };
    });
    notify(`Request ${decision.toLowerCase()}.`);
  }

  return <section className="pageStack"><div className="sectionIntro"><div><span className="eyebrow">PLAY TOGETHER</span><h2>{role === "Venue Owner" ? "Your competitions" : "Discover competitions"}</h2><p>League, tournament and social football sessions organised around real venues.</p></div>{["Manager", "Venue Owner"].includes(role) && <button className="primary" onClick={() => setModal({ type: "competition" })}>+ Create competition</button>}</div>
    <div className="competitionGrid">{data.competitions.map((competition) => <CompetitionCard key={competition.id} data={data} competition={competition} role={role} managerTeam={managerTeam} requestJoin={requestJoin} decide={decide} setData={setData} notify={notify} />)}</div>
  </section>;
}

function CompetitionCard({ data, competition, role, managerTeam, requestJoin, decide, setData, notify }) {
  const venue = venueById(data, competition.venueId);
  const joined = competition.teamIds.includes(managerTeam?.id);
  const pending = (competition.requests || []).some((r) => r.teamId === managerTeam?.id && r.status === "Pending");
  const pendingRequests = (competition.requests || []).filter((r) => r.status === "Pending");
  const rows = standings(data, competition.id);
  function generate() {
    const existing = data.fixtures.some((fixture) => fixture.competitionId === competition.id);
    if (existing) return notify("Fixtures already exist for this competition.");
    const created = generateRoundRobin(competition.teamIds, competition.startDate, competition.venueId, competition.id);
    setData((prev) => ({ ...prev, fixtures: [...prev.fixtures, ...created] }));
    notify(`${created.length} fixtures generated.`);
  }
  return <div className="competitionCard"><div className="competitionTop"><div className="cup">🏆</div><div className="grow"><div className="inlineGap"><Pill tone={competition.status === "Open" ? "green" : "default"}>{competition.status}</Pill><Pill>{competition.format}</Pill></div><h3>{competition.name}</h3><p>{competition.type} · {venue?.name} · {venue?.location}</p></div></div><div className="competitionMeta"><span><b>{competition.teamIds.length}/{competition.teamLimit}</b> teams</span><span><b>{competition.minutesPerHalf}</b> min / half</span><span><b>{competition.startDate}</b> starts</span></div>
    {rows.length > 0 && <div className="miniTable">{rows.slice(0, 3).map((row, index) => <div key={row.teamId}><span>{index + 1}</span><Badge team={teamById(data, row.teamId)} small /><strong>{teamById(data, row.teamId)?.name}</strong><b>{row.points} pts</b></div>)}</div>}
    {role === "Manager" && <div className="cardActions">{joined ? <Pill tone="green">Team joined</Pill> : pending ? <Pill tone="amber">Request pending</Pill> : <button className="secondary" onClick={() => requestJoin(competition)}>Request to join</button>}</div>}
    {role === "Venue Owner" && <div className="ownerBox"><div className="ownerTitle"><strong>{pendingRequests.length} pending request(s)</strong><button className="textButton" onClick={generate}>Generate fixtures</button></div>{pendingRequests.map((request) => <div className="requestRow" key={request.id}><span>{teamById(data, request.teamId)?.name}</span><div><button className="tinyApprove" onClick={() => decide(competition.id, request.id, "Accepted")}>Accept</button><button className="tinyDecline" onClick={() => decide(competition.id, request.id, "Declined")}>Decline</button></div></div>)}</div>}
  </div>;
}

function CompetitionModal({ data, setData, managerTeam, role, onClose, notify }) {
  const [form, setForm] = useState({ name: "", type: "League", format: "5-a-side", venueId: data.venues[0]?.id || "", teamLimit: 8, minutesPerHalf: 20, startDate: "2026-11-15" });
  function submit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.venueId) return;
    let autoTeamIds = [];
    if (role === "Manager" && managerTeam) {
      const squadCount = data.players.filter((p) => p.teamId === managerTeam.id).length;
      if (managerTeam.format === form.format && squadCount >= requiredSquad(form.format)) autoTeamIds = [managerTeam.id];
    }
    const competition = { id: uid("comp"), ...form, name: form.name.trim(), teamLimit: Number(form.teamLimit), minutesPerHalf: Number(form.minutesPerHalf), ownerType: role, ownerId: role === "Venue Owner" ? "u-venue-1" : "u-manager-1", status: "Open", teamIds: autoTeamIds, requests: [] };
    setData((prev) => ({ ...prev, competitions: [...prev.competitions, competition] }));
    onClose(); notify(autoTeamIds.length ? "Competition created and your team was added." : "Competition created.");
  }
  return <Modal title="Create competition" onClose={onClose}><form className="formStack" onSubmit={submit}><label>Competition name<input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Friday Night League" /></label><div className="formRow"><label>Type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>League</option><option>Tournament</option></select></label><label>Format<select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}><option>5-a-side</option><option>11-a-side</option></select></label></div><label>Venue<select value={form.venueId} onChange={(e) => setForm({ ...form, venueId: e.target.value })}>{data.venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name} — {venue.location}</option>)}</select></label><div className="formRow"><label>Number of teams<input type="number" min="2" max="20" value={form.teamLimit} onChange={(e) => setForm({ ...form, teamLimit: e.target.value })} /></label><label>Minutes per half<input type="number" min="5" max="45" value={form.minutesPerHalf} onChange={(e) => setForm({ ...form, minutesPerHalf: e.target.value })} /></label></div><label>Start date<input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label><button className="primary" type="submit">Create competition</button></form></Modal>;
}

function Fixtures({ data, managerTeam, role, setModal }) {
  const fixtures = data.fixtures.filter((fixture) => role === "Manager" || role === "Player" ? fixture.homeTeamId === managerTeam?.id || fixture.awayTeamId === managerTeam?.id : true).sort((a, b) => a.date.localeCompare(b.date));
  const grouped = Object.groupBy ? Object.groupBy(fixtures, (fixture) => fixture.date) : fixtures.reduce((acc, fixture) => { (acc[fixture.date] ||= []).push(fixture); return acc; }, {});
  return <section className="pageStack"><div className="sectionIntro"><div><span className="eyebrow">MATCH CALENDAR</span><h2>Fixtures & results</h2><p>Set your line-up before kick-off and follow the official result after full-time.</p></div></div>{fixtures.length ? Object.entries(grouped).map(([date, matches]) => <div className="fixtureDay" key={date}><div className="dateRail"><span>{new Date(`${date}T12:00:00`).toLocaleDateString("en-ZA", { weekday: "short" })}</span><strong>{new Date(`${date}T12:00:00`).getDate()}</strong><small>{new Date(`${date}T12:00:00`).toLocaleDateString("en-ZA", { month: "short" })}</small></div><div className="fixtureStack">{matches.map((fixture) => <FixtureRow key={fixture.id} data={data} fixture={fixture} role={role} managerTeam={managerTeam} setModal={setModal} />)}</div></div>) : <Empty title="No fixtures" text="Fixtures appear here after a competition has generated its schedule." />}</section>;
}

function FixtureCard({ data, fixture }) {
  const home = teamById(data, fixture.homeTeamId); const away = teamById(data, fixture.awayTeamId); const competition = competitionById(data, fixture.competitionId); const venue = venueById(data, fixture.venueId);
  return <div className="fixtureFeature"><span className="eyebrow">{competition?.name}</span><div className="versus"><div><Badge team={home} /><strong>{home?.name}</strong></div><div className="matchTime"><b>{fixture.time}</b><span>{fixture.date}</span><Pill>{fixture.status}</Pill></div><div><Badge team={away} /><strong>{away?.name}</strong></div></div><p className="venueLine">⌖ {venue?.name}, {venue?.location}</p></div>;
}

function FixtureRow({ data, fixture, role, managerTeam, setModal }) {
  const home = teamById(data, fixture.homeTeamId), away = teamById(data, fixture.awayTeamId), competition = competitionById(data, fixture.competitionId), referee = refereeById(data, fixture.refereeId);
  const isTeam = fixture.homeTeamId === managerTeam?.id || fixture.awayTeamId === managerTeam?.id;
  const myLineup = managerTeam ? (fixture.lineups || {})[managerTeam.id] || [] : [];
  return <div className="fixtureRow"><div className="fixtureInfo"><span>{competition?.name} · Round {fixture.round}</span><small>{fixture.time} · {venueById(data, fixture.venueId)?.name}</small></div><div className="rowTeams"><div><Badge team={home} small /><b>{home?.name}</b></div><strong className="score">{fixture.status === "Played" ? `${fixture.homeScore} — ${fixture.awayScore}` : "VS"}</strong><div><Badge team={away} small /><b>{away?.name}</b></div></div><div className="fixtureActions"><Pill tone={fixture.status === "Played" ? "green" : "default"}>{fixture.status}</Pill>{referee && <small>⚑ {referee.name}</small>}{role === "Manager" && isTeam && fixture.status !== "Played" && <button className="secondary tiny" onClick={() => setModal({ type: "lineup", fixtureId: fixture.id })}>{myLineup.length ? `Line-up (${myLineup.length})` : "Set line-up"}</button>}{role === "Referee" && fixture.status !== "Played" && <button className="primary tiny" onClick={() => setModal({ type: "officiate", fixtureId: fixture.id })}>Officiate</button>}</div></div>;
}

function CompactResult({ data, fixture }) {
  const home = teamById(data, fixture.homeTeamId), away = teamById(data, fixture.awayTeamId);
  return <div className="compactResult"><span>{fixture.date}</span><div><b>{home?.name}</b><strong>{fixture.homeScore} — {fixture.awayScore}</strong><b>{away?.name}</b></div></div>;
}

function LineupModal({ data, setData, managerTeam, fixtureId, onClose, notify }) {
  const fixture = data.fixtures.find((item) => item.id === fixtureId);
  const competition = competitionById(data, fixture?.competitionId);
  const players = data.players.filter((player) => player.teamId === managerTeam?.id);
  const required = requiredLineup(competition?.format || managerTeam?.format);
  const [selected, setSelected] = useState((fixture?.lineups || {})[managerTeam?.id] || []);
  function toggle(id) { setSelected((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : prev.length < required ? [...prev, id] : prev); }
  function save() {
    if (selected.length !== required) return notify(`Select exactly ${required} starters.`);
    setData((prev) => ({ ...prev, fixtures: prev.fixtures.map((item) => item.id === fixtureId ? { ...item, lineups: { ...(item.lineups || {}), [managerTeam.id]: selected } } : item) })); onClose(); notify("Starting line-up submitted to the referee.");
  }
  return <Modal title={`Select starting ${required}`} onClose={onClose}><p className="formHint">Choose exactly {required} players. The referee can see this line-up before the match.</p><div className="selectPlayers">{players.map((player) => <button key={player.id} className={selected.includes(player.id) ? "selected" : ""} onClick={() => toggle(player.id)}><span>#{player.number}</span><div><b>{player.name}</b><small>{player.position}</small></div><i>{selected.includes(player.id) ? "✓" : "+"}</i></button>)}</div><button className="primary full" onClick={save}>Submit line-up · {selected.length}/{required}</button></Modal>;
}

function RefereeCentre({ data, setData, role, setModal, notify }) {
  const [refId, setRefId] = useState("r1");
  const assigned = data.fixtures.filter((fixture) => fixture.refereeId === refId && fixture.status !== "Played");
  function assign(fixtureId, refereeId) {
    setData((prev) => ({ ...prev, fixtures: prev.fixtures.map((fixture) => fixture.id === fixtureId ? { ...fixture, refereeId } : fixture) })); notify("Referee allocated.");
  }
  return <section className="pageStack"><div className="sectionIntro"><div><span className="eyebrow">OFFICIALS</span><h2>{role === "Referee" ? "My match assignments" : "Referee allocation"}</h2><p>Competition creators allocate an available referee to each fixture.</p></div>{role === "Referee" && <select className="standaloneSelect" value={refId} onChange={(e) => setRefId(e.target.value)}>{data.referees.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>}</div>
    {role === "Referee" ? <div className="panel"><div className="fixtureStack">{assigned.map((fixture) => <FixtureRow key={fixture.id} data={data} fixture={fixture} role="Referee" managerTeam={null} setModal={setModal} />)}{!assigned.length && <Empty title="No upcoming assignments" text="Assigned matches will appear here." />}</div></div> : <div className="panel"><div className="allocationList">{data.fixtures.filter((f) => f.status !== "Played").map((fixture) => <div className="allocationRow" key={fixture.id}><div><strong>{teamById(data, fixture.homeTeamId)?.name} vs {teamById(data, fixture.awayTeamId)?.name}</strong><span>{fixture.date} · {fixture.time}</span></div><select value={fixture.refereeId || ""} onChange={(e) => assign(fixture.id, e.target.value)}><option value="">Allocate referee</option>{data.referees.filter((r) => r.availability === "Available" || r.id === fixture.refereeId).map((r) => <option key={r.id} value={r.id}>{r.name} · {r.rating}★</option>)}</select></div>)}</div></div>}
  </section>;
}

function OfficiateModal({ data, setData, fixtureId, onClose, notify }) {
  const fixture = data.fixtures.find((item) => item.id === fixtureId);
  const home = teamById(data, fixture.homeTeamId), away = teamById(data, fixture.awayTeamId);
  const allPlayers = data.players.filter((player) => [fixture.homeTeamId, fixture.awayTeamId].includes(player.teamId));
  const [minute, setMinute] = useState(1);
  const [eventType, setEventType] = useState("Goal");
  const [playerId, setPlayerId] = useState(allPlayers[0]?.id || "");
  const [assistId, setAssistId] = useState("");
  function start() { setData((prev) => ({ ...prev, fixtures: prev.fixtures.map((f) => f.id === fixtureId ? { ...f, status: "Live" } : f) })); notify("Match kicked off."); }
  function addEvent(event) {
    event.preventDefault(); if (!playerId) return;
    const player = data.players.find((p) => p.id === playerId);
    const matchEvent = { id: uid("event"), type: eventType, teamId: player.teamId, playerId, assistId: eventType === "Goal" ? assistId || null : null, minute: Number(minute) };
    setData((prev) => ({ ...prev, fixtures: prev.fixtures.map((f) => {
      if (f.id !== fixtureId) return f;
      const homeGoal = eventType === "Goal" && player.teamId === f.homeTeamId ? 1 : 0;
      const awayGoal = eventType === "Goal" && player.teamId === f.awayTeamId ? 1 : 0;
      return { ...f, status: "Live", homeScore: f.homeScore + homeGoal, awayScore: f.awayScore + awayGoal, events: [...(f.events || []), matchEvent] };
    }) }));
  }
  function end() { setData((prev) => ({ ...prev, fixtures: prev.fixtures.map((f) => f.id === fixtureId ? { ...f, status: "Played" } : f) })); onClose(); notify("Full-time. Result and player stats committed."); }
  const latest = data.fixtures.find((f) => f.id === fixtureId);
  return <Modal title="Match officiating" onClose={onClose} wide><div className="scoreboard"><div><Badge team={home} /><strong>{home.name}</strong></div><b>{latest.homeScore}<span>:</span>{latest.awayScore}</b><div><Badge team={away} /><strong>{away.name}</strong></div></div><div className="liveMeta"><Pill tone={latest.status === "Live" ? "red" : "default"}>{latest.status}</Pill><span>{latest.date} · {latest.time}</span><span>⚑ {refereeById(data, latest.refereeId)?.name || "Unassigned"}</span></div>{latest.status === "Scheduled" && <button className="primary full" onClick={start}>Kick off match</button>}<div className="officiateGrid"><form className="formStack panelInset" onSubmit={addEvent}><h3>Add match event</h3><div className="formRow"><label>Event<select value={eventType} onChange={(e) => setEventType(e.target.value)}><option>Goal</option><option>Yellow</option><option>Red</option></select></label><label>Minute<input type="number" min="1" max="120" value={minute} onChange={(e) => setMinute(e.target.value)} /></label></div><label>Player<select value={playerId} onChange={(e) => setPlayerId(e.target.value)}>{allPlayers.map((p) => <option key={p.id} value={p.id}>{p.name} · {teamById(data, p.teamId)?.name}</option>)}</select></label>{eventType === "Goal" && <label>Assist<select value={assistId} onChange={(e) => setAssistId(e.target.value)}><option value="">No assist</option>{allPlayers.filter((p) => p.teamId === data.players.find((x) => x.id === playerId)?.teamId && p.id !== playerId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}<button className="secondary" type="submit">Record event</button></form><div className="panelInset eventFeed"><h3>Match commentary</h3>{[...(latest.events || [])].reverse().map((event) => { const p = data.players.find((x) => x.id === event.playerId); return <div key={event.id}><b>{event.minute}&apos;</b><span>{event.type === "Goal" ? "⚽" : event.type === "Yellow" ? "🟨" : "🟥"}</span><p><strong>{p?.name}</strong><small>{teamById(data, event.teamId)?.name}{event.assistId ? ` · assist ${data.players.find((x) => x.id === event.assistId)?.name}` : ""}</small></p></div>; })}{!(latest.events || []).length && <p className="formHint">No events recorded yet.</p>}</div></div><button className="dangerButton full" onClick={end}>End match & commit result</button></Modal>;
}

function Stats({ data }) {
  const [compId, setCompId] = useState(data.competitions[0]?.id || "");
  const table = standings(data, compId);
  const scorers = playerStats(data, compId).filter((row) => row.goals || row.assists || row.yellow || row.red).slice(0, 10);
  return <section className="pageStack"><div className="sectionIntro"><div><span className="eyebrow">PERFORMANCE</span><h2>Competition statistics</h2><p>Results feed directly into league tables, team records and player numbers.</p></div><select className="standaloneSelect" value={compId} onChange={(e) => setCompId(e.target.value)}>{data.competitions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div><div className="twoCol statsCols"><div className="panel"><div className="panelHeader"><div><span className="eyebrow">TABLE</span><h3>Standings</h3></div></div><div className="statsTable"><div className="tableHead"><span>#</span><span>Team</span><span>P</span><span>W</span><span>D</span><span>L</span><span>GD</span><span>Pts</span></div>{table.map((row, index) => <div className="tableRow" key={row.teamId}><span>{index + 1}</span><span className="tableTeam"><Badge team={teamById(data, row.teamId)} small />{teamById(data, row.teamId)?.name}</span><span>{row.played}</span><span>{row.won}</span><span>{row.drawn}</span><span>{row.lost}</span><span>{row.gd}</span><strong>{row.points}</strong></div>)}</div></div><div className="panel"><div className="panelHeader"><div><span className="eyebrow">PLAYERS</span><h3>Top performers</h3></div></div><div className="leaderList">{scorers.map((player, index) => <div key={player.playerId}><b>{index + 1}</b><div className="playerAvatar">{player.name.split(" ").map((x) => x[0]).join("").slice(0,2)}</div><p><strong>{player.name}</strong><span>{teamById(data, player.teamId)?.name}</span></p><div className="statChips"><span>⚽ {player.goals}</span><span>↗ {player.assists}</span></div></div>)}</div></div></div></section>;
}

function Venues({ data, setModal, role }) {
  return <section className="pageStack"><div className="sectionIntro"><div><span className="eyebrow">PLACES TO PLAY</span><h2>Football venues</h2><p>Competition creators select a registered venue before publishing a competition.</p></div>{role === "Venue Owner" && <button className="primary" onClick={() => setModal({ type: "venue" })}>+ Add venue</button>}</div><div className="venueGrid">{data.venues.map((venue) => <div className="venueCard" key={venue.id}><div className="venueImage"><span>⚽</span></div><div><Pill tone="green">{venue.pitches} pitches</Pill><h3>{venue.name}</h3><p>⌖ {venue.location}</p></div></div>)}</div></section>;
}

function VenueModal({ setData, onClose, notify }) {
  const [form, setForm] = useState({ name: "", location: "", pitches: 1 });
  function submit(event) { event.preventDefault(); if (!form.name.trim() || !form.location.trim()) return; setData((prev) => ({ ...prev, venues: [...prev.venues, { id: uid("venue"), ownerId: "u-venue-1", name: form.name.trim(), location: form.location.trim(), pitches: Number(form.pitches) }] })); onClose(); notify("Venue added."); }
  return <Modal title="Add venue" onClose={onClose}><form className="formStack" onSubmit={submit}><label>Venue name<input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label><label>Number of pitches<input type="number" min="1" value={form.pitches} onChange={(e) => setForm({ ...form, pitches: e.target.value })} /></label><button className="primary">Add venue</button></form></Modal>;
}
