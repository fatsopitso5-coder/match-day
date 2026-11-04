# MatchDay Web MVP

A runnable web conversion/prototype of the legacy Xamarin.Forms **TikiTaka / MatchDay** mobile application.

## What was migrated

The uploaded project showed an existing model for:

- Users and role-based flows
- Teams and player squads
- Venues
- Competitions (league/tournament concepts)
- Join requests
- Fixtures and round generation
- Match line-ups
- Referee match officiating
- Goals, assists, yellow cards and red cards
- Competition standings and player statistics

This web build turns those concepts into a modern responsive Next.js application that can be run in VS Code on macOS.

## Technology

- Next.js 16 (App Router)
- React 19
- Plain JavaScript (no TypeScript required)
- Responsive CSS
- Browser `localStorage` for demo persistence

The legacy Azure Mobile Apps / SQLite / Xamarin-specific code is **not** used. This is intentional: those dependencies are mobile-specific and the original source also contained a hard-coded cloud storage credential that should not be reused.

## Run it on your Mac

1. Install Node.js 20+ if you do not already have it.
2. Open this folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Run:

```bash
npm install
npm run dev
```

5. Open `http://localhost:3000` in your browser.

If port 3000 is busy:

```bash
npm run dev -- -p 3001
```

Then open `http://localhost:3001`.

## Demo roles

Use the **Demo as** selector at the bottom of the left navigation to switch between:

- Manager
- Player
- Venue Owner
- Referee

The demo data is saved in your browser. Use **Reset demo data** to restore the original sample state.

## Main working flows

### Manager

- View team and squad
- Add/invite players
- See 5-a-side eligibility (minimum 6 registered players)
- Discover competitions
- Request to join a competition
- Create a competition
- Set a starting line-up before a match
- View fixtures, results and stats

### Venue Owner

- Add venues
- Create competitions attached to a venue
- Accept / decline team join requests
- Generate league fixtures automatically
- Allocate available referees to fixtures

### Referee

- Select a referee identity in the demo
- View assigned fixtures
- Kick off a match
- Record goals, assists, yellow cards and red cards
- End the match
- Committed results immediately update standings and player stats

### Player

- View team
- View competitions
- View fixtures/results
- View competition and player stats

## Important differences from production

This is a **functional web MVP/prototype**, not yet a production backend. Authentication, invitations, notifications, image upload, venue booking/payment, database persistence and multi-user concurrency still need server-side services.

For production, the recommended next stage is to add a real backend and database (for example PostgreSQL + an authentication layer) and replace the localStorage repository with API calls.

## Legacy source mapping

Some of the legacy concepts that informed this build:

- `Class/Team.cs` → web team model
- `Class/Player.cs` → web player model
- `Class/Competition.cs` → web competition model
- `Class/Venue.cs` → web venue model
- `Class/Tornament.cs` / `Class/League.cs` → fixtures and league standings
- `Class/Lineup.cs` → match line-up selection
- `Class/Playerstat.cs` / `Class/TeamStat.cs` → calculated player/team statistics
- `Class/GoalCommentary.cs` → live match event feed
- `CreateCompetition.xaml(.cs)` → competition form + fixture generation
- `MatchOfficiate.xaml(.cs)` / `KickoffMatch.xaml(.cs)` → referee match centre
- `Stats.xaml(.cs)` → competition statistics UI

## Security note from the legacy project

The uploaded legacy source contains a hard-coded Azure Storage credential. If that Azure Storage account is still active, rotate/revoke the exposed key and use environment variables or managed credentials in any new implementation.
