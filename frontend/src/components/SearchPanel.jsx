function SearchPanel({ onSearchTermChange, resultCount, searchTerm }) {
  return (
    <section className="catalog-hero">
      <div>
        <p className="eyebrow">Live API powered</p>
        <h1>Find meals from SnapEats restaurants.</h1>
        <p>
          Search restaurants, cuisines, and localities from the same backend
          catalog used by the current SnapEats app.
        </p>
      </div>

      <div className="search-panel">
        <label htmlFor="restaurantSearch">Search catalog</label>
        <div className="search-row">
          <input
            id="restaurantSearch"
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Try biryani, pizza, Jamia Nagar..."
            type="search"
            value={searchTerm}
          />
          <span>{resultCount} found</span>
        </div>
      </div>
    </section>
  );
}

export default SearchPanel;
