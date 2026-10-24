import { describe, expect, it } from "vitest";
import {
  formatInr,
  lineTotalPaise,
  paiseToRupees,
  rupeesToPaise,
  sumPaise,
} from "./money";

describe("money", () => {
  it("converts rupees to paise", () => {
    expect(rupeesToPaise(170)).toBe(17000);
    expect(rupeesToPaise(60)).toBe(6000);
    expect(rupeesToPaise(299)).toBe(29900);
    expect(rupeesToPaise(0.5)).toBe(50);
  });

  it("converts paise to rupees", () => {
    expect(paiseToRupees(17000)).toBe(170);
    expect(paiseToRupees(50)).toBe(0.5);
  });

  it("formats paise as INR", () => {
    expect(formatInr(189900)).toBe("₹1,899");
    expect(formatInr(69900)).toBe("₹699");
    expect(formatInr(50)).toBe("₹0.50");
  });

  it("computes line totals in paise", () => {
    expect(lineTotalPaise(69900, 2)).toBe(139800);
    expect(lineTotalPaise(100, 0)).toBe(0);
  });

  it("sums paise without floats", () => {
    expect(sumPaise([100, 250, 50])).toBe(400);
  });

  it("rejects non-integer paise", () => {
    expect(() => formatInr(10.5)).toThrow(/integer/);
  });
});
