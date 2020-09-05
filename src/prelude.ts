export const code: string[] = [
  // actual prelude
  "?DUP DUP ?branch QDUP1 DUP QDUP1: EXIT",
  "ROT >R SWAP R> SWAP EXIT",

  // test code
  "+ UM+ DROP EXIT",
  "ADD5 doLIT 5 + EXIT",
  "ADDER doLIT 1 ADD5 doLIT 6 ! doLIT 6 @ doLIT 3 + doLIT 6 @ + TX! BYE",
  "BRANCHER doLIT 99 doLIT -5 0< ?branch LBL1 RX + TX! BYE LBL1: doLIT 42 + TX! BYE",
  "LOOPER doLIT 9 >R LBL1: R> DUP doLIT 1 + TX! >R next LBL1 EXIT",
  "ROTATOR doLIT 1 doLIT 2 doLIT 3 ROT TX! TX! TX! BYE",
  "START ROTATOR BYE",
];
