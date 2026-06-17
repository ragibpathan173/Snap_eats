import { Link } from "react-router-dom";

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value || 0);
}

function CartPanel({ items, onClear, onClose, onQuantityChange, open, total }) {
  if (!open) {
    return null;
  }

  return (
    <aside className="cart-panel" aria-label="React cart preview">
      <div className="cart-panel-header">
        <div>
          <p className="eyebrow">React cart</p>
          <h2>Your cart</h2>
        </div>
        <button className="icon-button" onClick={onClose} type="button" aria-label="Close cart">
          X
        </button>
      </div>

      {!items.length ? (
        <p className="empty-state">Add dishes from a restaurant menu to preview cart state.</p>
      ) : (
        <>
          <div className="cart-line-list">
            {items.map((lineItem) => {
              const itemPrice = lineItem.item.discountedPrice || lineItem.item.price || 0;

              return (
                <article className="cart-line-item" key={lineItem.key}>
                  <div>
                    <h3>{lineItem.item.name}</h3>
                    <p>{lineItem.restaurantName}</p>
                    <strong>{formatPrice(itemPrice * lineItem.quantity)}</strong>
                  </div>
                  <div className="quantity-control">
                    <button
                      onClick={() => onQuantityChange(lineItem.key, lineItem.quantity - 1)}
                      type="button"
                      aria-label={`Remove one ${lineItem.item.name}`}
                    >
                      -
                    </button>
                    <span>{lineItem.quantity}</span>
                    <button
                      onClick={() => onQuantityChange(lineItem.key, lineItem.quantity + 1)}
                      type="button"
                      aria-label={`Add one ${lineItem.item.name}`}
                    >
                      +
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="cart-total-row">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>

          <div className="cart-actions">
            <button
              className="secondary-action"
              onClick={onClear}
              type="button"
            >
              Clear
            </button>
            <Link
              className="primary-action"
              onClick={onClose}
              to="/checkout"
            >
              Checkout
            </Link>
          </div>
        </>
      )}
    </aside>
  );
}

export default CartPanel;
