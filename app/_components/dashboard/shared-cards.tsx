import { ReportRow } from "./types";
import { toBrl } from "./utils";

export function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="card kpi-card">
      <p>{label}</p>
      <h3>{value}</h3>
    </article>
  );
}

export function ChartCard({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: ReportRow[];
  emptyText: string;
}) {
  const maxValue = items.length > 0 ? Math.max(...items.map((item) => item.value)) : 0;

  return (
    <article className="card stack-sm">
      <h3 className="list-title">{title}</h3>
      {items.length === 0 ? (
        <p className="muted">{emptyText}</p>
      ) : (
        items.slice(0, 6).map((item) => {
          const width = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <div key={item.label} className="chart-row">
              <div className="chart-head">
                <span>{item.label}</span>
                <strong>{toBrl(item.value)}</strong>
              </div>
              <div className="chart-track">
                <div className="chart-fill" style={{ width: `${Math.max(width, 6)}%` }} />
              </div>
            </div>
          );
        })
      )}
    </article>
  );
}
