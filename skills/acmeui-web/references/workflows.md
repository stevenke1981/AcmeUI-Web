# AcmeUI Web Workflows

## A. Build a page with existing components

1. Identify the target framework.
2. Import shared token/style CSS before framework components.
3. Compose existing primitives rather than creating duplicate one-off UI.
4. Keep page-specific layout outside the library unless reusable.
5. Add accessible names, labels, and landmarks.
6. Verify theme and four viewport widths.

## B. Add a component family

Checklist:

- [ ] Public purpose and non-goals defined.
- [ ] Anatomy and semantic class contract documented.
- [ ] Default, hover, active, focus-visible, disabled states implemented.
- [ ] Controlled/uncontrolled behavior decided where relevant.
- [ ] React implementation and export added.
- [ ] Vue implementation and export added.
- [ ] Static usage shown where relevant.
- [ ] Gallery story/example added.
- [ ] Typecheck and build pass.
- [ ] Keyboard and screen-reader semantics reviewed.

Avoid API drift such as React using `loading` while Vue uses an unrelated semantic prop unless the difference is framework-idiomatic and documented.

## C. Add a template

Checklist:

- [ ] Unique slug and registry metadata.
- [ ] `index.html`, `style.css`, `script.js` exist.
- [ ] Direct-file opening works.
- [ ] Theme toggle works without a framework runtime.
- [ ] Mobile navigation/content remains usable.
- [ ] CLI generation succeeds for all three frameworks.
- [ ] Generated projects include `acmeui.template.json`.
- [ ] Catalog and Gallery updated.

## D. Modify tokens

1. Search all uses of the token and any direct raw values it replaces.
2. Update the token source of truth.
3. Update semantic adapter mappings.
4. Check light/dark contrast and foreground pairs.
5. Check representative components and at least one marketing plus one dashboard template.
6. Avoid renaming stable tokens without migration notes.

## E. Fix CLI generation

1. Reproduce with an empty temporary directory.
2. Test invalid names, invalid framework, invalid template, and non-empty targets.
3. Ensure generated package metadata is valid JSON.
4. Run syntax/type/build checks in generated React and Vue projects when dependencies are available.
5. Run static output from a static server and by direct-file opening.
6. Run the full 48 × 3 generation matrix after generator changes.

## F. Release readiness

- Confirm version consistency across relevant package manifests.
- Run validation, CLI matrix, typecheck, build.
- Inspect package file inclusion/exclusion.
- Confirm README commands match actual scripts.
- Update changelog/release notes if present.
- Record known limitations instead of concealing them.
