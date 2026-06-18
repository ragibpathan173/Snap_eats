import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAddresses, placeCheckoutOrder } from "../api/client.js";

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value || 0);
}

function formatAddress(address) {
  if (!address) {
    return "";
  }

  return [
    address.addressLine,
    address.landmark,
    address.city,
    address.state,
    address.pincode
  ]
    .filter(Boolean)
    .join(", ");
}

function getItemPrice(lineItem) {
  return lineItem.item.discountedPrice || lineItem.item.price || 0;
}

const paymentOptions = [
  {
    description: "Pay in cash or UPI when your order arrives.",
    label: "Cash on delivery",
    pill: "Cash",
    value: "CASH"
  },
  {
    description: "Use any UPI app for a fast payment.",
    label: "UPI",
    pill: "UPI",
    value: "UPI"
  },
  {
    description: "Pay securely using a credit or debit card.",
    label: "Card",
    pill: "Card",
    value: "CARD"
  },
  {
    description: "Use a saved wallet at checkout.",
    label: "Wallet",
    pill: "Wallet",
    value: "WALLET"
  }
];

function CheckoutPage({ items, onOrderPlaced, onQuantityChange, session, total }) {
  const [addresses, setAddresses] = useState([]);
  const [addressStatus, setAddressStatus] = useState("idle");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [couponCode, setCouponCode] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState("neutral");
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const currentUser = session.user;
  const restaurantCode = items[0]?.restaurantCode || "";
  const selectedAddress = useMemo(() => {
    return addresses.find((address) => String(address.id) === String(selectedAddressId)) || null;
  }, [addresses, selectedAddressId]);
  const itemCount = useMemo(() => {
    return items.reduce((sum, lineItem) => sum + lineItem.quantity, 0);
  }, [items]);
  const restaurantName = items[0]?.restaurantName || "Restaurant";
  const canPlaceOrder = Boolean(!submitting && currentUser?.id && selectedAddress && restaurantCode);
  const checkoutButtonLabel = !currentUser
    ? "Login before checkout"
    : !selectedAddress
      ? "Add a delivery address first"
      : `Pay ${formatPrice(total)}`;

  useEffect(() => {
    let ignore = false;

    async function loadAddresses() {
      if (!currentUser?.id || !session.token) {
        setAddresses([]);
        setSelectedAddressId("");
        setAddressStatus("idle");
        return;
      }

      setAddressStatus("loading");

      try {
        const addressData = await fetchAddresses(currentUser.id, session.token);

        if (ignore) {
          return;
        }

        const nextAddresses = Array.isArray(addressData) ? addressData : [];
        setAddresses(nextAddresses);
        setSelectedAddressId((currentAddressId) => {
          if (nextAddresses.some((address) => String(address.id) === String(currentAddressId))) {
            return currentAddressId;
          }

          return String(nextAddresses.find((address) => address.defaultAddress)?.id || nextAddresses[0]?.id || "");
        });
        setAddressStatus("ready");
      } catch (error) {
        if (!ignore) {
          setAddressStatus(error.message || "Could not load saved addresses.");
        }
      }
    }

    loadAddresses();

    return () => {
      ignore = true;
    };
  }, [currentUser?.id, session.token]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!currentUser?.id || !session.token) {
      setFeedback("Login before placing an order.");
      setFeedbackTone("error");
      return;
    }

    if (!restaurantCode) {
      setFeedback("Please add items from a restaurant again before checkout.");
      setFeedbackTone("error");
      return;
    }

    if (!selectedAddress) {
      setFeedback("Choose a saved delivery address first.");
      setFeedbackTone("error");
      return;
    }

    setSubmitting(true);
    setFeedback("Placing your order...");
    setFeedbackTone("neutral");

    try {
      const orderResponse = await placeCheckoutOrder(
        {
          addressId: selectedAddress.id,
          couponCode: couponCode.trim() || null,
          customerName: selectedAddress.recipientName || currentUser.name,
          items: items.map((lineItem) => ({
            itemId: lineItem.item.itemId || lineItem.item.id || lineItem.key,
            name: lineItem.item.name,
            notes: "",
            price: getItemPrice(lineItem),
            quantity: lineItem.quantity
          })),
          paymentMethod,
          restaurantCode,
          specialInstructions: specialInstructions.trim()
        },
        currentUser.id,
        session.token
      );

      setPlacedOrder({
        address: selectedAddress,
        itemCount,
        paymentMethod,
        restaurantName,
        response: orderResponse,
        total
      });
      setFeedback("Order placed successfully.");
      setFeedbackTone("success");
      onOrderPlaced(orderResponse);
    } catch (error) {
      setFeedback(error.message || "Failed to place order.");
      setFeedbackTone("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (placedOrder) {
    const order = placedOrder.response?.order;
    const paidTotal = order?.finalAmount || placedOrder.total;

    return (
      <section className="cart-shell order-success-shell">
        <div className="order-success-card">
          <div className="order-success-badge">Order placed</div>
          <h2>{order?.restaurantName || placedOrder.restaurantName || "Your order is confirmed"}</h2>
          <p className="order-success-copy">
            Order <strong>{order?.orderNumber || "confirmed"}</strong> is confirmed and headed to{" "}
            <strong>{placedOrder.address.label || "your address"}</strong>.
          </p>

          <div className="order-success-grid">
            <div className="account-card">
              <span>ETA</span>
              <strong>35 mins</strong>
            </div>
            <div className="account-card">
              <span>Payment</span>
              <strong>{paymentOptions.find((option) => option.value === placedOrder.paymentMethod)?.label || "Cash on delivery"}</strong>
            </div>
            <div className="account-card">
              <span>Total paid</span>
              <strong>{formatPrice(paidTotal)}</strong>
            </div>
            <div className="account-card">
              <span>Items</span>
              <strong>{placedOrder.itemCount} item{placedOrder.itemCount === 1 ? "" : "s"}</strong>
            </div>
          </div>

          <div className="order-success-actions">
            <Link className="primary-button" to="/restaurants">Continue browsing</Link>
          </div>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="cart-shell">
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Add a few dishes from a restaurant to start your order.</p>
          <Link className="primary-button" to="/restaurants">Browse restaurants</Link>
        </div>
      </section>
    );
  }

  return (
    <form className="cart-shell checkout-form" onSubmit={handleSubmit}>
      <div className="cart-layout">
        <section className="checkout-main">
          <section className="address-summary-card">
            <div className="address-summary-head">
              <div>
                <p className="menu-eyebrow">Delivery address</p>
                <h3>
                  {selectedAddress ? selectedAddress.label : currentUser ? "No saved address selected" : "Login required"}
                </h3>
              </div>
              <Link className="secondary-button" to={currentUser ? "/addresses" : "/account"}>
                {currentUser ? "Manage addresses" : "Login or sign up"}
              </Link>
            </div>

            {!currentUser ? (
              <p className="address-empty-note">Login before placing an order so checkout can attach the order to your account.</p>
            ) : null}

            {currentUser && addressStatus === "loading" ? (
              <p className="address-empty-note">Loading saved addresses...</p>
            ) : null}

            {currentUser && addressStatus !== "idle" && addressStatus !== "loading" && addressStatus !== "ready" ? (
              <p className="checkout-feedback error">{addressStatus}</p>
            ) : null}

            {currentUser && addresses.length ? (
              <>
                <label>
                  Saved address
                  <select
                    disabled={addressStatus === "loading"}
                    onChange={(event) => setSelectedAddressId(event.target.value)}
                    value={selectedAddressId}
                  >
                    {addresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {address.defaultAddress ? "Default - " : ""}{address.label} - {formatAddress(address)}
                      </option>
                    ))}
                  </select>
                </label>
                {selectedAddress ? (
                  <>
                    <p className="address-recipient">
                      {[selectedAddress.recipientName, selectedAddress.phoneNumber].filter(Boolean).join(" - ")}
                    </p>
                    <p className="address-line">{formatAddress(selectedAddress)}</p>
                  </>
                ) : null}
              </>
            ) : null}

            {currentUser && addressStatus === "ready" && !addresses.length ? (
              <p className="address-empty-note">Save at least one address before placing an order.</p>
            ) : null}
          </section>

          <section className="payment-entry-card">
            <div className="payment-entry-head">
              <div>
                <p className="menu-eyebrow">Payment</p>
                <h3>Choose payment method</h3>
              </div>
              <Link className="secondary-button" to="/account">Manage payments</Link>
            </div>
            <p className="payment-entry-copy">Select your payment option and add any delivery notes before placing the order.</p>

            <div className="checkout-payment-section">
              <div className="checkout-payment-list">
                {paymentOptions.map((option) => (
                  <label
                    className={`checkout-payment-card ${paymentMethod === option.value ? "selected" : ""}`}
                    key={option.value}
                  >
                    <input
                      checked={paymentMethod === option.value}
                      name="paymentMethod"
                      onChange={() => setPaymentMethod(option.value)}
                      type="radio"
                      value={option.value}
                    />
                    <div>
                      <strong>{option.label}</strong>
                      <p>{option.description}</p>
                    </div>
                    <span className="payment-type-pill">{option.pill}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="payment-notes">
              Delivery notes
              <textarea
                onChange={(event) => setSpecialInstructions(event.target.value)}
                placeholder="Optional cooking or delivery note"
                rows="3"
                value={specialInstructions}
              />
            </label>
          </section>
        </section>

        <section className="checkout-panel order-summary-panel">
          <div className="order-summary-head">
            <p className="menu-eyebrow">Order from</p>
            <h3>{restaurantName}</h3>
          </div>

          <section className="cart-items-list">
            {items.map((lineItem) => {
              const itemPrice = getItemPrice(lineItem);

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
            <div><span>Subtotal</span><strong>{formatPrice(total)}</strong></div>
            <div><span>Delivery fee</span><strong>FREE</strong></div>
            <div className="checkout-total"><span>Total</span><strong>{formatPrice(total)}</strong></div>
          </div>

          <section className="coupon-panel">
            <div className="coupon-panel-head">
              <div>
                <p className="menu-eyebrow">Coupons</p>
                <h3>Apply coupon code</h3>
              </div>
            </div>
            <div className="coupon-input-row">
              <input
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="Enter coupon code"
                type="text"
                value={couponCode}
              />
              <button
                className="primary-button"
                onClick={() => {
                  setFeedback(couponCode.trim() ? "Coupon will be checked when you place the order." : "Enter a coupon code first.");
                  setFeedbackTone(couponCode.trim() ? "success" : "error");
                }}
                type="button"
              >
                Apply
              </button>
            </div>
          </section>

          {feedback ? (
            <div className={`checkout-feedback ${feedbackTone === "error" ? "error" : ""} ${feedbackTone === "success" ? "success" : ""}`}>
              {feedback}
            </div>
          ) : null}

          <button
            className="primary-button checkout-button"
            disabled={!canPlaceOrder}
            type="submit"
          >
            {submitting ? "Placing order..." : checkoutButtonLabel}
          </button>
        </section>
      </div>
    </form>
  );
}

export default CheckoutPage;
