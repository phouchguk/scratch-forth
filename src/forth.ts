import { Mem } from "./mem";
import { Stack } from "./stack";

const mem = new Mem();
const stack = new Stack(mem);

const prims = ["EXIT", "doLIT", "!", "@", "+", "."];
const primCount = prims.length;

const dict = [];

const rs = [];

let pc = null;

// add prims
for (let i = 0; i < primCount; i++) {
  dict.push([prims[i], i]);
}

// add compounds
dict.push(["ADD5", 1, 5, 4, 0]);

function lookup(name) {
  for (let i = dict.length - 1; i >= 0; i--) {
    if (dict[i][0] === name) {
      return i;
    }
  }

  throw new Error(`${name} ?`);
}

function ptr(dicti) {
  return { dicti, i: 1 }; // 1 cus skip name
}

function step() {
  const op = dict[pc.dicti][pc.i++];

    // primitive
    switch (op) {
    case 0: // EXIT
      if (rs.length === 0) {
        pc = null;
      } else {
        pc = rs.pop();
      }

      return;

    case 1: // doLIT
      stack.pushd(dict[pc.dicti][pc.i++]);
      return;

    case 2: // !
      const addr = stack.popd();
      mem.set16(addr, stack.popd());
      return;

    case 3: // @
      stack.pushd(mem.get16(stack.popd()));
      return;

    case 4: // +
      stack.pushd(stack.popd() + stack.popd());
      return;

    case 5: // .
      console.log(stack.popd());
      return;

    default:
      // run compound proc
      rs.push(pc);
      pc = ptr(op);
    }
}

function run() {
  while (pc !== null) {
    step();
  }
}

function compile(x) {
  const n = parseInt(x, 10);

  if (isNaN(n)) {
    return lookup(x);
  }

  return n;
}

const trim = s => s.trim();

function parse(s) {
  return (s + " EXIT").split(" ").map(trim).map(compile);
}

pc = ptr(dict.length);

const test = "doLIT 1 ADD5 doLIT 6 ! doLIT 6 @ doLIT 2 + doLIT 6 @ + .";
const code = parse(test);
code.unshift("TEST");
dict.push(code);

run();

dict.pop();
