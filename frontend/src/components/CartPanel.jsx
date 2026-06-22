import { useEffect } from "react";
import { Link } from "react-router-dom";

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value || 0);
}

function VegIcon() {
  return (
    <svg className="cart-veg-icon" viewBox="0 0 14 14" width="14" height="14">
      <rect x="0.5" y="0.5" width="13" height="13" rx="2" fill="none" stroke="#0f8a4f" strokeWidth="1" />
      <circle cx="7" cy="7" r="3.2" fill="#0f8a4f" />
    </svg>
  );
}

function NonVegIcon() {
  return (
    <svg className="cart-nonveg-icon" viewBox="0 0 14 14" width="14" height="14">
      <rect x="0.5" y="0.5" width="13" height="13" rx="2" fill="none" stroke="#e43b4f" strokeWidth="1" />
      <polygon points="7,3 11.5,11 2.5,11" fill="#e43b4f" />
    </svg>
  );
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

  const deliveryFee = 0;
  const platformFee = total > 0 ? 5 : 0;
  const gstCharges = total > 0 ? Math.round(total * 0.05) : 0;
  const grandTotal = total + deliveryFee + platformFee + gstCharges;
  const savings = items.reduce((acc, li) => {
    const original = li.item.price || 0;
    const discounted = li.item.discountedPrice || original;
    return acc + (original - discounted) * li.quantity;
  }, 0);

  return (
    <div className="modal open react-cart-modal" aria-label="Your cart" role="dialog" aria-modal="true">
      <div className="modal-content cart-modal-content">
        <button className="close-btn" onClick={onClose} type="button" aria-label="Close cart">
          &times;
        </button>

        <div className="se-cart-shell">
          {!items.length ? (
            <div className="se-cart-empty">
              <div className="se-cart-empty-icon" aria-hidden="true">
                <svg viewBox="0 0 64 64" width="80" height="80">
                  <path d="M12 16h40l-4 32H16L12 16z" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M22 16V12a10 10 0 0 1 20 0v4" fill="none" stroke="#d1d5db" strokeWidth="2" />
                  <circle cx="24" cy="52" r="3" fill="#d1d5db" />
                  <circle cx="40" cy="52" r="3" fill="#d1d5db" />
                </svg>
              </div>
              <h2>Your cart is empty</h2>
              <p>You can go to home page to view more restaurants</p>
              <Link className="se-cart-browse-btn" onClick={onClose} to="/restaurants">
                See restaurants near you
              </Link>
            </div>
          ) : (
            <div className="se-cart-filled">
              {/* Restaurant header strip */}
              <div className="se-cart-restaurant-strip">
                <div className="se-cart-restaurant-info">
                  <div className="se-cart-restaurant-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
                    </svg>
                  </div>
                  <div>
                    <h3>{items[0]?.restaurantName || "Restaurant"}</h3>
                    <p>Delivery in 25-35 min</p>
                  </div>
                </div>
              </div>

              {/* Items list */}
              <div className="se-cart-items">
                {items.map((lineItem) => {
                  const itemPrice = lineItem.item.discountedPrice || lineItem.item.price || 0;
                  const originalPrice = lineItem.item.price || 0;
                  const hasDiscount = lineItem.item.discountedPrice && lineItem.item.discountedPrice < originalPrice;
                  const isVeg = lineItem.item.isVeg !== false;

                  return (
                    <div className="se-cart-item" key={lineItem.key}>
                      <div className="se-cart-item-left">
                        <span className="se-cart-item-type">{isVeg ? <VegIcon /> : <NonVegIcon />}</span>
                        <div className="se-cart-item-details">
                          <h4>{lineItem.item.name}</h4>
                          <div className="se-cart-item-price-row">
                            {hasDiscount ? (
                              <>
                                <span className="se-cart-item-price">{formatPrice(itemPrice)}</span>
                                <span className="se-cart-item-original-price">{formatPrice(originalPrice)}</span>
                              </>
                            ) : (
                              <span className="se-cart-item-price">{formatPrice(itemPrice)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="se-cart-item-right">
                        <div className="se-cart-stepper">
                          <button
                            className="se-cart-stepper-btn"
                            onClick={() => onQuantityChange(lineItem.key, lineItem.quantity - 1)}
                            type="button"
                            aria-label={`Remove one ${lineItem.item.name}`}
                          >
                            −
                          </button>
                          <span className="se-cart-stepper-count">{lineItem.quantity}</span>
                          <button
                            className="se-cart-stepper-btn"
                            onClick={() => onQuantityChange(lineItem.key, lineItem.quantity + 1)}
                            type="button"
                            aria-label={`Add one ${lineItem.item.name}`}
                          >
                            +
                          </button>
                        </div>
                        <span className="se-cart-item-total">{formatPrice(itemPrice * lineItem.quantity)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Suggestions / input */}
              <div className="se-cart-suggestions">
                <input className="se-cart-note-input" placeholder="Any suggestions? We will pass it on..." type="text" />
              </div>

              {/* No-contact delivery option */}
              <div className="se-cart-contact-option">
                <label className="se-cart-checkbox-label">
                  <input type="checkbox" />
                  <span>Opt in for No-contact Delivery</span>
                </label>
                <p>Our delivery partner will leave the order at your doorstep and will notify you.</p>
              </div>

              {/* Bill details */}
              <div className="se-cart-bill">
                <h4>Bill Details</h4>
                <div className="se-cart-bill-row">
                  <span>Item Total</span>
                  <span className={savings > 0 ? "se-cart-bill-has-savings" : ""}>{formatPrice(total)}</span>
                </div>
                <div className="se-cart-bill-row">
                  <span>Delivery Fee</span>
                  <span className="se-cart-bill-free">FREE</span>
                </div>
                <div className="se-cart-bill-row se-cart-bill-light">
                  <span>Platform fee</span>
                  <span>{formatPrice(platformFee)}</span>
                </div>
                <div className="se-cart-bill-row se-cart-bill-light">
                  <span>GST and Restaurant Charges</span>
                  <span>{formatPrice(gstCharges)}</span>
                </div>
                <div className="se-cart-bill-total">
                  <span>TO PAY</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Savings strip */}
              {savings > 0 ? (
                <div className="se-cart-savings-strip">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M21 7L9 19l-5.5-5.5 1.41-1.41L9 16.17 19.59 5.59z" fill="#fff" />
                  </svg>
                  <span>You saved {formatPrice(savings)} on this order!</span>
                </div>
              ) : null}

              {/* Action buttons */}
              <div className="se-cart-actions">
                <button className="se-cart-clear-btn" onClick={onClear} type="button">
                  Clear Cart
                </button>
                <div className="se-cart-checkout-actions">
                  <Link className="se-cart-addresses-btn" onClick={onClose} to="/addresses">
                    Manage Addresses
                  </Link>
                  <Link className="se-cart-checkout-btn" onClick={onClose} to="/checkout">
                    <span>Proceed to Checkout</span>
                    <span className="se-cart-checkout-total">{formatPrice(grandTotal)}</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartPanel;
