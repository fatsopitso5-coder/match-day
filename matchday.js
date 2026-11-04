export function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function teamById(data, id) {
  return data.teams.find((team) => team.id === id);
}

export function venueById(data, id) {
  return data.venues.find((venue) => venue.id === id);
}

export function refereeById(data, id) {
  return data.referees.find((referee) => referee.id === id);
}

export function competitionById(data, id) {
  return data.competitions.find((competition) => competition.id === id);
}

export function requiredSquad(format) {
  return format === "11-a-side" ? 12 : 6;
}

export function requiredLineup(format) {
  return format === "11-a-side" ? 11 : 5;
}

export function canTeamEnter(data, teamId, competition) {
  const team = teamById(data, teamId);
  if (!team) return { ok: false, reason: "Create a team first." };
  const squad = data.players.filter((player) => player.teamId === teamId).length;
  const needed = requiredSquad(competition.format);
  if (team.format !== competition.format) {
    return { ok: false, reason: `This competition is ${competition.format}.` };
  }
  if (squad < needed) {
    return { ok: false, reason: `You need at least ${needed} registered players.` };
  }
  if (competition.teamIds.includes(teamId)) {
    return { ok: false, reason: "Your team is already in this competition." };
  }
  if ((competition.requests || []).some((request) => request.teamId === teamId && request.status === "Pending")) {
    return { ok: false, reason: "Your join request is already pending." };
  }
  if (competition.teamIds.length >= competition.teamLimit) {
    return { ok: false, reason: "This competition is full." };
  }
  return { ok: true, reason: "Eligible" };
}

export function generateRoundRobin(teamIds, startDate, venueId, competitionId) {
  if (teamIds.length < 2) return [];
  const ids = [...teamIds];
  if (ids.length % 2) ids.push(null);
  const rounds = ids.length - 1;
  const half = ids.length / 2;
  const fixtures = [];
  let rotation = [...ids];
  const start = new Date(`${startDate}T12:00:00`);

  for (let round = 0; round < rounds; round += 1) {
    for (let i = 0; i < half; i += 1) {
      const home = rotation[i];
      const away = rotation[rotation.length - 1 - i];
      if (home && away) {
        const matchDate = new Date(start);
        matchDate.setDate(start.getDate() + round * 7);
        fixtures.push({
          id: uid("fixture"),
          competitionId,
          homeTeamId: round % 2 === 0 ? home : away,
          awayTeamId: round % 2 === 0 ? away : home,
          venueId,
          date: matchDate.toISOString().slice(0, 10),
          time: `${String(9 + i).padStart(2, "0")}:00`,
          round: round + 1,
          status: "Scheduled",
          refereeId: null,
          homeScore: 0,
          awayScore: 0,
          lineups: {},
          events: []
        });
      }
    }
    rotation = [rotation[0], rotation[rotation.length - 1], ...rotation.slice(1, -1)];
  }
  return fixtures;
}

export function standings(data, competitionId) {
  const competition = competitionById(data, competitionId);
  if (!competition) return [];
  const rows = competition.teamIds.map((teamId) => ({
    teamId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0
  }));
  const index = Object.fromEntries(rows.map((row) => [row.teamId, row]));
  data.fixtures
    .filter((fixture) => fixture.competitionId === competitionId && fixture.status === "Played")
    .forEach((fixture) => {
      const home = index[fixture.homeTeamId];
      const away = index[fixture.awayTeamId];
      if (!home || !away) return;
      home.played += 1;
      away.played += 1;
      home.gf += fixture.homeScore;
      home.ga += fixture.awayScore;
      away.gf += fixture.awayScore;
      away.ga += fixture.homeScore;
      if (fixture.homeScore > fixture.awayScore) {
        home.won += 1;
        away.lost += 1;
        home.points += 3;
      } else if (fixture.homeScore < fixture.awayScore) {
        away.won += 1;
        home.lost += 1;
        away.points += 3;
      } else {
        home.drawn += 1;
        away.drawn += 1;
        home.points += 1;
        away.points += 1;
      }
    });
  rows.forEach((row) => { row.gd = row.gf - row.ga; });
  return rows.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
}

export function playerStats(data, competitionId = null) {
  const stats = Object.fromEntries(data.players.map((player) => [player.id, {
    playerId: player.id,
    name: player.name,
    teamId: player.teamId,
    goals: 0,
    assists: 0,
    yellow: 0,
    red: 0,
    appearances: 0
  }]));

  data.fixtures
    .filter((fixture) => fixture.status === "Played" && (!competitionId || fixture.competitionId === competitionId))
    .forEach((fixture) => {
      Object.values(fixture.lineups || {}).flat().forEach((playerId) => {
        if (stats[playerId]) stats[playerId].appearances += 1;
      });
      (fixture.events || []).forEach((event) => {
        if (event.type === "Goal" && stats[event.playerId]) stats[event.playerId].goals += 1;
        if (event.type === "Goal" && event.assistId && stats[event.assistId]) stats[event.assistId].assists += 1;
        if (event.type === "Yellow" && stats[event.playerId]) stats[event.playerId].yellow += 1;
        if (event.type === "Red" && stats[event.playerId]) stats[event.playerId].red += 1;
      });
    });
  return Object.values(stats).sort((a, b) => b.goals - a.goals || b.assists - a.assists);
}
