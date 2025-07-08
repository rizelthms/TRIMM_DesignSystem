// @jest-environment jsdom
import { render, screen } from "@testing-library/react";
import TokenEditor from "../src/ColorTokenEditor";

describe("ColorTokenEditor", () => {
    it("renders the floating action button (FAB)", () => {
        render(<TokenEditor side="right" />);
        const fab = screen.getByRole("button", { name: /open color token editor/i });
        expect(fab).toBeInTheDocument();
    });
}); 