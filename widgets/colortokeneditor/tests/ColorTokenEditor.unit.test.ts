import { describe, it, expect } from "@jest/globals";
import { isValidColor } from "../src/ColorTokenEditor";

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