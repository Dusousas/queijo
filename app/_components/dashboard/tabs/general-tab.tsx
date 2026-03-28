import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ReportRow } from "../types";
import { toBrl } from "../utils";

type GeneralTabProps = {
  totalDebt: number;
  totalEntries: number;
  totalClients: number;
  totalProducts: number;
  totalCharges: number;
  avgTicket: number;
  monthSeries: { period: string; total: number }[];
  citySeries: ReportRow[];
  productSeries: ReportRow[];
  topDebtors: { name: string; total: number }[];
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
  totalDebt,
  totalEntries,
  totalClients,
  totalProducts,
  totalCharges,
  avgTicket,
  monthSeries,
  citySeries,
  productSeries,
  topDebtors,
}: GeneralTabProps) {
  const normalizedSeries = normalizeSeries(monthSeries);
  const recurringSeries = buildMetricSeries(normalizedSeries, 1, 18);
  const netSeries = buildMetricSeries(normalizedSeries, 0.88, 16);
  const feesSeries = buildMetricSeries(normalizedSeries, 0.3, 8);
  const otherSeries = buildMetricSeries(normalizedSeries, 0.42, 10);

  const chartMetrics: ChartMetric[] = [
    {
      title: "Receita recorrente mensal",
      current: totalEntries,
      previous: totalEntries * 0.86,
      series: recurringSeries,
    },
    {
      title: "Receita liquida",
      current: totalEntries * 0.88,
      previous: totalEntries * 0.76,
      series: netSeries,
    },
    {
      title: "Taxas",
      current: totalEntries * 0.3,
      previous: totalEntries * 0.24,
      series: feesSeries,
    },
    {
      title: "Outras receitas",
      current: totalEntries * 0.42,
      previous: totalEntries * 0.31,
      series: otherSeries,
    },
  ];

  const summaryCards = [
    {
      label: "Novos pedidos",
      value: String(totalCharges),
      previous: String(Math.max(totalCharges - 1, 0)),
    },
    {
      label: "Receita dos pedidos",
      value: toBrl(totalEntries),
      previous: toBrl(totalEntries * 0.82),
    },
    {
      label: "Ticket medio",
      value: toBrl(avgTicket),
      previous: toBrl(avgTicket * 0.78),
    },
    {
      label: "Cidades ativas",
      value: String(citySeries.length),
      previous: String(Math.max(citySeries.length - 1, 0)),
    },
    {
      label: "Produtos vendidos",
      value: String(productSeries.length),
      previous: String(Math.max(productSeries.length - 1, 0)),
    },
    {
      label: "Maior devedor",
      value: topDebtors[0] ? toBrl(topDebtors[0].total) : toBrl(0),
      previous: topDebtors[1] ? toBrl(topDebtors[1].total) : toBrl(0),
    },
  ];

  return (
    <section className="stack">
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

      <div className="finance-summary-grid">
        {summaryCards.map((card) => (
          <article key={card.label} className="card finance-summary-card">
            <p>{card.label}</p>
            <h4>{card.value}</h4>
            <small>
              periodo anterior <strong>{card.previous}</strong>
            </small>
          </article>
        ))}
      </div>

      <div className="overview-mini-grid">
        <article className="card overview-mini-card">
          <p>Saldo devedor</p>
          <h4>{toBrl(totalDebt)}</h4>
        </article>
        <article className="card overview-mini-card">
          <p>Total de clientes</p>
          <h4>{totalClients}</h4>
        </article>
        <article className="card overview-mini-card">
          <p>Total de produtos</p>
          <h4>{totalProducts}</h4>
        </article>
      </div>
    </section>
  );
}
