// server/lib/access-code.ts — Access code generation for remote support sessions

import crypto from "crypto";

// Excludes I, 1, O, 0 to avoid ambiguity
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_RE = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{3}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{3}$/;

export function generateAccessCode(): string {
  const pick = () => CHARS[crypto.randomInt(CHARS.length)];
  const part1 = [pick(), pick(), pick()].join("");
  const part2 = [pick(), pick(), pick()].join("");
  return `${part1}-${part2}`;
}

export function validateCodeFormat(code: string): boolean {
  return CODE_RE.test(code.toUpperCase());
}
