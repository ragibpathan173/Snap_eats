import { NavLink } from "react-router-dom";

function getRouteClassName({ isActive }) {
  return isActive ? "legacy-link route-link active" : "legacy-link route-link";
}

function getAccountLabel(currentUser) {
  return currentUser?.name ? currentUser.name.trim().split(/\s+/)[0] : "Account";
}

function AppHeader({ cartItemCount, currentUser, onCartOpen, status }) {
  return (
    <header className="app-header">
      <NavLink className="brand" to="/restaurants" aria-label="SnapEats home">
        <span className="brand-mark" aria-hidden="true">SE</span>
        <span>
          <strong>SnapEats</strong>
          <small>React catalog</small>
        </span>
      </NavLink>

      <div className="header-actions">
        <span className="status-pill">{status}</span>
        <nav className="route-nav" aria-label="React preview">
          <NavLink className={getRouteClassName} to="/restaurants">Restaurants</NavLink>
          <NavLink className={getRouteClassName} to="/checkout">Checkout</NavLink>
          <NavLink className={getRouteClassName} to="/account">{getAccountLabel(currentUser)}</NavLink>
        </nav>
        <button className="legacy-link cart-open-button" onClick={onCartOpen} type="button">
          Cart ({cartItemCount})
        </button>
        <a className="legacy-link" href="snap_eats.html">Open legacy app</a>
      </div>
    </header>
  );
}

export default AppHeader;
