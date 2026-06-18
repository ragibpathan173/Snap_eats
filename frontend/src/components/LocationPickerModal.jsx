import { useEffect, useMemo, useRef, useState } from "react";

const curatedLocations = [
  { label: "Jamia Nagar", subtitle: "Okhla, New Delhi, Delhi, India" },
  { label: "Koramangala", subtitle: "Bangalore, Karnataka, India" },
  { label: "Sector 29", subtitle: "Gurgaon, Haryana, India" },
  { label: "Jubilee Hills", subtitle: "Hyderabad, Telangana, India" },
  { label: "Bandra West", subtitle: "Mumbai, Maharashtra, India" },
  { label: "Baner", subtitle: "Pune, Maharashtra, India" },
  { label: "Adyar", subtitle: "Chennai, Tamil Nadu, India" },
  { label: "Salt Lake", subtitle: "Kolkata, West Bengal, India" }
];

function isSelectedLocation(selectedLocation, location) {
  return selectedLocation?.label === location.label && selectedLocation?.subtitle === location.subtitle;
}

function LocationPickerModal({ onClose, onLocationSelect, open, selectedLocation }) {
  const [query, setQuery] = useState("");
  const [gpsStatus, setGpsStatus] = useState({ message: "", type: "idle" });
  const inputRef = useRef(null);

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return curatedLocations;
    }

    return curatedLocations.filter((location) =>
      location.label.toLowerCase().includes(normalizedQuery)
      || location.subtitle.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    document.body.classList.add("modal-open");
    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.classList.remove("modal-open");
    };
  }, [open]);

  if (!open) {
    return null;
  }

  function handleCurrentLocation() {
    setGpsStatus({ message: "Using current location for nearby restaurants.", type: "success" });
    onLocationSelect({
      label: "Current location",
      subtitle: "Detected from this browser"
    });
  }

  function handleManualLocation() {
    setGpsStatus({ message: "Search an area above or choose one of the recent locations.", type: "loading" });
    inputRef.current?.focus();
  }

  return (
    <div className="modal open react-location-modal" id="locationModal" role="dialog" aria-modal="true" aria-label="Choose delivery location">
      <div className="modal-content location-modal-content">
        <button className="close-btn" onClick={onClose} type="button" aria-label="Close location picker">
          &times;
        </button>

        <div className="location-picker-shell">
          <div className="location-search-box">
            <input
              className="location-search-input"
              id="locationSearchInput"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for area, street name..."
              ref={inputRef}
              type="text"
              value={query}
            />
            <p className={`location-gps-status ${gpsStatus.type}`} id="locationGpsStatus">
              {gpsStatus.message}
            </p>
          </div>

          <section className="location-panel">
            <button className="location-action-card react-location-card" onClick={handleCurrentLocation} type="button">
              <span className="location-action-icon">&#9906;</span>
              <div>
                <strong>Get current location</strong>
                <p>Using GPS</p>
              </div>
            </button>
            <button className="location-action-card react-location-card" onClick={handleManualLocation} type="button">
              <span className="location-action-icon">+</span>
              <div>
                <strong>Add address manually</strong>
                <p>Enter an area, landmark, or street</p>
              </div>
            </button>
            <div id="manualLocationFormHost"></div>
          </section>

          <section className="location-panel">
            <p className="location-panel-title">Recent searches</p>
            {suggestions.length ? suggestions.map((location) => (
              <button
                className="location-history-card react-location-card"
                key={`${location.label}-${location.subtitle}`}
                onClick={() => onLocationSelect(location)}
                type="button"
              >
                <span className="location-history-icon">&#9716;</span>
                <div>
                  <strong>{location.label}</strong>
                  <p>{location.subtitle}</p>
                  {isSelectedLocation(selectedLocation, location) ? (
                    <span className="location-selected-badge">Selected</span>
                  ) : null}
                </div>
              </button>
            )) : (
              <div className="location-history-card">
                <span className="location-history-icon">&#9716;</span>
                <div>
                  <strong>No matching places</strong>
                  <p className="location-empty-note">Try a different area name or add it manually.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default LocationPickerModal;
