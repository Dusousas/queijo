import { TAB_LABELS } from "./constants";
import { TabKey } from "./types";

type DesktopSidebarProps = {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  tabCounters: Record<TabKey, number>;
};

export function DesktopSidebar({
  activeTab,
  onChangeTab,
  tabCounters,
}: DesktopSidebarProps) {
  const tabsWithBadge = new Set(["cobranca", "pendencias"]);

  return (
    <aside className="desktop-sidebar">
      <div className="side-brand">
        <div className="brand-badge">QD</div>
        <div>
          <strong>Queijo DS</strong>
          <p className="muted">Controle de fiados</p>
        </div>
      </div>
      <nav className="side-nav" aria-label="Navegacao desktop">
        {TAB_LABELS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onChangeTab(item.key)}
            className={activeTab === item.key ? "side-item active" : "side-item"}
          >
            <span className="side-item-label">
              <span className="side-item-icon" aria-hidden="true">
                <item.icon />
              </span>
              <span>{item.label}</span>
            </span>
            <span className="side-item-right">
              {tabsWithBadge.has(item.key) ? (
                <small className={tabCounters[item.key] > 0 ? "side-item-badge" : "side-item-badge muted"}>
                  {tabCounters[item.key] > 0 ? tabCounters[item.key] : "-"}
                </small>
              ) : null}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
