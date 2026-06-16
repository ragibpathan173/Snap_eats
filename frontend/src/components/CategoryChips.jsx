function getCategoryKey(category) {
  return category.categoryId || category.id || category.name;
}

function CategoryChips({ categories }) {
  if (!categories.length) {
    return <p className="empty-state">Categories will appear here after the API responds.</p>;
  }

  return (
    <div className="category-list">
      {categories.map((category) => (
        <span className="category-chip" key={getCategoryKey(category)}>
          {category.name}
        </span>
      ))}
    </div>
  );
}

export default CategoryChips;
