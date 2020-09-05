export const code: string[] = [
  "+ UM+ DROP EXIT",
  "ADD5 doLIT 5 + EXIT",
  "ADDER doLIT 1 ADD5 doLIT 6 ! doLIT 6 @ doLIT 3 + doLIT 6 @ + TX! BYE",
  "BRANCHER doLIT 99 doLIT -5 0< ?branch LBL1 RX + TX! BYE LBL1: doLIT 42 + TX! BYE",
  "LOOPER doLIT 10 >R LBL1: R> DUP TX! >R next LBL1 EXIT",
  "START LOOPER BYE",
];
