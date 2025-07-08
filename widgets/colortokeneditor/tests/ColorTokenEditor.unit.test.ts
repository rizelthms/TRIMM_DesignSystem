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