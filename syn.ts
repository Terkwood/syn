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

    const data = defaultZettel(date);

    // write the main note file
    await Deno.writeTextFile(path, data);

    const datePath = `${fmtDate(date)}.md`;
    if (!await (exists(datePath))) {
      // write the file yyyy-MM-dd.md
      await Deno.writeTextFile(
        datePath,
        `---\ndate: ${fmtTime(date)}\n---\n\n\n[[${fmtYearMonth(date)}]]\n`,
      );
    }

    const yrMoMdPath = `${fmtYearMonth(date)}.md`;

    if (!await (exists(yrMoMdPath))) {
      // write the file yyyy-MM.md
      await Deno.writeTextFile(
        yrMoMdPath,
        `---\ndate: ${fmtTime(date)}\n---\n\n\n#[[${fmtYear(date)}]]\n`,
      );
    }

    const yrMdPath = `${fmtYear(date)}.md`;
    const calendarCard = "calendar";
    if (!await (exists(yrMdPath))) {
      // write the file yyyy.md
      await Deno.writeTextFile(
        yrMdPath,
        `---\ndate: ${fmtTime(date)}\n---\n\n\n#[[${calendarCard}]]\n`,
      );
    }

    await invokeEditorOn(path);
  }
}

const fmtTime = (date: Date) => format(date, "yyyy-MM-ddTHH:mm");
const fmtDate = (date: Date) => format(date, "yyyy-MM-dd");
const fmtYearMonth = (date: Date) => format(date, "yyyy-MM");
const fmtYear = (date: Date) => format(date, "yyyy");

const defaultZettel = (date: Date) =>
  `---\ndate: ${fmtTime(date)}\n---\n\n\n#[[${fmtDate(date)}]]\n`;

const args = parse(Deno.args);
const noNameArgs = args["_"];
const fileNameStrOrNum = (noNameArgs.length == 0) ? "whatever" : noNameArgs[0];

type NumOrStr = number | string;
const stringIt = (ns: NumOrStr) => {
  if (typeof ns === "string") return ns;
  else return `${ns}`;
};

await syn(stringIt(fileNameStrOrNum));
