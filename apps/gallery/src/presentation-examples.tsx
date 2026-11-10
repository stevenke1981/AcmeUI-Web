import { Alert, Avatar, Breadcrumb, Card, CardContent, CardFooter, CardHeader, DataTable, FeatureGrid } from '@acmeui/react';

export function PresentationExamples() {
  return <div className="acme-stack">
    <Breadcrumb items={[{ label: '元件', href: '#components' }, { label: '內容與資料' }]} />
    <Alert tone="info" title="內容元件">表格可自訂儲存格；頭像縮寫保留可存取名稱。</Alert>
    <Card><CardHeader><h3 className="acme-card__title">團隊成員</h3></CardHeader>
      <CardContent><div className="acme-cluster"><Avatar name="Ada Lovelace" /><span>Ada Lovelace</span></div></CardContent>
      <CardFooter>Card 的 header、content、footer 使用共用 CSS。</CardFooter></Card>
    <DataTable caption="成員與席次" rows={[{ name: 'Ada', seats: 2 }, { name: 'Lin', seats: 0 }]} columns={[{ key: 'name', label: '姓名' }, { key: 'seats', label: '席次', render: value => <strong>{String(value)} 席</strong> }]} />
    <FeatureGrid items={[{ title: '自訂圖示', description: 'React icon 或 Vue icon scoped slot。', icon: <span aria-hidden="true">→</span> }]} />
  </div>;
}
