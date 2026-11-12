# Todos
- [x] Monorepo and semantic tokens
- [x] React component package
- [x] Vue 3 component package
- [x] Tailwind CSS v4 adapter
- [x] Plain HTML/CSS distribution
- [x] 48 templates and previews
- [x] CLI generator and React Gallery
- [x] React, Vue and static examples
- [x] Validation, CI and Docker
- [x] Project-integrated AcmeUI Web agent Skill with metadata and validation gate
- [ ] Visual regression baselines after browser-approved release
- [ ] Publish versioned npm packages

## ROADMAP-001（2026-11-10 稽核）

詳見 [優先序與驗收條件](docs/roadmap/ROADMAP-001.md)。

- [x] R001 / P0：Modal 焦點候選與容器 fallback，core + React/Vue 回歸測試
- [x] R002 / P0：CLI 語意外殼、型別依賴、產物編譯與錯誤輸入測試
- [x] R003 / P1：雙向元件家族契約、CSS drift、registry metadata / catalog 驗證
- [x] R004 / P1：靜態 HTML Tabs / Modal 漸進增強與鍵盤測試
- [x] R005 / P1：表單、Switch、Button、Progress、Pagination 行為對照測試
- [x] R006 / P1：語意色彩、對比、Gallery accessible names 與 axe 基線
- [x] R007 / P2：其餘元件語意測試與單元測試 typecheck
- [x] R008 / P2：CLI 嚴格參數解析、theme cleanup 與安裝後 build matrix
- [x] R009 / P2：預覽 HTML parser 與四尺寸瀏覽器 layout smoke
- [x] R010 / P2：驗證文件、build warning gate 與 Gallery 全家族覆蓋

## ROADMAP-002（2026-11-11 第二輪稽核）

詳見 [稽核與自動驗收條件](docs/roadmap/ROADMAP-002.md)。

- [x] R011 / P1：動態 Tabs 選取回復與 React/Vue 鍵盤重排對照
- [x] R012 / P1：Static preview server 路徑限制與錯誤復原 HTTP 測試
- [x] R013 / P1：原生 static dialog 四尺寸/亮暗色 Chromium 鍵盤驗證
- [x] R014 / P2：Static Tabs 重複 ID / 歧義關聯初始化驗證
- [x] R015 / P1：React/Vue Modal 背景互動隔離與焦點外移防護

## ROADMAP-003（2026-11-11 第三輪互動契約稽核）

詳見 [稽核與驗收條件](docs/roadmap/ROADMAP-003.md)。

- [x] R016 / P1：Tabs 完整 panel 關聯、內容保留與 Gallery 可見家族 gate
- [x] R017 / P2：原生 radio group／contenteditable 循序焦點候選與鍵盤邊界

## ROADMAP-004（2026-11-11 第四輪輸入／鍵盤契約稽核）

詳見 [稽核與驗收條件](docs/roadmap/ROADMAP-004.md)。

- [x] R018 / P2：React/Vue Tabs 重複 value 初始化／更新驗證
- [x] R019 / P2：Modal 尊重已取消鍵盤事件與 IME 組字旗標

## ROADMAP-005（2026-11-12 第五輪事件／原生焦點稽核）

詳見 [稽核證據、重現與驗收條件](docs/roadmap/ROADMAP-005.md)。

- [x] R020 / P2：React/Vue/static Tabs 尊重已取消與組字中的鍵盤事件
- [x] R021 / P2：Static Modal 尊重消費端取消的原生 cancel／開關 click
- [x] R022 / P2：Modal 原生 details/summary 循序焦點候選與動態邊界
