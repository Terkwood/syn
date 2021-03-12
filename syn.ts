#!/usr/bin/env -S deno run --allow-run --allow-read --allow-write --unstable

import { format } from "https://deno.land/std@0.90.0/datetime/mod.ts";
import { parse } from "https://deno.land/std@0.90.0/flags/mod.ts";

import { exists } from "https://deno.land/std/fs/mod.ts";

async function invokeEditorOn(path: string) {
  const p = await Deno.run({
    cmd: ["code", path],
    "stdout": "piped",
    "stderr": "piped",
    "stdin": "piped",
  });
  p.status();
}

async function syn(phrase: string) {
  const path = `${phrase}.md`;
  if (await (exists(path))) {
    const statdd = await Deno.lstat(path);
    if (statdd.isFile) {
      await invokeEditorOn(path);
    } else if (statdd.isDirectory || statdd.isSymlink) {
      console.error("NO for dir or symlink");
      Deno.exit(1);
    }
  } else {
    const date = new Date();
    const fmtTime = format(date, "yyyy-MM-ddTHH:mm");

    const fmtDate = format(date, "yyyy-MM-dd");
    const data = `---\ndate: ${fmtTime}\n---\n\n\n#[[${fmtDate}]]\n`;
    // write the main note file
    await Deno.writeTextFile(path, data);

    const fmtYearMonth = format(date, "yyyy-MM");

    const datePath = `${fmtDate}.md`;
    if (!await (exists(datePath))) {
      // write the file yyyy-MM-dd.md
      await Deno.writeTextFile(
        datePath,
        `---\ndate: ${fmtTime}\n---\n\n\n#[[${fmtYearMonth}]]\n`,
      );
    }

    const yrMoMdPath = `${fmtYearMonth}.md`;
    const fmtYear = format(date, "yyyy");
    if (!await (exists(yrMoMdPath))) {
      // write the file yyyy-MM.md
      await Deno.writeTextFile(
        yrMoMdPath,
        `---\ndate: ${fmtTime}\n---\n\n\n#[[${fmtYear}]]\n`,
      );
    }

    const yrMdPath = `${fmtYear}.md`;
    const calendarCard = "calendar";
    if (!await (exists(yrMdPath))) {
      // write the file yyyy.md
      await Deno.writeTextFile(
        yrMdPath,
        `---\ndate: ${fmtTime}\n---\n\n\n#[[${calendarCard}]]\n`,
      );
    }

    await invokeEditorOn(path);
  }
}

const argsParsed = parse(Deno.args)["_"];
const fileNameStrOrNum = (argsParsed.length == 0) ? "whatever" : argsParsed[0];

type NumOrStr = number | string;
const stringIt = (ns: NumOrStr) => {
  if (typeof ns === "string") return ns;
  else return `${ns}`;
};

await syn(stringIt(fileNameStrOrNum));
