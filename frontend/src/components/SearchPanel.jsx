function SearchPanel({ onSearchTermChange, resultCount, searchTerm }) {
  return (
    <>
      <div className="header-search-strip open">
        <div className="container">
          <div className="search-bar">
            <input
              id="restaurantSearch"
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder="Search for restaurants, cuisines, or dishes..."
              type="text"
              value={searchTerm}
            />
            <button className="search-btn" type="button">Search</button>
          </div>
        </div>
      </div>

      <section className="hero-banner">
        <div className="container">
          <h1 className="hero-title">Order food online from your favorite restaurants</h1>
          <p className="hero-subtitle">
            Fresh meals, quick delivery, and menus you can explore in one place
          </p>
          {searchTerm ? <p className="react-result-count">{resultCount} found</p> : null}
        </div>
      </section>
    </>
  );
}

export default SearchPanel;
