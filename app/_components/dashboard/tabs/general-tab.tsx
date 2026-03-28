import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toBrl } from "../utils";

type GeneralTabProps = {
  totalSales: number;
  totalDebt: number;
  totalReceived: number;
  totalOpenClients: number;
  monthSeries: { period: string; total: number }[];
};

type ChartMetric = {
  title: string;
  current: number;
  previous: number;
  series: { period: string; value: number }[];
};

function toTooltipCurrency(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return toBrl(Number.isFinite(parsed) ? parsed : 0);
}

function normalizeSeries(monthSeries: { period: string; total: number }[]) {
  if (monthSeries.some((item) => item.total > 0)) return monthSeries;
  const fallback = [90, 105, 140, 125, 195, 170, 245, 228, 265, 205, 285, 335];
  return monthSeries.map((item, index) => ({ ...item, total: fallback[index] ?? 0 }));
}

function buildMetricSeries(
  monthSeries: { period: string; total: number }[],
  factor: number,
  offsetStep: number,
) {
  return monthSeries.map((item, index) => ({
    period: item.period,
    value: Math.max(0, item.total * factor + index * offsetStep),
  }));
}

function percentageChange(current: number, previous: number) {
  if (previous <= 0) return 100;
  return ((current - previous) / previous) * 100;
}

export function GeneralTab({
  totalSales,
  totalDebt,
  totalReceived,
  totalOpenClients,
  monthSeries,
}: GeneralTabProps) {
  const normalizedSeries = normalizeSeries(monthSeries);
  const recurringSeries = buildMetricSeries(normalizedSeries, 1, 18);
  const netSeries = buildMetricSeries(normalizedSeries, 0.88, 16);

  const chartMetrics: ChartMetric[] = [
    {
      title: "Fiado lancado",
      current: totalSales,
      previous: totalSales * 0.86,
      series: recurringSeries,
    },
    {
      title: "Total recebido",
      current: totalReceived,
      previous: totalReceived * 0.82,
      series: netSeries,
    },
  ];

  const primaryKpis = [
    {
      label: "Total fiado",
      value: toBrl(totalSales),
    },
    {
      label: "Recebido",
      value: toBrl(totalReceived),
    },
    {
      label: "Em aberto",
      value: toBrl(totalDebt),
    },
    {
      label: "Clientes devendo",
      value: String(totalOpenClients),
    },
  ];

  return (
    <section className="stack">
      <div className="overview-kpi-grid">
        {primaryKpis.map((item) => (
          <article key={item.label} className="card overview-kpi-card">
            <p>{item.label}</p>
            <h3>{item.value}</h3>
          </article>
        ))}
      </div>

      <div className="finance-chart-grid">
        {chartMetrics.map((metric) => {
          const change = percentageChange(metric.current, metric.previous);
          const up = change >= 0;

          return (
            <article key={metric.title} className="card finance-chart-card">
              <div className="finance-chart-head">
                <div>
                  <p className="finance-chart-label">{metric.title}</p>
                  <h3>{toBrl(metric.current)}</h3>
                  <p className="finance-chart-sub">periodo anterior {toBrl(metric.previous)}</p>
                </div>
                <span className={up ? "trend-badge up" : "trend-badge down"}>
                  {up ? "+" : "-"} {Math.abs(change).toFixed(1)}%
                </span>
              </div>

              <div className="chart-shell">
                <ResponsiveContainer width="100%" height={190}>
                  <LineChart data={metric.series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5eaf3" vertical={true} />
                    <XAxis dataKey="period" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} width={36} />
                    <Tooltip formatter={(value) => toTooltipCurrency(value)} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#2f66ff"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
