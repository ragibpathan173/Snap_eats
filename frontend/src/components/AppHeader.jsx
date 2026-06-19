import { NavLink } from "react-router-dom";

function getRouteClassName({ isActive }) {
  return isActive ? "nav-link react-route-link active" : "nav-link react-route-link";
}

function getAccountLabel(currentUser) {
  return currentUser?.name ? currentUser.name.trim().split(/\s+/)[0] : "Account";
}

function AppHeader({ cartItemCount, currentUser, onCartOpen, onCorporateOpen, onHelpOpen, onLocationOpen, onOffersOpen, onSearchToggle, selectedLocation }) {
  function handleLocationKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onLocationOpen();
    }
  }

  return (
    <header className="header">
      <div className="container">
        <div className="brand-block">
          <NavLink className="logo" to="/restaurants" aria-label="SnapEats home">
            <span className="logo-mark" aria-hidden="true">
              <svg viewBox="0 0 64 64">
                <path d="M30.9 11.7c0-1.1.9-2 2-2s2 .9 2 2v2.1h-4z" fill="currentColor" />
                <path d="M13.4 33.4a18.6 18.6 0 0 1 37.2 0z" fill="currentColor" />
                <path d="M20.6 27.5c1.8-4.2 4.3-7.1 7.4-8.3 2-.8 3.8 1.3 2.6 3-1.7 2.3-2.8 5-3.4 7.9h-6.6z" fill="#ffffff" />
                <rect x="8.8" y="33.1" width="46.4" height="3.7" rx="1.85" fill="currentColor" />
                <path d="M16.4 39.8h31.2a2.5 2.5 0 0 1 0 5H16.4a2.5 2.5 0 0 1 0-5z" fill="currentColor" />
              </svg>
            </span>
            <span className="logo-text">SnapEats</span>
          </NavLink>
          <div
            className="location-chip"
            onClick={onLocationOpen}
            onKeyDown={handleLocationKeyDown}
            role="button"
            tabIndex="0"
          >
            <span className="location-label">{selectedLocation?.label || "Other"}</span>
            <span className="location-subtitle">{selectedLocation?.subtitle || ""}</span>
            <span className="location-caret" aria-hidden="true">&#9662;</span>
          </div>
        </div>

        <div className="header-actions">
          <nav className="nav-links" aria-label="SnapEats">
            <button className="nav-link nav-button" onClick={onCorporateOpen} type="button">
              <span className="nav-link-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M7 7.5A2.5 2.5 0 0 1 9.5 5h5A2.5 2.5 0 0 1 17 7.5V9h1.5A1.5 1.5 0 0 1 20 10.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-8A1.5 1.5 0 0 1 5.5 9H7V7.5Zm2.5-1A1.5 1.5 0 0 0 8 8v1h8V8a1.5 1.5 0 0 0-1.5-1.5h-5Z" /></svg>
              </span>
              <span>About SnapEats</span>
            </button>
            <NavLink className="nav-link" onClick={onSearchToggle} to="/restaurants">
              <span className="nav-link-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M10.5 4a6.5 6.5 0 1 0 4.03 11.6l4.43 4.43 1.06-1.06-4.43-4.43A6.5 6.5 0 0 0 10.5 4Zm0 1.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" /></svg>
              </span>
              <span>Search</span>
            </NavLink>
            <button className="nav-link nav-button" onClick={onOffersOpen} type="button">
              <span className="nav-link-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 2 9.2 7.63 3 8.53l4.5 4.39-1.06 6.2L12 16.2l5.56 2.92-1.06-6.2L21 8.53l-6.2-.9L12 2Zm0 3.24 1.66 3.35.19.39.43.06 3.7.54-2.67 2.61-.31.3.07.43.63 3.69-3.31-1.74L12 14.7l-.39.21-3.31 1.74.63-3.69.07-.43-.31-.3-2.67-2.61 3.7-.54.43-.06.19-.39L12 5.24Z" /></svg>
              </span>
              <span>Offers</span>
            </button>
            <button className="nav-link nav-button" onClick={onHelpOpen} type="button">
              <span className="nav-link-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0-9 9 8.96 8.96 0 0 0 2.29 6l-1.04 3.34 3.47-.94A9 9 0 1 0 12 3Zm0 1.5a7.5 7.5 0 1 1 0 15 7.44 7.44 0 0 1-3.71-.98l-.28-.16-1.95.53.6-1.92-.19-.29A7.46 7.46 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5Zm-.75 3v5.19l4.11 2.37.75-1.3-3.36-1.94V7.5h-1.5Z" /></svg>
              </span>
              <span>Help</span>
            </button>
          </nav>

          <div className="nav-top-actions">
            <NavLink className={getRouteClassName} to="/account">
              <span className="nav-link-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 1.5c-3.32 0-6 2.01-6 4.5V19h12v-1c0-2.49-2.68-4.5-6-4.5Zm0-8a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" /></svg>
              </span>
              <span>{getAccountLabel(currentUser)}</span>
            </NavLink>
            <button className="nav-link cart-link nav-button" onClick={onCartOpen} type="button">
              <span className="nav-link-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M6 4h12l-1 14H7L6 4Zm1.63 1.5.79 11h7.16l.79-11H7.63ZM9.5 7V6a2.5 2.5 0 0 1 5 0v1H13V6a1 1 0 1 0-2 0v1H9.5Z" /></svg>
              </span>
              <span>Cart</span>
              <span className="cart-count">{cartItemCount}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
