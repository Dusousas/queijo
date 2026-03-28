import { ChartCard, KpiCard } from "../shared-cards";
import { ReportSummary } from "../types";
import { toBrl } from "../utils";

type ReportsTabProps = {
  report: ReportSummary;
  clientsCount: number;
};

export function ReportsTab({ report, clientsCount }: ReportsTabProps) {
  return (
    <section className="stack">
      <div className="kpi-grid">
        <KpiCard label="Total de vendas" value={toBrl(report.totalSales)} />
        <KpiCard label="Saldo devedor" value={toBrl(report.totalDebt)} />
        <KpiCard label="Ticket medio" value={toBrl(report.avgTicket)} />
        <KpiCard label="Clientes ativos" value={String(clientsCount)} />
      </div>

      <div className="chart-grid">
        <ChartCard
          title="Vendas por cidade"
          items={report.byCity}
          emptyText="Sem dados de cidade ainda."
        />
        <ChartCard
          title="Vendas por produto"
          items={report.byProduct}
          emptyText="Sem dados de produto ainda."
        />
      </div>
    </section>
  );
}
