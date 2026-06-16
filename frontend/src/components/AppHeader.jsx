function AppHeader({ status }) {
  return (
    <header className="app-header">
      <a className="brand" href="snap_eats.html" aria-label="SnapEats home">
        <span className="brand-mark" aria-hidden="true">SE</span>
        <span>
          <strong>SnapEats</strong>
          <small>React catalog</small>
        </span>
      </a>

      <div className="header-actions">
        <span className="status-pill">{status}</span>
        <a className="legacy-link" href="snap_eats.html">Open main app</a>
      </div>
    </header>
  );
}

export default AppHeader;
