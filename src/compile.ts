import { readFile, writeFile } from "fs";

import { Mem } from "./mem";
import { prims, primCount } from "./vm";
import { Dict } from "./dict";

let dictm: Dict | null = null;

const isNr = /^-?\d+$/;

function compile(x: string) {
  if (isNr.test(x)) {
    return parseInt(x, 10);
  }

  const pi = prims.indexOf(x);
  return pi > -1 ? pi : (dictm as Dict).lookup(x);
}

const trim = (s: string) => s.trim();

function parse(l: string) {
  if (l === "") {
    return;
  }

  const parts = l.split(" ").map(trim);
  (dictm as Dict).add(parts[0], parts.slice(1).map(compile));
}

export function build(cb: (mem: Mem) => void) {
  const mem = new Mem();
  dictm = new Dict(primCount, mem);

  readFile("src/code.txt", { encoding: "utf8" }, function (err, data: string) {
    const lines = data.split("\n");
    lines.map(trim).forEach(parse);

    mem.PC = (dictm as Dict).lookup("START");

    cb(mem);
  });
}

export function dump(mem: Mem) {
  writeFile("mem.bin", mem.m8, { encoding: "ascii" }, function (err) {
    if (err) {
      console.log(err);
      return;
    }
  });
}
