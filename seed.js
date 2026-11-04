export const seedData = {
  profile: {
    id: "u-manager-1",
    name: "Tshego",
    surname: "Manager",
    email: "manager@matchday.demo",
    role: "Manager"
  },
  teams: [
    {
      id: "team-1",
      name: "Jozi Ballers",
      badge: "JB",
      location: "Johannesburg",
      format: "5-a-side",
      managerId: "u-manager-1",
      trophies: 3
    },
    { id: "team-2", name: "Braam City", badge: "BC", location: "Braamfontein", format: "5-a-side", trophies: 1 },
    { id: "team-3", name: "Sandton Athletic", badge: "SA", location: "Sandton", format: "5-a-side", trophies: 2 },
    { id: "team-4", name: "Rosebank Rovers", badge: "RR", location: "Rosebank", format: "5-a-side", trophies: 0 },
    { id: "team-5", name: "Soweto Stars", badge: "SS", location: "Soweto", format: "5-a-side", trophies: 4 },
    { id: "team-6", name: "Melville FC", badge: "MF", location: "Melville", format: "5-a-side", trophies: 1 }
  ],
  players: [
    { id: "p1", teamId: "team-1", name: "Neo Mokoena", number: 10, position: "Forward" },
    { id: "p2", teamId: "team-1", name: "Kabelo Dube", number: 7, position: "Forward" },
    { id: "p3", teamId: "team-1", name: "Thabo Ndlovu", number: 8, position: "Midfielder" },
    { id: "p4", teamId: "team-1", name: "Lethabo Molefe", number: 4, position: "Defender" },
    { id: "p5", teamId: "team-1", name: "Sibusiso Nkosi", number: 1, position: "Goalkeeper" },
    { id: "p6", teamId: "team-1", name: "Mpho Khumalo", number: 11, position: "Forward" },
    { id: "p7", teamId: "team-1", name: "Katlego Maseko", number: 6, position: "Midfielder" },
    { id: "p8", teamId: "team-2", name: "Aiden Peters", number: 9, position: "Forward" },
    { id: "p9", teamId: "team-2", name: "Lwazi Zulu", number: 1, position: "Goalkeeper" },
    { id: "p10", teamId: "team-3", name: "Rethabile Moagi", number: 10, position: "Forward" }
  ],
  venues: [
    { id: "v1", ownerId: "u-venue-1", name: "Urban Sports Arena", location: "Randburg", pitches: 4 },
    { id: "v2", ownerId: "u-venue-1", name: "The Football Yard", location: "Midrand", pitches: 3 },
    { id: "v3", ownerId: "u-venue-2", name: "Soweto Five Arena", location: "Soweto", pitches: 5 }
  ],
  referees: [
    { id: "r1", name: "Lerato Maseko", availability: "Available", rating: 4.9 },
    { id: "r2", name: "Bongani Cele", availability: "Available", rating: 4.7 },
    { id: "r3", name: "Mia Jacobs", availability: "Busy", rating: 4.8 }
  ],
  competitions: [
    {
      id: "c1",
      name: "Joburg Social League",
      type: "League",
      format: "5-a-side",
      venueId: "v1",
      ownerType: "Venue Owner",
      ownerId: "u-venue-1",
      teamLimit: 6,
      minutesPerHalf: 20,
      startDate: "2026-11-07",
      status: "Active",
      teamIds: ["team-1", "team-2", "team-3", "team-4"],
      requests: []
    },
    {
      id: "c2",
      name: "Sunday Knockout Cup",
      type: "Tournament",
      format: "5-a-side",
      venueId: "v3",
      ownerType: "Venue Owner",
      ownerId: "u-venue-2",
      teamLimit: 8,
      minutesPerHalf: 15,
      startDate: "2026-11-15",
      status: "Open",
      teamIds: ["team-5", "team-6"],
      requests: []
    }
  ],
  fixtures: [
    {
      id: "f1",
      competitionId: "c1",
      homeTeamId: "team-1",
      awayTeamId: "team-2",
      venueId: "v1",
      date: "2026-10-31",
      time: "10:00",
      round: 1,
      status: "Played",
      refereeId: "r1",
      homeScore: 4,
      awayScore: 2,
      lineups: { "team-1": ["p1", "p2", "p3", "p4", "p5"], "team-2": ["p8", "p9"] },
      events: [
        { id: "e1", type: "Goal", teamId: "team-1", playerId: "p1", assistId: "p2", minute: 5 },
        { id: "e2", type: "Goal", teamId: "team-1", playerId: "p2", assistId: "p3", minute: 12 },
        { id: "e3", type: "Goal", teamId: "team-2", playerId: "p8", assistId: null, minute: 16 },
        { id: "e4", type: "Goal", teamId: "team-1", playerId: "p1", assistId: "p3", minute: 25 },
        { id: "e5", type: "Yellow", teamId: "team-1", playerId: "p4", minute: 29 },
        { id: "e6", type: "Goal", teamId: "team-2", playerId: "p8", assistId: null, minute: 31 },
        { id: "e7", type: "Goal", teamId: "team-1", playerId: "p6", assistId: "p2", minute: 37 }
      ]
    },
    {
      id: "f2",
      competitionId: "c1",
      homeTeamId: "team-3",
      awayTeamId: "team-4",
      venueId: "v1",
      date: "2026-10-31",
      time: "11:00",
      round: 1,
      status: "Played",
      refereeId: "r2",
      homeScore: 1,
      awayScore: 1,
      lineups: {},
      events: []
    },
    {
      id: "f3",
      competitionId: "c1",
      homeTeamId: "team-1",
      awayTeamId: "team-3",
      venueId: "v1",
      date: "2026-11-07",
      time: "10:00",
      round: 2,
      status: "Scheduled",
      refereeId: "r1",
      homeScore: 0,
      awayScore: 0,
      lineups: {},
      events: []
    },
    {
      id: "f4",
      competitionId: "c1",
      homeTeamId: "team-2",
      awayTeamId: "team-4",
      venueId: "v1",
      date: "2026-11-07",
      time: "11:00",
      round: 2,
      status: "Scheduled",
      refereeId: null,
      homeScore: 0,
      awayScore: 0,
      lineups: {},
      events: []
    }
  ]
};
