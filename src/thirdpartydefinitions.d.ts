declare module 'bs58check' {
  const r: {
    encode(buf: Buffer): string
    decode(str: string): Buffer
  };
  export = r;
}
declare module 'ripemd160';