import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAddresses, placeCheckoutOrder } from "../api/client.js";

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
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
        paymentMethod,
        response: orderResponse
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

    return (
      <section className="checkout-page">
        <div className="order-success-card">
          <p className="eyebrow">Order placed</p>
          <h1>{order?.orderNumber || "Your order is confirmed."}</h1>
          <p>
            Delivering to {placedOrder.address.label} using {placedOrder.paymentMethod}.
          </p>
          <div className="checkout-preview-total">
            <span>Total paid</span>
            <strong>{formatPrice(order?.finalAmount || total)}</strong>
          </div>
          <Link className="primary-action" to="/restaurants">Order more food</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <div className="section-heading">
        <p className="eyebrow">React checkout</p>
        <h1>Review and place your order.</h1>
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

          <form className="checkout-preview checkout-route-form" onSubmit={handleSubmit}>
            {!currentUser ? (
              <p className="checkout-form-note">Login first so React checkout can load your saved addresses.</p>
            ) : null}

            {currentUser ? (
              <label>
                Delivery address
                <select
                  disabled={addressStatus === "loading" || !addresses.length}
                  onChange={(event) => setSelectedAddressId(event.target.value)}
                  value={selectedAddressId}
                >
                  {!addresses.length ? <option value="">No saved addresses</option> : null}
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.defaultAddress ? "Default - " : ""}{address.label} - {formatAddress(address)}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {addressStatus !== "idle" && addressStatus !== "loading" && addressStatus !== "ready" ? (
              <p className="auth-feedback error">{addressStatus}</p>
            ) : null}

            {currentUser && addressStatus === "ready" && !addresses.length ? (
              <div className="checkout-address-empty">
                <p>No saved address yet. Add one in React addresses, then return here to place the order.</p>
                <Link className="secondary-action" to="/addresses">Add address</Link>
              </div>
            ) : null}

            <label>
              Payment method
              <select onChange={(event) => setPaymentMethod(event.target.value)} value={paymentMethod}>
                <option value="CASH">Cash on delivery</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="WALLET">Wallet</option>
              </select>
            </label>

            <label>
              Coupon code
              <input
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="Optional"
                type="text"
                value={couponCode}
              />
            </label>

            <label>
              Delivery notes
              <textarea
                onChange={(event) => setSpecialInstructions(event.target.value)}
                placeholder="Optional cooking or delivery note"
                rows="3"
                value={specialInstructions}
              />
            </label>

            <div className="checkout-preview-total">
              <span>Payable preview</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            {feedback ? <p className={`auth-feedback ${feedbackTone}`}>{feedback}</p> : null}

            <button
              className="primary-action"
              disabled={submitting || !currentUser || !selectedAddress || !restaurantCode}
              type="submit"
            >
              {submitting ? "Placing order..." : "Place order"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

export default CheckoutPage;
