function getCategoryKey(category) {
  return category.categoryId || category.id || category.name;
}

function CategoryChips({ activeCategory, categories, onCategoryChange }) {
  if (!categories.length) {
    return <p className="empty-state">Categories will appear here after the API responds.</p>;
  }

  const visibleCategories = categories.slice(0, 12);

  return (
    <div className="categories-container">
      {visibleCategories.map((category) => {
        const categoryFilter = category.filter || "all";
        const hasImage = Boolean(category.image);

        return (
          <button
            className={`category-card ${activeCategory === categoryFilter ? "active" : ""} ${hasImage ? "" : "image-fallback"}`}
            key={getCategoryKey(category)}
            onClick={() => onCategoryChange(categoryFilter)}
            type="button"
          >
            {hasImage ? <img className="category-image" src={category.image} alt={category.name} loading="lazy" /> : null}
            <div className="category-overlay">
              <div className="category-name">{category.name}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default CategoryChips;
