import { useEffect } from "react";
import { Link } from "react-router-dom";

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value || 0);
}

function CartPanel({ items, onClear, onClose, onQuantityChange, open, total }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    document.body.classList.add("modal-open");

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="modal open react-cart-modal" aria-label="Your cart" role="dialog" aria-modal="true">
      <div className="modal-content cart-modal-content">
        <button className="close-btn" onClick={onClose} type="button" aria-label="Close cart">
          &times;
        </button>

        <div className="cart-shell">
          <div className="cart-header">
            <div>
              <p className="menu-eyebrow">Your cart</p>
              <h2>{items.length ? "Review your order" : "Your cart is empty"}</h2>
            </div>
          </div>

          {!items.length ? (
            <div className="cart-empty">
              <h2>Your cart is empty</h2>
              <p>Add a few dishes from a restaurant to start your order.</p>
              <Link className="primary-button" onClick={onClose} to="/restaurants">
                Browse restaurants
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <section className="checkout-main">
                <section className="address-summary-card">
                  <div className="address-summary-head">
                    <div>
                      <p className="menu-eyebrow">Delivery address</p>
                      <h3>Select at checkout</h3>
                    </div>
                    <Link className="secondary-button" onClick={onClose} to="/addresses">
                      Manage addresses
                    </Link>
                  </div>
                  <p className="address-empty-note">Choose your saved delivery address before placing the order.</p>
                </section>

                <section className="payment-entry-card">
                  <div className="payment-entry-head">
                    <div>
                      <p className="menu-eyebrow">Payment</p>
                      <h3>Choose payment method</h3>
                    </div>
                    <button className="secondary-button" onClick={onClear} type="button">
                      Clear cart
                    </button>
                  </div>
                  <p className="payment-entry-copy">Select your payment option on the next step.</p>
                  <Link className="primary-button checkout-button" onClick={onClose} to="/checkout">
                    Proceed to checkout
                  </Link>
                </section>
              </section>

              <section className="checkout-panel order-summary-panel">
                <div className="order-summary-head">
                  <p className="menu-eyebrow">Order from</p>
                  <h3>{items[0]?.restaurantName || "Restaurant"}</h3>
                </div>

                <section className="cart-items-list">
                  {items.map((lineItem) => {
                    const itemPrice = lineItem.item.discountedPrice || lineItem.item.price || 0;

                    return (
                      <article className="cart-item-card" key={lineItem.key}>
                        <img
                          className="cart-item-image"
                          src={lineItem.item.image}
                          alt={lineItem.item.name}
                          loading="lazy"
                        />
                        <div className="cart-item-copy">
                          <h3>{lineItem.item.name}</h3>
                          <p>{formatPrice(itemPrice)} each</p>
                        </div>
                        <div className="cart-item-controls" aria-label={`${lineItem.item.name} quantity controls`}>
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
                        <div className="cart-item-total">{formatPrice(itemPrice * lineItem.quantity)}</div>
                      </article>
                    );
                  })}
                </section>

                <div className="checkout-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>{formatPrice(total)}</strong>
                  </div>
                  <div>
                    <span>Delivery fee</span>
                    <strong>FREE</strong>
                  </div>
                  <div className="checkout-total">
                    <span>Total</span>
                    <strong>{formatPrice(total)}</strong>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartPanel;
