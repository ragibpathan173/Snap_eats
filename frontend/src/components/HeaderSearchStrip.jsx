import { useEffect, useRef } from "react";

function HeaderSearchStrip({ onSearchTermChange, open, searchTerm }) {
  const inputRef = useRef(null);
  const stripRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    stripRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 160);

    return () => window.clearTimeout(focusTimer);
  }, [open]);

  return (
    <div className={`header-search-strip ${open ? "open" : ""}`} id="headerSearchStrip" ref={stripRef}>
      <div className="container">
        <div className="search-bar">
          <input
            id="searchInput"
            onChange={(event) => onSearchTermChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
              }
            }}
            placeholder="Search for restaurants, cuisines, or dishes..."
            ref={inputRef}
            type="text"
            value={searchTerm}
          />
          <button className="search-btn" id="searchActionButton" type="button">
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeaderSearchStrip;
