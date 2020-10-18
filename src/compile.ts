import { readFile, writeFile } from "fs";

import { CELLL, EM, Mem, rpp, tibb, spp  } from "./mem";
import { align, byteModeSwitch, labelOffset, upp, Dict } from "./dict";
import { prims } from "./vm";

let dictm: Dict | null = null;

const isNr = /^-?\d+$/;
const ver = 1;
const ext = 1;

const vars: { [key: string]: number } = {};

vars["UPP"] = upp;
vars["CELLL"] = CELLL;
vars["CRR"] = 13;
vars["LF"] = 10;
vars["MASKK"] = 0x7f1f;
vars["BKSPP"] = 8;
vars["BYTE"] = byteModeSwitch;
vars["COMPO"] = 0x40;
vars["IMEDD"] = 0x80;
vars["TIBB"] = tibb;
vars["ERR"] = 27;
vars["DOLST"] = prims.indexOf("doLIST");
vars["VEREXT"] = ver * 256 + ext;

function compile(x: string) {
  if (isNr.test(x)) {
    return parseInt(x, 10);
  }

  if (vars[x]) {
    // variable
    return vars[x];
  }

  const addr = (dictm as Dict).lookup(x);

  if (addr % 2 !== 0) {
    throw new Error(`bad address ${addr} for ${x}`);
  }

  return addr;
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

  const code: string[] = [prims.indexOf("doLIST") + ""];
  const insts = parts.slice(1);
  const labels: { [key: string]: number } = {};

  // extract labels
  let codeLen = CELLL;
  let byteMode = false;

  for (let i = 0; i < insts.length; i++) {
    const inst = insts[i];
    if (inst.endsWith(":")) {
      // inst is a label
      labels[inst.substring(0, inst.length - 1)] = codeLen;

      // don't keep label
      continue;
    }

    if (inst === "BYTE") {
      if (byteMode) {
        // leaving byte mode, align
        codeLen = align(codeLen);
      }

      byteMode = !byteMode;
    } else {
      // 'BYTE' inst doesn't count as actual code
      codeLen += byteMode ? 1 : CELLL;
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
    mem.PC = (dictm as Dict).lookup("COLD");
    mem.SP = spp;
    mem.RP = rpp;

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
