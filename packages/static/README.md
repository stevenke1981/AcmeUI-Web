# @acmeui/static
```html
<link rel="stylesheet" href="./tokens.css">
<link rel="stylesheet" href="./base.css">
<button class="acme-button acme-button--primary">開始使用</button>
```

`src/base.css` 與 `packages/styles/src/base.css` 共用相同 component CSS，只有
首行 token import 路徑不同。修改共用樣式時同步 static 副本；`pnpm lint` /
`pnpm test` 會拒絕漂移。這個套件目前提供樣式，Tabs / Modal 的互動漸進增強
仍列於 ROADMAP-001 / R004。
