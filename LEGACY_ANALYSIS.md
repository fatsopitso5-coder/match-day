# Legacy MatchDay / TikiTaka Analysis

## What the uploaded Visual Studio project is

The uploaded source is a **Xamarin.Forms shared mobile project** targeting .NET Standard 2.0. It was designed for Android/iOS and uses XAML pages plus C# code-behind.

The solution contains 50+ XAML screens and a broad domain model that already reflects much of the MatchDay product vision.

## Important legacy dependencies

The project references mobile-specific or legacy packages including:

- Xamarin.Forms
- Xamarin.Essentials
- Microsoft Azure Mobile Apps client
- SQLite / sqlite-net-pcl
- Windows Azure Storage
- Xamarin social login plugins
- Mobile media/image cropper plugins
- Local notifications

These dependencies are a major reason the original project is not a sensible web application to run directly from VS Code on macOS.

## Product capabilities visible in the source

### Identity / users

`Class/Userz.cs` stores user details and user type. The app also contains registration, email verification and social-login related code.

### Teams and squads

`Class/Team.cs`, `Class/Player.cs`, `CreateTeam.xaml`, `MaintainmyTeam.xaml`, `MaintainPlayer.xaml` and related pages cover:

- Team creation
- Team name, location and badge/photo
- Squad size
- Player name
- Jersey/shirt number
- Position
- Team/player association

The legacy version used squad sizes such as 9, 15 and 23. The new web MVP follows the **current product rule supplied in the brief** instead: minimum 6 registered players for 5-a-side and minimum 12 for 11-a-side.

### Venues / hosts

`Class/Venue.cs`, `Class/Host.cs`, `AdddVenue.xaml`, `MaintainVenue.xaml` and `AllVenueBooking.xaml` show venue-owner / host concepts, location and multiple venue photos.

### Competitions

`Class/Competition.cs`, `Class/League.cs`, `Class/Tornament.cs`, `Class/GroupKnock.cs`, `Class/GroupStageMatch.cs` and competition screens cover:

- League concepts
- Tournament / knockout concepts
- Group and knockout concepts
- Competition start/end dates
- Team limits / open slots
- Match duration
- Venue association
- Team participation

### Fixtures

`CreateCompetition.xaml.cs` contains fixture-generation logic. The legacy implementation generated pair combinations and created scheduled match records with round/match-day information.

The new web MVP replaces that implementation with a deterministic round-robin generator that is easier to maintain in JavaScript.

### Match preparation

`Class/Lineup.cs` and match-related pages contain line-up concepts. The new web MVP implements manager selection of the first 5 or 11 players depending on format.

### Referee / officiating

`MatchOfficiate.xaml`, `KickoffMatch.xaml`, `Cautions.xaml`, `Assists.xaml` and related code show the intended referee journey.

The new web MVP includes:

- Referee allocation per fixture
- Assigned-match view
- Kick-off action
- Goal capture
- Assist capture
- Yellow/red card capture
- End-match action

### Statistics

`Class/Playerstat.cs`, `Class/TeamStat.cs`, `Class/LeagueStat.cs`, `Stats.xaml`, `GroupStandings.xaml` and result screens cover competition, team and player statistics.

The new web MVP calculates standings and player stats directly from completed fixtures and match events.

## Architecture decision for the web conversion

Rather than attempting to mechanically translate XAML into HTML, the new project keeps the **domain concepts and journeys** while replacing the platform layer:

| Legacy mobile layer | New web MVP |
|---|---|
| Xamarin.Forms XAML | React components + responsive CSS |
| C# code-behind | JavaScript state/actions |
| Azure Mobile Apps client | Local demo repository for MVP |
| SQLite device cache | Browser localStorage |
| Xamarin navigation | Role-aware single-page navigation |
| Mobile image plugins | Deferred to production file storage |
| Xamarin notifications | Deferred to production notification service |

## Security finding

The legacy source contains a **hard-coded Azure Storage account credential** in application code. That credential is intentionally excluded from the web project. If the associated Azure Storage account still exists, rotate/revoke its key.

Production secrets should live server-side in environment variables or managed secret storage, never in browser JavaScript.

## Recommended production architecture after this MVP

The next technical phase should replace the local browser repository with a proper backend:

- Next.js web frontend
- PostgreSQL database
- Authentication and role-based authorization
- Object storage for badges / venue images
- Server-side APIs for teams, competitions, fixtures, line-ups and match events
- Transactional match finalisation so standings/player stats are committed reliably
- Invitation + notification workflow
- Audit trail for referee changes and result corrections

The current web build deliberately separates the competition/statistics rules into `lib/matchday.js` so those rules can later be called from server-side APIs rather than rewritten again.
