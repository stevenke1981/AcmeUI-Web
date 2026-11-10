# Design System
## Principles
1. Semantic-first values, not hardcoded brand colors.
2. Foreground/background pairs for safe theme switching.
3. Compact but readable controls.
4. Visible focus rings and reduced-motion support.
5. Same visual contract across React, Vue, Tailwind and static HTML.
## Contract
Component classes use the `acme-` prefix. Framework packages compose these
classes rather than reimplement styling, keeping parity testable.
## Theme
Set `data-theme="dark"` on a container or document root. Override `--acme-*`
variables to brand the system without forking components.

R006 adds semantic overlay/switch/code tokens, opaque visible focus and automated
light/dark contrast checks. See [accessibility scope](ACCESSIBILITY.md) for tested
pairs, axe exclusions/incomplete rules and remaining browser/human checks.
