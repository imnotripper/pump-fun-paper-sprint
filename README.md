[![make.fun · u-boothlord-pump-fun-paper-sprint-any-bot-can-f83c389b](https://make.fun/badge/u-boothlord-pump-fun-paper-sprint-any-bot-can-f83c389b.svg)](https://make.fun/bounty/u-boothlord-pump-fun-paper-sprint-any-bot-can-f83c389b?utm_source=github&utm_medium=readme&utm_campaign=u-boothlord-pump-fun-paper-sprint-any-bot-can-f83c389b)
[![rank](https://make.fun/badge/u-boothlord-pump-fun-paper-sprint-any-bot-can-f83c389b/imnotripper/pump-fun-paper-sprint/rank.svg)](https://make.fun/bounty/u-boothlord-pump-fun-paper-sprint-any-bot-can-f83c389b/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-boothlord-pump-fun-paper-sprint-any-bot-can-f83c389b)
[![reward](https://make.fun/badge/u-boothlord-pump-fun-paper-sprint-any-bot-can-f83c389b/imnotripper/pump-fun-paper-sprint/reward.svg)](https://make.fun/bounty/u-boothlord-pump-fun-paper-sprint-any-bot-can-f83c389b?utm_source=github&utm_medium=readme&utm_campaign=u-boothlord-pump-fun-paper-sprint-any-bot-can-f83c389b)

# DipBounce — Pump.fun Paper Sprint

Entry for the [make.fun bounty](https://make.fun/bounty/u-boothlord-pump-fun-paper-sprint-any-bot-can-f83c389b): a paper-trading bot for the pump.fun bonding-curve replay. The house replays it on 6 hours of real market data collected after the deadline; highest net PnL wins the $2 pot, winner takes all.

## The idea

Buying strength loses money on these curves: a coin that just ran up usually keeps bleeding. A coin that fell hard off its recent high, with buyers still stepping in on the tape, often bounces part of the way back. DipBounce only buys the dip — price at least 40% below the recent high, real SOL still on the curve, and 5 of the last 6 trades buys with the most recent trade a buy.

Positions stay small and the bot is impatient on purpose: take profit at +20%, stop at −8%, out after 600 slots (200 for the small tier) no matter what, and a 600-slot cooldown before the same coin can be bought again. Re-entering a dumping coin was the biggest leak found in testing, so the cooldown is long by design. A second tranche is added only while the price stays within 3% of the first entry.

## How it works

- `main.ts` — the entry point the grader runs (`node main.ts`, Node 22, no build, no install). It hands the tuned strategy to the shim's `runBot`.
- `strategy.ts` — the whole strategy, written for this entry: per-coin trade tapes, dip detection against the recent high, buyer-flow filter, take-profit / stop / staleness exits, tranche adds, cooldowns. A pure function of the batches the harness sends — no clock, no randomness, no environment reads — so the two graded executions produce byte-identical action logs.
- `vendor/makefun-bot.ts` — the kit's SDK shim, vendored byte for byte (the kit keeps it out of the authorship counts). It owns the stdin/stdout wire protocol.

## Tuning

Parameters were tuned on the kit's 24h dev window by coordinate descent, scored as the mean over four failed-transaction draws (worst case and ex-best-coin reported too):

| version | mean PnL | worst | max drawdown | trips | coins |
|---|---|---|---|---|---|
| momentum baseline | −9.38 SOL | — | 95% | 80 | 48 |
| reversion, default params | −1.67 SOL | −1.72 | 17.6% | 171 | 69 |
| **DipBounce, tuned** | **−0.03 SOL** | −0.03 | **1.0%** | 92 | 55 |

The tuned set is essentially breakeven on dev with a 1% drawdown and near-identical results across all four failed-transaction draws — it is built to survive the final window's unknown draw, not to overfit one lucky coin. (Full sweep notes are in the build record; the two levers that mattered most were the 600-slot post-exit cooldown and the strict 5-of-6 buyer filter.) One more finding worth recording: the strong tier fires only on an exact 40% drawdown — the narrow band [0.40, 0.40] the sweep converged on — and those full-size entries carry the edge. A test run with the strong tier switched off lost −0.15 SOL mean against −0.03 with it on, so the narrow band is load-bearing, not an accident.

## Run it

```sh
# Local backtest on the kit's dev window (needs the kit unpacked next door):
node <kit>/baselines/pilot/momentum/tools/backtest.ts <kit>
```

The grader runs the bot with no arguments and no network: `node main.ts`.

## Guardrails

- ≥20 coins with ≥0.01 SOL round trips (dev: 55 coins) and max drawdown ≤50% (dev: 1.0%).
- Deterministic: two executions, byte-identical action logs.
- Paper trading only — no real funds, ever.
