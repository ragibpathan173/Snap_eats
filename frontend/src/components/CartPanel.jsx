import { useState } from "react";

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value || 0);
}

function CartPanel({ items, onClear, onClose, onQuantityChange, open, total }) {
  const [checkoutVisible, setCheckoutVisible] = useState(false);

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
              onClick={() => {
                setCheckoutVisible(false);
                onClear();
              }}
              type="button"
            >
              Clear
            </button>
            <button
              className="primary-action"
              onClick={() => setCheckoutVisible((visible) => !visible)}
              type="button"
            >
              Checkout preview
            </button>
          </div>

          {checkoutVisible ? (
            <form className="checkout-preview">
              <label>
                Delivery address
                <textarea rows="3" placeholder="House, street, area, city" />
              </label>

              <label>
                Payment method
                <select defaultValue="CASH">
                  <option value="CASH">Cash on delivery</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                </select>
              </label>

              <div className="checkout-preview-total">
                <span>Payable preview</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <p>
                This is a React checkout preview. Backend order placement will be migrated in a later step.
              </p>
            </form>
          ) : null}
        </>
      )}
    </aside>
  );
}

export default CartPanel;
