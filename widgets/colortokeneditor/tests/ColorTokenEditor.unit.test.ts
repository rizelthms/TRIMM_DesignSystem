import { describe, it, expect } from "@jest/globals";
import { isValidColor } from "../src/ColorTokenEditor";
import { deriveDarkColor } from "../src/ColorTokenEditor";
import { getValidHex } from "../src/ColorTokenEditor";

describe("isValidColor", () => {
    it("returns true for valid 6-digit hex", () => {
        expect(isValidColor("#123456")).toBe(true);
        expect(isValidColor("#abcdef")).toBe(true);
    });
    it("returns true for valid 3-digit hex", () => {
        expect(isValidColor("#abc")).toBe(true);
    });
    it("returns true for valid rgb", () => {
        expect(isValidColor("rgb(255,0,0)")).toBe(true);
    });
    it("returns false for empty or undefined", () => {
        expect(isValidColor("")).toBe(false);
        expect(isValidColor(undefined as any)).toBe(false);
    });
    it("returns false for non-color strings", () => {
        expect(isValidColor("notacolor")).toBe(false);
        expect(isValidColor("#12g")).toBe(false);
    });
    it("returns false for Mendix template strings", () => {
        expect(isValidColor("#{somevar}")).toBe(false);
    });
});

describe("deriveDarkColor", () => {
    it("darkens a standard 6-digit hex color", () => {
        expect(deriveDarkColor("#123456")).toMatch(/^#[0-9a-f]{6}$/i);
        expect(deriveDarkColor("#ffffff")).not.toBe("#ffffff");
    });
    it("darkens a 3-digit hex color", () => {
        expect(deriveDarkColor("#abc")).toMatch(/^#[0-9a-f]{6}$/i);
    });
    it("returns fallback for invalid hex", () => {
        expect(deriveDarkColor("notacolor")).toMatch(/^#[0-9a-f]{6}$/i);
    });
});

describe("deriveDarkColor edge cases", () => {
    it("returns a dark color for #000000 (should still be #000000 or similar)", () => {
        expect(deriveDarkColor("#000000")).toMatch(/^#[0-9a-f]{6}$/i);
    });
    it("returns a dark color for #ffffff (should be much darker)", () => {
        const result = deriveDarkColor("#ffffff");
        expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        expect(result.toLowerCase()).not.toBe("#ffffff");
    });
    it("returns fallback for malformed hex (e.g. #12, #gggggg)", () => {
        expect(deriveDarkColor("#12")).toMatch(/^#[0-9a-f]{6}$/i);
        expect(deriveDarkColor("#gggggg")).toMatch(/^#[0-9a-f]{6}$/i);
    });
});

describe("getValidHex", () => {
    it("returns the value if it is a valid 6-digit hex", () => {
        expect(getValidHex("#123456")).toBe("#123456");
    });
    it("returns the value if it is a valid 3-digit hex", () => {
        expect(getValidHex("#abc")).toBe("#abc");
    });
    it("returns fallback for invalid hex", () => {
        expect(getValidHex("notacolor")).toBe("#000000");
    });
    it("returns custom fallback if provided", () => {
        expect(getValidHex("notacolor", "#fff111")).toBe("#fff111");
    });
});

describe("getValidHex edge cases", () => {
    it("returns uppercase and mixed case hex as-is", () => {
        expect(getValidHex("#ABCDEF")).toBe("#ABCDEF");
        expect(getValidHex("#aBc123")).toBe("#aBc123");
    });
    it("returns fallback for invalid but hex-like strings", () => {
        expect(getValidHex("#12345g")).toBe("#000000");
        expect(getValidHex("#12-3456")).toBe("#000000");
    });
});

describe("isValidColor edge cases", () => {
    it("returns false for CSS variable strings", () => {
        expect(isValidColor("var(--brand-1)")).toBe(false);
        expect(isValidColor("#{brand-1}")).toBe(false);
        expect(isValidColor("#{brand-1}")).toBe(false);
    });
    it("returns false for whitespace and numbers", () => {
        expect(isValidColor("   ")).toBe(false);
        expect(isValidColor("123456")).toBe(false);
        expect(isValidColor("#12 3456")).toBe(false);
    });
    it("returns false for null, undefined, or non-string", () => {
        expect(isValidColor(null as any)).toBe(false);
        expect(isValidColor(undefined as any)).toBe(false);
        expect(isValidColor(123 as any)).toBe(false);
    });
});

describe("bulk validation", () => {
    it("validates an array of token values", () => {
        const values = ["#123456", "#abc", "rgb(1,2,3)", "notacolor", "", undefined];
        const results = values.map(v => isValidColor(v));
        expect(results).toEqual([true, true, true, false, false, false]);
    });
}); 