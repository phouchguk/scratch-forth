#include <stdio.h>
#include <stdlib.h>

#define PC 0
#define IP 2
#define SP 4
#define RP 6

#define CELLL 2

unsigned short minus1 = 65535;
unsigned short signFlag = 32768;

unsigned char m8[0x4000];
unsigned char running = 1;

unsigned short get16(int addr) {
  return (m8[addr + 1] << 8) + m8[addr];
}

void set16(int addr, unsigned short value) {
  m8[addr] = value;
  m8[addr + 1] = value >> 8;
}

unsigned short pop(int stack) {
  unsigned short p = get16(stack);
  unsigned short value = get16(p);
  set16(stack, p + CELLL);

  return value;
}

void push (int stack, unsigned short value) {
  unsigned short p = get16(stack) - CELLL;
  set16(stack, p);
  set16(p, value);
}

unsigned short setToIP(int reg) {
  unsigned short ip = get16(IP);
  set16(reg, get16(ip));
  set16(IP, ip + CELLL);

  return ip;
}

void next() {
  setToIP(PC);
}

void step() {
  unsigned short pc = get16(PC);
  unsigned short op = get16(pc);

  printf("OP: %u\n", op);

  switch (op) {
  case 0: // BYE
    running = 0;
    return;

  case 1: // KEY
    push(SP, getc(stdin));
    next();
    return;

  case 2: // TX!
    putc(pop(SP), stdout);
    next();
    return;

  case 3: // doLIT
    push(SP, setToIP(SP));
    next();
    return;

  case 4: // EXIT
    set16(IP, pop(RP));
    next();
    return;

  case 5: // EXECUTE
    set16(PC, pop(RP));
    return;

  case 6: // next
    {
      // count is on the return stack
      short count = get16(get16(RP)) - 1;

      if (count < 0) {
        // when count goes below 0, pop the count, skip over address after 'next' instruction
        pop(RP);
        set16(IP, get16(IP) + CELLL);
      } else {
        // otherwise set the dec'd count, jump to address after 'next' instruction
        set16(RP, count);
        set16(IP, get16(get16(IP)));
      }

      next();
      return;
    }

  case 7: // ?branch (branch if 0)
    {
      short flag = pop(SP);

      if (flag == 0) {
        // branch
        set16(IP, get16(get16(IP)));
      } else {
        // don't branch, skip branch address
        set16(IP, get16(IP) + CELLL);
      }

      next();
      return;
    }

  case 8: // branch
    set16(IP, get16(get16(IP)));
    next();
    return;

  case 9: // !
    {
      int addr = pop(SP);
      set16(addr, pop(SP));
      next();
      return;
    }

  case 10: // @
    push(SP, get16(pop(SP)));
    next();
    return;

  case 11: // C!
    {
      int addr = pop(SP);
      m8[addr] = pop(SP);
      next();
      return;
    }

  case 12: // C@
    push(SP, m8[pop(SP)]);
    next();
    return;

  case 13: // RP@
    push(SP, get16(RP));
    next();
    return;

  case 14: // RP!
    set16(RP, pop(SP));
    next();
    return;

  case 15: // R>
    push(SP, pop(RP));
    next();
    return;

  case 16: // RP@
    push(SP, get16(RP));
    next();
    return;

  case 17: // >R
    push(RP, pop(SP));
    next();
    return;

  case 18: // SP@
    push(SP, get16(SP));
    next();
    return;

  case 19: // SP!
    set16(SP, pop(SP));
    next();
    return;

  case 20: // DROP
    pop(SP);
    next();
    return;

  case 21: // DUP
    push(SP, get16(get16(SP)));
    next();
    return;

  case 22: // SWAP
    {
      unsigned short temp1 = pop(SP);
      unsigned short temp2 = pop(SP);

      push(SP, temp1);
      push(SP, temp2);

      next();
      return;
    }

  case 23: // OVER
    push(SP, get16(get16(SP) + CELLL));
    next();
    return;

  case 24: // 0<
    {
      unsigned short test = pop(SP);
      push(SP, test & signFlag ? minus1 : 0);

      next();
      return;
    }

  case 25: // AND
    push(SP, pop(SP) & pop(SP));
    next();
    return;

  case 26: // OR
    push(SP, pop(SP) | pop(SP));
    next();
    return;

  case 27: // XOR
    push(SP, pop(SP) ^ pop(SP));
    next();
    return;

  case 28: // UM+<
    {
      unsigned short bx = pop(SP);
      unsigned short ax = pop(SP) + bx;

      push(SP, ax & minus1);
      push(SP, ax >> 16);

      next();
      return;
    }

  case 29: // doLIST
    push(RP, get16(IP));
    set16(IP, get16(PC));

    next();
    return;

  default:
    printf("bad op: %u\n", op);
    exit(1);
  }
}

int run() {
  running = 1;

  while (running) {
    step();
  }
}

int main() {
  FILE *ptr;
  ptr = fopen("dist/mem.bin", "rb");
  fread(m8, sizeof(m8), 1, ptr);
  fclose(ptr);

  run();

  return 0;
}
