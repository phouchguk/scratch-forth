import { readFile, writeFile } from "fs";

import { CELLL, EM, Mem } from "./mem";
import { labelOffset, upp, Dict } from "./dict";
import { prims } from "./vm";

let dictm: Dict | null = null;

const isNr = /^-?\d+$/;

const vars: { [key: string]: number } = {};

vars["UPP"] = upp;
vars["CELLL"] = CELLL;
vars["CRR"] = 13;
vars["LF"] = 10;
vars["MASKK"] = 0x7f1f;
vars["BKSPP"] = 8;

function compile(x: string) {
  if (isNr.test(x)) {
    return parseInt(x, 10);
  }

  const pi = prims.indexOf(x);

  if (pi > -1) {
    // primitive
    return pi;
  }

  if (vars[x]) {
    // variable
    return vars[x];
  }

  return (dictm as Dict).lookup(x);
}

const trim = (s: string) => s.trim();

function parse(l: string) {
  if (l === "") {
    return;
  }

  const parts = l.split(" ").map(trim);
  const name = parts[0];

  if (name === "$USER") {
    (dictm as Dict).user(parts[1]);
    return;
  }

  const code: string[] = [];
  const insts = parts.slice(1);
  const labels: { [key: string]: number } = {};

  // extract labels
  for (let i = 0; i < insts.length; i++) {
    const inst = insts[i];
    if (inst.endsWith(":")) {
      // inst is a label
      labels[inst.substring(0, inst.length - 1)] = code.length * CELLL;

      // don't keep label
      continue;
    }

    code.push(insts[i]);
  }

  for (let i = 0; i < code.length; i++) {
    const inst = code[i];

    if (typeof labels[inst] !== "undefined") {
      code[i] = labelOffset + labels[inst] + "";
    }
  }

  (dictm as Dict).colon(name, code.map(compile));
}

// cb: (mem: Mem) => void
export function build() {
  const mem = new Mem(new ArrayBuffer(EM));
  dictm = new Dict(mem);

  readFile("src/prelude.txt", { encoding: "utf8" }, function (
    err,
    data: string
  ) {
    if (err) {
      console.log(err);
      return;
    }

    const lines = data.split("\n");

    lines.map(trim).forEach(parse);
    mem.PC = (dictm as Dict).lookup("START");

    dump(mem);
  });
}

export function dump(mem: Mem) {
  writeFile("dist/mem.bin", mem.m8, { encoding: "ascii" }, function (err) {
    if (err) {
      console.log(err);
      return;
    }
  });
}

build();
