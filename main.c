#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

#define PC 0
#define IP 2
#define SP 4
#define RP 6

#define CELLL 2

uint16_t minus1 = 65535;
uint16_t signFlag = 32768;

uint8_t m8[0x4000];
uint8_t running = 1;

uint16_t get16(int addr) {
  return (m8[addr + 1] << 8) + m8[addr];
}

void set16(int addr, uint16_t value) {
  m8[addr] = value;
  m8[addr + 1] = value >> 8;
}

uint16_t pop(int stack) {
  uint16_t p = get16(stack);
  uint16_t value = get16(p);
  set16(stack, p + CELLL);

  return value;
}

void push (int stack, uint16_t value) {
  uint16_t p = get16(stack) - CELLL;
  set16(stack, p);
  set16(p, value);
}

void next() {
  uint16_t ip = get16(IP);
  set16(PC, get16(ip));
  set16(IP, ip + CELLL);
}

void step() {
  uint16_t pc = get16(PC);
  uint16_t op = get16(pc);

  set16(PC, pc + CELLL);

  printf("OP: %u\n", op);

  switch (op) {
  case 0: /* BYE */
    running = 0;
    return;

  case 1: /* KEY */
    push(SP, getc(stdin));

    next();
    return;

  case 2: /* TX! */
    putc(pop(SP), stdout);

    next();
    return;

  case 3: /* doLIT */
    {
      uint16_t ip = get16(IP);
      set16(IP, ip + CELLL);
      push(SP, get16(ip));

      next();
      return;
    }

  case 4: /* EXIT */
    set16(IP, pop(RP));

    next();
    return;

  case 5: /* EXECUTE */
    set16(PC, pop(SP));
    return;

  case 6: /* next */
    {
      /* count is on the return stack */
      uint16_t count = get16(get16(RP));

      if (count == 0) {
        /* count will go below 0, pop the count, skip over address after 'next' instruction */
        pop(RP);
        set16(IP, get16(IP) + CELLL);
      } else {
        /* otherwise set the dec'd count, point to instruction after 'next' instruction */
        set16(RP, count - 1);
        set16(IP, get16(get16(IP)));
      }

      next();
      return;
    }

  case 7: /* ?branch (branch if 0) */
    {
      if (pop(SP) == 0) {
        /* branch */
        set16(IP, get16(get16(IP)));
      } else {
        /* don't branch, skip branch address */
        set16(IP, get16(IP) + CELLL);
      }

      next();
      return;
    }

  case 8: /* branch */
    set16(IP, get16(get16(IP)));

    next();
    return;

  case 9: /* ! */
    {
      int addr = pop(SP);
      set16(addr, pop(SP));

      next();
      return;
    }

  case 10: /* @ */
    push(SP, get16(pop(SP)));

    next();
    return;

  case 11: /* C! */
    {
      int addr = pop(SP);
      m8[addr] = pop(SP);

      next();
      return;
    }

  case 12: /* C@ */
    push(SP, m8[pop(SP)]);

    next();
    return;

  case 13: /* RP@ */
    push(SP, get16(RP));

    next();
    return;

  case 14: /* RP! */
    set16(RP, pop(SP));

    next();
    return;

  case 15: /* R> */
    push(SP, pop(RP));

    next();
    return;

  case 16: /* R@ */
    push(SP, get16(get16(RP)));

    next();
    return;

  case 17: /* >R */
    push(RP, pop(SP));

    next();
    return;

  case 18: /* SP@ */
    push(SP, get16(SP));

    next();
    return;

  case 19: /* SP! */
    set16(SP, pop(SP));

    next();
    return;

  case 20: /* DROP */
    pop(SP);

    next();
    return;

  case 21: /* DUP */
    push(SP, get16(get16(SP)));

    next();
    return;

  case 22: /* SWAP */
    {
      uint16_t temp1 = pop(SP);
      uint16_t temp2 = pop(SP);

      push(SP, temp1);
      push(SP, temp2);

      next();
      return;
    }

  case 23: /* OVER */
    push(SP, get16(get16(SP) + CELLL));
    next();
    return;

  case 24: /* 0< */
    {
      uint16_t test = pop(SP);
      push(SP, test & signFlag ? minus1 : 0);

      next();
      return;
    }

  case 25: /* AND */
    push(SP, pop(SP) & pop(SP));
    next();
    return;

  case 26: /* OR */
    push(SP, pop(SP) | pop(SP));
    next();
    return;

  case 27: /* XOR */
    push(SP, pop(SP) ^ pop(SP));
    next();
    return;

  case 28: /* UM+< */
    {
      uint16_t bx = pop(SP);
      uint16_t ax = pop(SP) + bx;

      push(SP, ax & minus1);
      push(SP, ax >> 16);

      next();
      return;
    }

  case 29: /* doLIST */
    push(RP, get16(IP));
    set16(IP, get16(PC));

    next();
    return;

  default:
    printf("bad op: %u\n", op);
    exit(1);
  }
}

void run() {
  running = 1;

  while (running) {
    step();
  }
}

int main() {
  FILE *ptr;
  ptr = fopen("dist/mem.bin", "rb");

  if (fread(m8, sizeof(m8), 1, ptr) == 0) {
    printf("bad mem file\n");
    exit(1);
  }

  fclose(ptr);

  run();

  return 0;
}
