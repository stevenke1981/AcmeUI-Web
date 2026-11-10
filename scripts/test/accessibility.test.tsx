import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { App } from "../../apps/gallery/src/App";
import { enhanceTabs } from "../../packages/static/src/interactions.mjs";

const cleanups: Array<() => void> = [];
afterEach(() => { cleanup(); cleanups.splice(0).forEach(fn => fn()); document.body.innerHTML = ""; });

// WCAG relative luminance; channels use sRGB, never rounded before assertions.
function rgb(color: string): number[] {
  if (!/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(color)) throw new Error(`Expected opaque hex: ${color}`);
  const hex = color.slice(1).length === 3 ? color.slice(1).split("").map(c => c + c).join("") : color.slice(1);
  return [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
}
function composite(foreground: number[], background: number[], alpha: number): number[] {
  return foreground.map((channel, index) => channel * alpha + background[index] * (1 - alpha));
}
function contrast(a: number[], b: number[]): number {
  const luminance = (channels: number[]) => channels.map(channel => {
    const value = channel / 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
const tokens = JSON.parse(readFileSync("packages/tokens/src/tokens.json", "utf8"));
const css = readFileSync("packages/styles/src/base.css", "utf8");
const surfaces = ["background", "surface", "surface-muted", "muted", "secondary"];

describe("semantic color contrast", () => {
  it("checks the calculation against known values and the former translucent ring", () => {
    expect(contrast(rgb("#000"), rgb("#fff"))).toBeCloseTo(21, 8);
    expect(contrast(rgb("#777"), rgb("#fff"))).toBeLessThan(4.5);
    expect(contrast(composite(rgb("#6366f1"), rgb("#fff"), .45), rgb("#fff"))).toBeLessThan(3);
  });
  for (const theme of ["light", "dark"]) {
    const colors: Record<string, string> = { ...tokens.themes.light.colors, ...tokens.themes[theme].colors };
    const ratio = (foreground: string, background: string) => contrast(rgb(colors[foreground]), rgb(colors[background]));
    it(`${theme}: body, muted, primary and secondary text meet 4.5:1`, () => {
      for (const background of surfaces) for (const foreground of ["foreground", "muted-foreground", "primary"]) {
        expect(ratio(foreground, background), `${theme}: ${foreground} / ${background}`).toBeGreaterThanOrEqual(4.5);
      }
      for (const background of ["primary", "primary-hover"]) expect(ratio("primary-foreground", background)).toBeGreaterThanOrEqual(4.5);
      expect(ratio("secondary-foreground", "secondary")).toBeGreaterThanOrEqual(4.5);
      expect(ratio("code-foreground", "code-background")).toBeGreaterThanOrEqual(4.5);
    });
    it(`${theme}: opaque focus ring and control indicators meet 3:1`, () => {
      for (const background of surfaces) {
        expect(ratio("ring", background), `${theme}: ring / ${background}`).toBeGreaterThanOrEqual(3);
        expect(ratio("input", background), `${theme}: input / ${background}`).toBeGreaterThanOrEqual(3);
      }
      for (const track of ["switch-track", "primary"]) {
        expect(ratio("switch-thumb", track), `${theme}: thumb / ${track}`).toBeGreaterThanOrEqual(3);
        for (const background of ["background", "surface"]) expect(ratio(track, background)).toBeGreaterThanOrEqual(3);
      }
      expect(ratio("primary", "muted")).toBeGreaterThanOrEqual(3);
    });
  }
  it("binds focus, switch, overlay and Gallery code to semantic variables", () => {
    expect(css).toMatch(/:focus-visible\{outline:3px solid var\(--acme-ring\);outline-offset:2px/);
    expect(css).toMatch(/\.acme-switch\{[^}]*background:var\(--acme-switch-track\)/);
    expect(css).toMatch(/\.acme-switch::after\{[^}]*background:var\(--acme-switch-thumb\)/);
    expect(css).toMatch(/\.acme-modal\{[^}]*background:var\(--acme-overlay\)/);
    expect(css).toMatch(/\.acme-dialog::backdrop\{background:var\(--acme-overlay\)/);
    const gallery = readFileSync("apps/gallery/src/gallery.css", "utf8");
    expect(gallery).toMatch(/\.cli-code\{[^}]*background:var\(--acme-code-background\);color:var\(--acme-code-foreground\)/);
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
  });
});

async function scan() {
  // jsdom cannot evaluate contrast or icon-ligature text measurement (canvas).
  // Disable these explicitly instead of mocking a passing browser result.
  const result = await axe.run(document, { rules: {
    "color-contrast": { enabled: false },
    "label-content-name-mismatch": { enabled: false },
  } });
  expect(result.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
  // axe cannot determine rendered landmark/heading visibility in jsdom. Keep this
  // allowlist explicit; any new incomplete rule needs investigation.
  const browserOnly = new Set(["landmark-one-main", "page-has-heading-one"]);
  expect(result.incomplete.filter(v => !browserOnly.has(v.id)).map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ html: n.html, summary: n.failureSummary, any: n.any, none: n.none, all: n.all })) }))).toEqual([]);
  expect(document.querySelectorAll("main")).toHaveLength(1);
  expect(document.querySelectorAll("h1")).toHaveLength(1);
  return result;
}
function shell() {
  const html = readFileSync("apps/gallery/index.html", "utf8");
  document.documentElement.lang = html.match(/lang="([^"]+)"/)![1];
  document.title = html.match(/<title>([^<]+)<\/title>/)![1];
}

describe("Gallery axe DOM baseline (not browser conformance)", () => {
  it("gives the template search an explicit name and keeps filtering functional", () => {
    shell(); render(<App />);
    expect(screen.getByRole("navigation", { name: "主要導覽" })).toBeTruthy();
    const search = screen.getByRole("searchbox", { name: "搜尋模板" });
    fireEvent.change(search, { target: { value: "no-such-template-xyz" } });
    expect(document.querySelectorAll(".template-card")).toHaveLength(0);
    expect(screen.getByRole("status").textContent).toContain("0");
    fireEvent.change(search, { target: { value: "" } });
    expect(document.querySelectorAll(".template-card")).toHaveLength(48);
  });
  for (const theme of ["light", "dark"]) it(`${theme}: scans every Gallery tab and open Modal states`, async () => {
    shell(); render(<App />);
    if (theme === "dark") fireEvent.click(screen.getByRole("switch", { name: "深色模式" }));
    expect(document.querySelector("[data-theme]")?.getAttribute("data-theme")).toBe(theme);
    await scan();
    fireEvent.click(screen.getByRole("tab", { name: "表單與邊界行為" })); await scan();
    fireEvent.click(screen.getByRole("tab", { name: "內容與資料" })); await scan();
    fireEvent.click(screen.getByRole("tab", { name: "Pricing" })); await scan();
    fireEvent.click(screen.getByRole("button", { name: "建立專案" }));
    expect(screen.getByRole("dialog", { name: "建立新專案" })).toBeTruthy(); await scan();
  }, 20000);
  it("also scans the static example before and after Tabs enhancement", async () => {
    const html = readFileSync("apps/gallery/static.html", "utf8");
    document.documentElement.lang = "zh-Hant"; document.title = "Static AcmeUI";
    document.body.innerHTML = html.match(/<body>([\s\S]*)<script type="module">/)![1];
    await scan();
    cleanups.push(enhanceTabs(document.querySelector("[data-acme-tabs]")!));
    await scan();
  });
  it("proves the axe gate detects an unnamed control", async () => {
    document.body.innerHTML = '<main><button></button></main>';
    const result = await axe.run(document, { runOnly: ["button-name"] });
    expect(result.violations.map(v => v.id)).toContain("button-name");
  });
});
