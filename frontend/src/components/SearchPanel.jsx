function SearchPanel({ resultCount, searchTerm }) {
  return (
    <section className="hero-banner">
      <div className="container">
        <h1 className="hero-title">Order food online from your favorite restaurants</h1>
        <p className="hero-subtitle">
          Fresh meals, quick delivery, and menus you can explore in one place
        </p>
        {searchTerm ? <p className="react-result-count">{resultCount} found</p> : null}
      </div>
    </section>
  );
}

export default SearchPanel;
