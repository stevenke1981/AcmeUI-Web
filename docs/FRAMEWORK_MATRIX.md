# Framework Matrix
| Capability | React | Vue 3 | Tailwind v4 | Static HTML |
|---|---:|---:|---:|---:|
| Semantic tokens | ✅ | ✅ | ✅ | ✅ |
| Component families | 23 | 23 | Utility adapter | CSS classes |
| Dark theme | ✅ | ✅ | ✅ | ✅ |
| Template CLI | ✅ | ✅ | Theme integration | ✅ |
| Standalone previews | ✅ | ✅ | ✅ | ✅ |
| SSR-compatible styling | ✅ | ✅ | ✅ | n/a |
| Tabs keyboard / Modal focus | Vitest | Vitest | Styling adapter | CSS only; R004 pending |

`node scripts/validate.mjs` 固定檢查 React/Vue 的 23 家族與 React 額外三個
Card composition helpers，也檢查 static/shared CSS 漂移。新增公開家族時須更新
驗證器契約、雙框架 API、文件與 Gallery。此 gate 驗證名稱與資料結構，不代表
型別 API 完全一致、真人瀏覽器視覺對齊或 WCAG AA 審查通過。
