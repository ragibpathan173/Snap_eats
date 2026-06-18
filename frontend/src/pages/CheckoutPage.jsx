import { Link } from "react-router-dom";

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    style: "currency"
  }).format(value || 0);
}

function CheckoutPage({ currentUser, items, onQuantityChange, total }) {
  return (
    <section className="checkout-page">
      <div className="section-heading">
        <p className="eyebrow">React checkout</p>
        <h1>Review your order.</h1>
      </div>

      {!items.length ? (
        <div className="checkout-empty">
          <p>Your cart is empty.</p>
          <Link className="primary-action" to="/restaurants">Browse restaurants</Link>
        </div>
      ) : (
        <div className="checkout-layout">
          <div className="checkout-items">
            {!currentUser ? (
              <div className="checkout-auth-callout">
                <p>Login before placing an order so checkout can attach the order to your account.</p>
                <Link className="secondary-action" to="/account">Login or sign up</Link>
              </div>
            ) : (
              <div className="checkout-auth-callout signed-in">
                <p>Ordering as <strong>{currentUser.name || currentUser.email || "SnapEats customer"}</strong></p>
              </div>
            )}

            {items.map((lineItem) => {
              const itemPrice = lineItem.item.discountedPrice || lineItem.item.price || 0;

              return (
                <article className="checkout-line-item" key={lineItem.key}>
                  <div>
                    <p className="eyebrow">{lineItem.restaurantName}</p>
                    <h3>{lineItem.item.name}</h3>
                    <p>{formatPrice(itemPrice)} each</p>
                  </div>

                  <div className="quantity-control" aria-label={`${lineItem.item.name} quantity`}>
                    <button
                      onClick={() => onQuantityChange(lineItem.key, lineItem.quantity - 1)}
                      type="button"
                    >
                      -
                    </button>
                    <span>{lineItem.quantity}</span>
                    <button
                      onClick={() => onQuantityChange(lineItem.key, lineItem.quantity + 1)}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <form className="checkout-preview checkout-route-form">
            <label>
              Delivery address
              <textarea rows="4" placeholder="House, street, area, city" />
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
            <button className="primary-action" type="button">
              Place order preview
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

export default CheckoutPage;
