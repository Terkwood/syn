#!/usr/bin/env -S deno run --allow-run

let dateFmt = "YYYY-MM-DD";
Deno.run({ cmd: `neuron new -e journal-${dateFmt}`.split(" ") });