function getCategoryKey(category) {
  return category.categoryId || category.id || category.name;
}

function CategoryChips({ activeCategory, categories, onCategoryChange }) {
  if (!categories.length) {
    return <p className="empty-state">Categories will appear here after the API responds.</p>;
  }

  const visibleCategories = [
    { id: "all", filter: "all", name: "All" },
    ...categories.slice(0, 12)
  ];

  return (
    <div className="category-list">
      {visibleCategories.map((category) => {
        const categoryFilter = category.filter || "all";

        return (
          <button
            className={`category-chip ${activeCategory === categoryFilter ? "active" : ""}`}
            key={getCategoryKey(category)}
            onClick={() => onCategoryChange(categoryFilter)}
            type="button"
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryChips;
