# PROJECT.md
## Project Context & Goals

> Fill in this file with your project-specific details.
> This is the first place any agent should look to understand what this project is.

---

## Project Name

**tjsj-train**

## Description

April 2026's challenge is themed "trains." I'm making a simple tile placement game inspired by the Spider-man (PS4) mini-game for completing electrical circuits (Peter's work with Octavius). Circuits become train tracks, required voltage becomes travel time, and start/end circuits become train stations.

I'm also experimenting with more agentic coding (as I don't have the time I want to do it by hand - just being real). I must bobble between free LLMs (hobby budget of $0), so I'll experiment with multi-modal interaction also.

## Tech Stack

- Three.js
- TypeScript
- Vite

## Key Goals / TODOs

- [ ] add time tracking (adding/removing should update game state)
  - [ ] add time data to tiles
  - [ ] add target time (to complete the puzzle)
  - [ ] add current time (accumulated from tiles)
- [ ] add path validation
  - [ ] straight tile has path on edges 0 & 2 or 1 & 3 indicating path edges
  - [ ] curved tile has path on edges 0 & 1, 1 & 2, 2 & 3 indicating path edges
  - [ ] path edges must touch to continue path to next tile
- [ ] add blocked tiles (i.e. tiles that cannot be removed)

## Architecture Notes
- Build handled by Vite (`pnpm build`).
- Hosting via Firebase (static hosting on playground project).
- CICD handled by GitHub actions (ensure project builds without error/lint).

## Links & References
N/A

