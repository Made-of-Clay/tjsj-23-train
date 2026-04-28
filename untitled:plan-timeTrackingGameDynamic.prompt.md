# Plan: Time-Tracking Game Dynamic

**TL;DR**: Implement time accumulation where each placed tile adds its `timeCost` to a running total. Player wins when `currentTime` exactly matches the puzzle's `targetTime`. Display real-time feedback with color coding: black (neutral), green (exact match), red (over target).

---

## Steps

**Phase 1: Core Time Accumulation Logic**
1. Update `Game.ts` — add `targetTime` property, create `calculateCurrentTime()` method to sum placed tile costs, add `checkWinCondition()` method
2. Hook time calculation into tile operations — call recalculation after `placeSelectedTileAt()`, `setTile()`, and `clearTile()` succeed
3. Implement win condition check — trigger when `currentTime === targetTime` after placement

**Phase 2: UI Feedback System** *(depends on Phase 1)*
4. Create time display component — show `currentTime / targetTime` with color styling:
   - Black: not at target
   - Green: exact match
   - Red: over target
5. Integrate into DOM — add to [src/index.html](src/index.html) with real-time updates

**Phase 3: Puzzle Definition & Initialization** *(parallel with Phase 1)*
6. Create `src/PuzzleDefinition.ts` — define `Puzzle` interface with `gridWidth`, `gridHeight`, `targetTime`; create sample puzzles
7. Update Game initialization — accept puzzle parameter, set `targetTime`, update [src/main.ts](src/main.ts) to pass puzzle

**Phase 4: Win State Management** *(depends on Phases 1 & 2)*
8. Handle win state — display message, freeze placement, optionally add celebration feedback

---

## Relevant Files

- `src/Game.ts` — Add `targetTime` property, recalculation & win-check methods; hook into placement flow
- `src/main.ts` — Initialize Game with puzzle definition
- NEW `src/TimeDisplay.ts` — Display time with color feedback
- `src/index.html` — Add time display container
- NEW: `src/PuzzleDefinition.ts` — Puzzle data interface & samples
- `src/TileDefinitions.ts` — Reference (tile `timeCost` already defined)

---

## Verification

1. **Accumulation**: Place tiles → verify `currentTime` sums correctly; clear tiles → verify recalculates
2. **Win condition**: Build to exact target → green display + win message appears
3. **UI feedback**: Display updates in real-time; colors toggle correctly on placement/removal
4. **Edge cases**: Empty grid (time=0), exceeding target, removing and re-placing tiles

---

## Key Decisions

- **Exact match only** — strictest rule; can soften to tolerance later
- **Per-placement accumulation** — no frame-based time pressure
- **Path validation excluded** — separate concern
- **Default puzzle** — suggest 4×4 grid with `targetTime = 8`

---

## Further Considerations

1. **Puzzle selection** — How do players choose puzzles? (recommend: start with one hardcoded, add menu later)
2. **Difficulty scaling** — Auto-calculate target by grid size, or define per-puzzle? (recommend: per-puzzle for now)
3. **Inventory constraints** — Should tile availability limit target times? (recommend: test current system first)
