#!/usr/bin/env -S deno run --allow-run

const formatDate = (date: Date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }

  return [year, month, day].join("-");
};

const ds = formatDate(new Date());
const p = Deno.run({ cmd: `neuron new -e journal-${ds}`.split(" ") });
const { code } = await p.status();

if (code !== 0) {
  console.error("fail");
}
