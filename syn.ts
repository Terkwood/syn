#!/usr/bin/env -S deno run --allow-env --allow-run --allow-read --allow-write --unstable

import { format } from "https://deno.land/std@0.90.0/datetime/mod.ts";
import { parse } from "https://deno.land/std@0.90.0/flags/mod.ts";
import { v4 } from "https://deno.land/std@0.90.0/uuid/mod.ts";
import { exists } from "https://deno.land/std/fs/mod.ts";

type ZettelType = "default" | "lab" | "journal" | "tag";

const MINUTE_MILLIS = 60000;
const DAY_MINUTES = 60 * 24;

function yesterday(): Date {
  return new Date(new Date().getTime() - MINUTE_MILLIS * DAY_MINUTES);
}

function tomorrow(): Date {
  return new Date(new Date().getTime() + MINUTE_MILLIS * DAY_MINUTES);
}

function local(d: Date): Date {
  const diff = d.getTimezoneOffset();
  const ms = diff * MINUTE_MILLIS * -1;
  const utcMs = d.getTime();
  return new Date(utcMs - ms);
}

function parseDate(x: string | undefined | null): Date {
  if (x == null) {
    return new Date();
  }
  if (x.length > 0) {
    const firstChar = x[0].toLowerCase();
    if (firstChar === "y") {
      return yesterday();
    }
    if (firstChar === "t") {
      return tomorrow();
    }
  }

  const r = Date.parse(x);
  if (Number.isNaN(r)) {
    return new Date();
  } else {
    return new Date(r);
  }
}

async function invokeEditorOn(path: string) {
  const p = await Deno.run({
    cmd: ["code", path],
    "stdout": "piped",
    "stderr": "piped",
    "stdin": "piped",
  });
  p.status();
}

interface Options {
  zettelHome: string | undefined;
  zettelType: ZettelType;
  date: Date;
  extras: string | undefined;
}

async function syn(phrase: string, options: Options) {
  const { zettelHome, zettelType, date, extras } = options;

  const returnToInitialDir = () => Deno.chdir(Deno.cwd());

  if (zettelHome) {
    Deno.chdir(zettelHome);
  }

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
    const data = applyTemplate(date, zettelType, phrase, extras);

    // write the main note file
    await Deno.writeTextFile(path, data);

    if (zettelType != "default") {
      // labs-YYYY-MM-dd or journal-YYYY-MM-dd, if necessary
      await createDailyFiles(date, zettelType);
    }

    await invokeEditorOn(path);
  }

  if (zettelHome) {
    returnToInitialDir();
  }
}

const fmtTime = (date: Date) => format(date, "yyyy-MM-ddTHH:mm");
const fmtDate = (date: Date) => format(date, "yyyy-MM-dd");
const fmtYearMonth = (date: Date) => format(date, "yyyy-MM");
const fmtYear = (date: Date) => format(date, "yyyy");

const defaultZettel = (date: Date, extras: string | undefined) => `---\ndate: ${fmtTime(date)}\n---\n${extras ? extras + '\n' : ''}`;
const journalZettel = (date: Date, extras: string | undefined) =>
  `---\ndate: ${fmtTime(date)}\n---\n\n\n#journal [[journal-${
    fmtDate(date)
  }]] #[[journal]]\n${extras ? extras + '\n' : ''}`;
const labZettel = (date: Date, extras: string | undefined) =>
  `---\ndate: ${fmtTime(date)}\n---\n\n\n#labs #[[lab-notes]] [[labs-${
    fmtDate(date)
  }]]\n${extras ? extras + '\n' : ''}`;
const tagZettel = (date: Date, tag: string, extras: string | undefined) =>
  `---\ndate: ${fmtTime(date)}\n---\n\n\n[[z:zettels?tag=${tag.replaceAll("-","")}&timeline]]\n${extras ? extras + '\n' : ''}`;

const args = parse(Deno.args);
const typeArg = args["t"] || args["type"];
const dateArg = args["d"] || args["date"];
// extra tags and links
const extrasArg = args["e"] || args["extras"];

const noNameArgs = args["_"];

function randomName(): string {
  return v4.generate().substr(0, 8);
}

const fileNameStrOrNum = (noNameArgs.length == 0)
  ? randomName()
  : noNameArgs[0];

const stringIt = (ns: number | string) => {
  if (typeof ns === "string") return ns;
  else return `${ns}`;
};

const theFile = stringIt(fileNameStrOrNum);

function coerceZettelType(s: string | null | undefined): ZettelType {
  if (s == null || s == "") {
    return "default";
  }

  switch (s[0].toLowerCase()) {
    case "l":
      return "lab";
    case "j":
      return "journal";
    case "t":
      return "tag";
    default:
      return "default";
  }
}

function applyTemplate(date: Date, zt: ZettelType, name: string, extras: string | undefined): string {
  switch (zt) {
    case "default":
      return defaultZettel(date, extras);
    case "journal":
      return journalZettel(date, extras);
    case "lab":
      return labZettel(date, extras);
    case "tag":
      return tagZettel(date, name, extras);
  }
}

async function createDailyFiles(date: Date, zt: ZettelType) {
  switch (zt) {
    case "lab": {
      const lPath = `labs-${fmtDate(date)}.md`;
      if (!await (exists(lPath))) {
        // write the file yyyy-MM-dd.md
        await Deno.writeTextFile(
          lPath,
          `---\ndate: ${fmtTime(date)}\n---\n\n\n#[[lab-notes]] #[[${
            fmtDate(date)
          }]]\n`,
        );
      }
      break;
    }
    case "journal": {
      const jPath = `journal-${fmtDate(date)}.md`;
      if (!await (exists(jPath))) {
        // write the file yyyy-MM-dd.md
        await Deno.writeTextFile(
          jPath,
          `---\ndate: ${fmtTime(date)}\n---\n\n\n#[[journal]] #[[${
            fmtDate(date)
          }]]\n`,
        );
      }
      break;
    }
  }

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
}

function isMdExtension(file: string): boolean {
  return file.length > 2 &&
    file.substring(file.length - 3, file.length).trim().toLowerCase() == ".md";
}

function trimMdExtension(file: string): string {
  if (isMdExtension(file)) {
    return file.substring(0, file.length - 3);
  } else {
    return file;
  }
}

const zettelHome: string | undefined = Deno.env.get("ZETTELKASTEN");

await syn(trimMdExtension(theFile), {
  zettelHome,
  zettelType: coerceZettelType(typeArg),
  date: local(parseDate(dateArg)),
  extras: extrasArg
});
