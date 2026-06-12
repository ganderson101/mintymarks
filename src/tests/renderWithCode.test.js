import { describe, it, expect } from "vitest";
import { renderWithCode } from "../components/QuestionCard.jsx";

describe("renderWithCode", () => {
  it("returns the string unchanged when there are no backtick fences", () => {
    expect(renderWithCode("What is 2 + 2?")).toBe("What is 2 + 2?");
  });

  it("returns falsy input unchanged", () => {
    expect(renderWithCode(null)).toBeNull();
    expect(renderWithCode("")).toBe("");
    expect(renderWithCode(undefined)).toBeUndefined();
  });

  it("returns an array when input contains a fenced block", () => {
    const result = renderWithCode("Before\n```\nx = 1\n```\nAfter");
    expect(Array.isArray(result)).toBe(true);
  });

  it("renders code block as a <pre> element with className code-block", () => {
    const result = renderWithCode("```\nprint('hi')\n```");
    // result is an array; find the pre element
    const parts = Array.isArray(result) ? result : [result];
    const pre = parts.find((p) => p && p.type === "pre");
    expect(pre).toBeDefined();
    expect(pre.props.className).toBe("code-block");
  });

  it("wraps plain text segments in <span> elements", () => {
    const result = renderWithCode("intro\n```\ncode\n```\noutro");
    const parts = Array.isArray(result) ? result : [result];
    const spans = parts.filter((p) => p && p.type === "span");
    expect(spans.length).toBeGreaterThanOrEqual(1);
  });

  it("strips the language tag from the opening fence", () => {
    const result = renderWithCode("```python\nprint('hi')\n```");
    const parts = Array.isArray(result) ? result : [result];
    const pre = parts.find((p) => p && p.type === "pre");
    const codeText = pre.props.children.props.children;
    expect(codeText).toBe("print('hi')\n");
    expect(codeText).not.toContain("python");
  });

  it("handles multiple code blocks in one string", () => {
    const result = renderWithCode("A\n```\nfoo\n```\nB\n```\nbar\n```\nC");
    const parts = Array.isArray(result) ? result : [result];
    const pres = parts.filter((p) => p && p.type === "pre");
    expect(pres.length).toBe(2);
  });

  it("preserves inner code content (indentation, newlines)", () => {
    const code = "def f():\n    return 1\n";
    const result = renderWithCode("```python\n" + code + "```");
    const parts = Array.isArray(result) ? result : [result];
    const pre = parts.find((p) => p && p.type === "pre");
    expect(pre.props.children.props.children).toBe(code);
  });
});
