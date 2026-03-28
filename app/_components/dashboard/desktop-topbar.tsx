export function DesktopTopbar() {
  return (
    <header className="desktop-topbar">
      <label className="desktop-search">
        <input placeholder="Buscar cliente, produto, cidade ou fiado..." />
      </label>
      <div className="topbar-actions">
        <button type="button" className="date-pill">
          04 Jan 2026 - 28 Mar 2026
        </button>
        <div className="avatar">ES</div>
      </div>
    </header>
  );
}
