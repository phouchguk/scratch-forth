import { Mem } from "./mem";
import { Vm } from "./vm";
import { Dict } from "./dict";

const mem = new Mem();

const prims = ["BYE", "EXIT", "doLIT", "!", "@", "+", "."];
const primCount = prims.length;

const dictm = new Dict(primCount, mem);

function compile(x: string) {
  const n = parseInt(x, 10);

  if (isNaN(n)) {
    const pi = prims.indexOf(x);
    return pi > -1 ? pi : dictm.lookup(x);
  }

  return n;
}

const trim = (s: string) => s.trim();

function parse(s: string) {
  return s.split(" ").map(trim).map(compile);
}

// compounds
const add5 = "doLIT 5 + EXIT";
const add5c = parse(add5);
dictm.add("ADD5", add5c);

const testn = "TEST";
const test = "doLIT 1 ADD5 doLIT 6 ! doLIT 6 @ doLIT 3 + doLIT 6 @ + . BYE";
const testc = parse(test);
dictm.add(testn, testc);

// run the test code - lookup returns code address
mem.PC = dictm.lookup(testn);

const vm = new Vm(mem);
vm.run();

// facility to forget last dict item (for repl)
