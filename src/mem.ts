export const CELLL = 2;
export const EM = 0x4000;
export const REG_TOP = 5 * CELLL;
const rts = 64 * CELLL;
export const rpp = EM - 8 * CELLL;
export const tibb = rpp - rts;
export const spp = tibb - 8 * CELLL;

export class Mem {
  mem: ArrayBuffer;
  m8: Uint8Array;
  m16: Uint16Array;

  readonly pci = 0; // program counter
  readonly ipi = 1; // interpreter pointer
  readonly spi = 2; // data stack pointer
  readonly rpi = 3; // return stack pointer

  constructor(mem: ArrayBuffer) {
    this.mem = mem;
    this.m8 = new Uint8Array(this.mem);
    this.m16 = new Uint16Array(this.mem);
  }

  get PC() {
    return this.m16[this.pci];
  }

  set PC(value: number) {
    this.m16[this.pci] = value;
  }

  get IP() {
    return this.m16[this.ipi];
  }

  set IP(value: number) {
    this.m16[this.ipi] = value;
  }

  get RP() {
    return this.m16[this.rpi];
  }

  set RP(value: number) {
    this.m16[this.rpi] = value;
  }

  get SP() {
    return this.m16[this.spi];
  }

  set SP(value: number) {
    this.m16[this.spi] = value;
  }

  get8(addr: number) {
    return this.m8[addr];
  }

  get16(addr: number) {
    if (addr % CELLL !== 0) {
      throw new Error(`bad get addr 16: ${addr}`);
    }

    return this.m16[addr / 2];
  }

  set8(addr: number, value: number) {
    this.m8[addr] = value;
  }

  set16(addr: number, value: number) {
    if (addr % CELLL !== 0) {
      throw new Error(`bad set addr 16: ${addr}`);
    }

    this.m16[addr / 2] = value;
  }
}
