import { TAB_LABELS } from "./constants";
import { TabKey } from "./types";

type BottomNavProps = {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
};

export function BottomNav({ activeTab, onChangeTab }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Navegacao principal">
      {TAB_LABELS.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChangeTab(item.key)}
          className={activeTab === item.key ? "nav-item active" : "nav-item"}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
