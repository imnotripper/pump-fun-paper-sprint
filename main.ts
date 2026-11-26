// DipBounce entry for the pump.fun paper sprint (agent-fun/replay/v2).
// The grader runs `node /bot/main.ts`; the strategy lives in strategy.ts
// and the SDK shim is the kit's sdk/ts/makefun-bot.ts, vendored byte for
// byte under vendor/ (the kit keeps it out of the authorship counts).

import { runBot } from './vendor/makefun-bot.ts';
import { createDipBounce, TUNED_PARAMS } from './strategy.ts';

await runBot({ onBatch: createDipBounce(TUNED_PARAMS) });
