# Three.js Journey, Challenge 23: Train

April 2026's challenge  is themed "trains." I'm making a simple tile placement game inspired by the Spider-man (PS4) mini-game for completing electrical circuits (Peter's work with Octavius). Circuits become train tracks, required voltage becomes travel time, and start/end circuits become train stations.

I'm also experimenting with more agentic coding (as I don't have the time I want to do it by hand - just being real). I must bobble between free LLMs (hobby budget of $0), so I'll experiment with multi-modal interaction also.

## AGENTS

For full project context and details, see `AGENT-AGNOSTIC/PROJECT.md`.

## Tech Stack

- Three.js
- TypeScript
- Vite

## CLI Commands

Installation

```bash
pnpm i
```

Run dev mode

```bash
pnpm dev
```

Build

```bash
pnpm build
```

Run build

```bash
pnpm preview
```

## CICD Setup

Ensure your GitHub repo exists before starting.

### Firebase

Firebase is my current static hosting provider.

- Create a site under the playground project.
- run `firebase-tools init hosting:github` and follow the prompts
  - might run `npm config get prefix` to find the bin if PATH isn't configured correctly
- Ensure firebase.json `hosting.site` is entered correctly

### GitHub Actions

- Ensure project builds without error/lint (this breaks/stops builds).
- Push files to remote and what actions for a successful build/deployment.

## TODOs

- add time tracking (adding/removing should update game state)
  - add time data to tiles
  - add target time (to complete the puzzle)
  - add current time (accumulated from tiles)
- add path validation
  - straight tile has path on edges 0 & 2 or 1 & 3 indicating path edges
  - curved tile has path on edges 0 & 1, 1 & 2, 2 & 3 indicating path edges
  - path edges must touch to continue path to next tile
- add blocked tiles (i.e. tiles that cannot be removed)
