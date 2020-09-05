import { CELLL, Mem } from "./mem";
import { Stack } from "./stack";
import { Dict } from "./dict";

const mem = new Mem();
const stack = new Stack(mem);

const prims = ["BYE", "EXIT", "doLIT", "!", "@", "+", "."];
const primCount = prims.length;

const dictm = new Dict(primCount, mem);

let running = false;

function step() {
  const op = mem.get16(mem.PC);
  mem.PC += CELLL; // point to next instruction

  //const op = dict[pc.dicti][pc.i++];

  // primitive
  switch (op) {
    case 0: // BYE
      running = false;
      return;

    case 1: // EXIT
      mem.PC = stack.popr();
      return;

    case 2: // doLIT
      stack.pushd(mem.get16(mem.PC));
      mem.PC += CELLL;
      return;

    case 3: // !
      const addr = stack.popd();
      mem.set16(addr, stack.popd());
      return;

    case 4: // @
      stack.pushd(mem.get16(stack.popd()));
      return;

    case 5: // +
      stack.pushd(stack.popd() + stack.popd());
      return;

    case 6: // .
      console.log(stack.popd());
      return;

    default:
      // run compound proc
      stack.pushr(mem.PC);
      mem.PC = op;
  }
}

function run() {
  running = true;

  while (running) {
    step();
  }
}

function compile(x) {
  const n = parseInt(x, 10);

  if (isNaN(n)) {
    const pi = prims.indexOf(x);
    return pi > -1 ? pi : dictm.lookup(x);
  }

  return n;
}

const trim = (s) => s.trim();

function parse(s) {
  return s.split(" ").map(trim).map(compile);
}

// compounds
const add5 = "doLIT 5 + EXIT";
const add5c = parse(add5);
console.log("ADD5", add5c);
dictm.add("ADD5", add5c);

const testn = "TEST";
const test = "doLIT 1 ADD5 doLIT 6 ! doLIT 6 @ doLIT 2 + doLIT 6 @ + . BYE";
const testc = parse(test);
console.log("TEST", testc);
dictm.add(testn, testc);

// run the test code - lookup returns code address
mem.PC = dictm.lookup(testn);

run();

// facility to forget last dict item (for repl)
