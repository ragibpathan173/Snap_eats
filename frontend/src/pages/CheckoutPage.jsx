import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAddresses, fetchPaymentMethods, placeCheckoutOrder } from "../api/client.js";

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

function formatSavedPaymentMethodLabel(method) {
  if (method?.label) {
    return method.label;
  }

  if (method?.methodType === "CARD") {
    return `${method.cardBrand || "Card"} ending ${method.cardLast4 || ""}`.trim();
  }

  if (method?.methodType === "UPI") {
    return `UPI - ${method.upiId || ""}`.trim();
  }

  return `Wallet - ${method?.walletProvider || ""}`.trim();
}

function formatSavedPaymentMethodSubtitle(method) {
  if (method?.methodType === "CARD") {
    const expiry = [method.expiryMonth, method.expiryYear].filter(Boolean).join("/");
    return [method.cardHolderName, expiry ? `Expires ${expiry}` : ""].filter(Boolean).join(" - ") || "Saved card";
  }

  if (method?.methodType === "UPI") {
    return "Instant UPI payment using this saved ID";
  }

  return "Saved wallet for faster checkout";
}

function formatSavedPaymentMethodType(methodType) {
  return String(methodType || "CARD").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
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

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffffff' }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const HomeIcon = () => (
  <span style={{ fontSize: '16px', marginRight: '4px' }}>🏠</span>
);

const WorkIcon = () => (
  <span style={{ fontSize: '16px', marginRight: '4px' }}>💼</span>
);

const PinIcon = () => (
  <span style={{ fontSize: '16px', marginRight: '4px' }}>📍</span>
);

const VegIcon = () => (
  <svg viewBox="0 0 14 14" width="14" height="14" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <rect x="0.5" y="0.5" width="13" height="13" rx="2" fill="none" stroke="#0f8a4f" strokeWidth="1.2" />
    <circle cx="7" cy="7" r="3.2" fill="#0f8a4f" />
  </svg>
);

const NonVegIcon = () => (
  <svg viewBox="0 0 14 14" width="14" height="14" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <rect x="0.5" y="0.5" width="13" height="13" rx="2" fill="none" stroke="#e43b4f" strokeWidth="1.2" />
    <polygon points="7,3 11.5,11 2.5,11" fill="#e43b4f" />
  </svg>
);

function CheckoutPage({ couponCode, items, onCouponCodeChange, onOrderPlaced, onQuantityChange, session, total }) {
  const [addresses, setAddresses] = useState([]);
  const [addressStatus, setAddressStatus] = useState("idle");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [selectedSavedPaymentMethodId, setSelectedSavedPaymentMethodId] = useState("");
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
  const selectedSavedPaymentMethod = useMemo(() => {
    return paymentMethods.find((method) => String(method.id) === String(selectedSavedPaymentMethodId)) || null;
  }, [paymentMethods, selectedSavedPaymentMethodId]);
  const itemCount = useMemo(() => {
    return items.reduce((sum, lineItem) => sum + lineItem.quantity, 0);
  }, [items]);
  const restaurantName = items[0]?.restaurantName || "Restaurant";
  const selectedPaymentLabel = selectedSavedPaymentMethod
    ? formatSavedPaymentMethodLabel(selectedSavedPaymentMethod)
    : paymentOptions.find((option) => option.value === paymentMethod)?.label || "Cash on delivery";
  const canPlaceOrder = Boolean(!submitting && currentUser?.id && selectedAddress && restaurantCode);

  const deliveryFee = 0;
  const platformFee = total > 0 ? 5 : 0;
  const gstCharges = total > 0 ? Math.round(total * 0.05) : 0;
  const grandTotal = total + deliveryFee + platformFee + gstCharges;
  const savings = items.reduce((acc, li) => {
    const original = li.item.price || 0;
    const discounted = li.item.discountedPrice || original;
    return acc + (original - discounted) * li.quantity;
  }, 0);

  const checkoutButtonLabel = !currentUser
    ? "Login before checkout"
    : !selectedAddress
      ? "Add a delivery address first"
      : `Pay ${formatPrice(grandTotal)}`;

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

  useEffect(() => {
    let ignore = false;

    async function loadPaymentMethods() {
      if (!currentUser?.id || !session.token) {
        setPaymentMethods([]);
        setSelectedSavedPaymentMethodId("");
        setPaymentStatus("idle");
        return;
      }

      setPaymentStatus("loading");

      try {
        const methods = await fetchPaymentMethods(currentUser.id, session.token);

        if (ignore) {
          return;
        }

        const nextMethods = Array.isArray(methods) ? methods : [];
        setPaymentMethods(nextMethods);
        setSelectedSavedPaymentMethodId((currentMethodId) => (
          nextMethods.some((method) => String(method.id) === String(currentMethodId)) ? currentMethodId : ""
        ));
        setPaymentStatus("ready");
      } catch (error) {
        if (!ignore) {
          setPaymentStatus(error.message || "Could not load saved payment methods.");
        }
      }
    }

    loadPaymentMethods();

    return () => {
      ignore = true;
    };
  }, [currentUser?.id, session.token]);

  function selectPaymentOption(methodType) {
    setPaymentMethod(methodType);
    setSelectedSavedPaymentMethodId("");
  }

  function selectSavedPaymentMethod(method) {
    setPaymentMethod(method.methodType);
    setSelectedSavedPaymentMethodId(String(method.id));
  }

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
        paymentLabel: selectedPaymentLabel,
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
    const paidTotal = order?.finalAmount || grandTotal;

    return (
      <section className="placed-order-success-container">
        <div className="placed-order-success-card">
          <div className="success-check-illustration">✓</div>
          <h2 className="success-restaurant-title">{order?.restaurantName || placedOrder.restaurantName || "Your order is confirmed"}</h2>
          <p className="success-order-msg">
            Order <strong>{order?.orderNumber || "confirmed"}</strong> is confirmed and headed to{" "}
            <strong>{placedOrder.address.label || "your address"}</strong>.
          </p>

          <div className="success-details-grid">
            <div className="success-detail-box">
              <span>ETA</span>
              <strong>35 mins</strong>
            </div>
            <div className="success-detail-box">
              <span>Payment</span>
              <strong>{placedOrder.paymentLabel}</strong>
            </div>
            <div className="success-detail-box">
              <span>Total paid</span>
              <strong>{formatPrice(paidTotal)}</strong>
            </div>
            <div className="success-detail-box">
              <span>Items</span>
              <strong>{placedOrder.itemCount} item{placedOrder.itemCount === 1 ? "" : "s"}</strong>
            </div>
          </div>

          <div className="order-success-actions">
            <Link className="checkout-submit-action" to="/restaurants" style={{ textDecoration: 'none' }}>
              Continue browsing
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <div className="checkout-wrapper">
        <div className="placed-order-success-card" style={{ margin: '40px auto' }}>
          <h2>Your cart is empty</h2>
          <p className="success-order-msg">Add a few delicious dishes from a restaurant to start your order.</p>
          <Link className="checkout-submit-action" to="/restaurants" style={{ textDecoration: 'none' }}>
            Browse restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-wrapper">
      <form className="checkout-grid" onSubmit={handleSubmit}>
        <div className="checkout-steps-container">
          
          {/* Step 1: Account (Always completed if session loaded) */}
          <div className="checkout-step-card completed">
            <div className="checkout-step-header">
              <div className="checkout-step-badge">
                <CheckIcon />
              </div>
              <div className="checkout-step-title-area">
                <h3 className="checkout-step-title">Account</h3>
                <p className="checkout-step-subtitle">
                  {currentUser ? `${currentUser.name} | ${currentUser.phoneNumber || currentUser.email || ""}` : "Not logged in"}
                </p>
              </div>
              {currentUser && (
                <Link className="checkout-step-action-link" to="/account">
                  Change
                </Link>
              )}
            </div>
          </div>

          {/* Step 2: Delivery Address */}
          <div className={`checkout-step-card ${currentUser ? "active" : "disabled"}`}>
            <div className="checkout-step-header">
              <div className="checkout-step-badge">
                {selectedAddress ? <CheckIcon /> : "2"}
              </div>
              <div className="checkout-step-title-area">
                <h3 className="checkout-step-title">Delivery Address</h3>
                <p className="checkout-step-subtitle">
                  {selectedAddress ? `${selectedAddress.label} - ${formatAddress(selectedAddress)}` : "Select where you want your food delivered"}
                </p>
              </div>
            </div>
            
            {currentUser && (
              <div className="checkout-step-content">
                {addressStatus === "loading" && (
                  <p className="address-empty-note">Loading saved addresses...</p>
                )}
                {addressStatus !== "idle" && addressStatus !== "loading" && addressStatus !== "ready" && (
                  <p className="checkout-notice-banner error">{addressStatus}</p>
                )}
                
                <div className="saved-addresses-grid">
                  {addresses.map((address) => {
                    const isSelected = String(address.id) === String(selectedAddressId);
                    const isDefault = address.defaultAddress;
                    const addressType = address.label?.toLowerCase() || "";
                    const AddressIcon = addressType.includes("home") ? HomeIcon 
                                      : addressType.includes("work") ? WorkIcon 
                                      : PinIcon;

                    return (
                      <div 
                        key={address.id} 
                        className={`address-select-card ${isSelected ? "selected" : ""}`}
                        onClick={() => setSelectedAddressId(String(address.id))}
                      >
                        <div className="address-card-top">
                          <span className="address-type-badge">
                            <AddressIcon />
                            {address.label}
                          </span>
                          {isDefault && <span className="address-default-badge">Default</span>}
                        </div>
                        <p className="address-recipient-info">
                          {address.recipientName}
                        </p>
                        <p className="address-text">
                          {formatAddress(address)}
                        </p>
                        <div className="address-select-card-footer">
                          <span className="address-phone-number">{address.phoneNumber}</span>
                          <div className="select-indicator"></div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <Link to="/addresses" style={{ textDecoration: 'none' }}>
                    <div className="add-address-card-dashed">
                      <span className="plus-icon">+</span>
                      <strong>Add New Address</strong>
                      <p>Save a new delivery address</p>
                    </div>
                  </Link>
                </div>
                
                {addressStatus === "ready" && !addresses.length && (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <p className="address-empty-note" style={{ marginBottom: '16px' }}>You have no saved addresses yet.</p>
                    <Link className="checkout-apply-btn" to="/addresses" style={{ textDecoration: 'none', display: 'inline-block' }}>
                      + Add your first address
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 3: Payment */}
          <div className={`checkout-step-card ${currentUser && selectedAddress ? "active" : "disabled"}`}>
            <div className="checkout-step-header">
              <div className="checkout-step-badge">
                {submitting ? <CheckIcon /> : "3"}
              </div>
              <div className="checkout-step-title-area">
                <h3 className="checkout-step-title">Choose Payment Method</h3>
                <p className="checkout-step-subtitle">Select your preferred payment option</p>
              </div>
            </div>
            
            {currentUser && selectedAddress && (
              <div className="checkout-step-content">
                {paymentStatus === "loading" && (
                  <p className="payment-empty-note">Loading saved payment methods...</p>
                )}
                {paymentStatus !== "idle" && paymentStatus !== "loading" && paymentStatus !== "ready" && (
                  <p className="checkout-notice-banner error">{paymentStatus}</p>
                )}

                <div className="payment-methods-grid">
                  {/* Saved Payment Methods */}
                  {paymentMethods.map((method) => {
                    const isSelected = String(method.id) === String(selectedSavedPaymentMethodId);
                    const methodType = method.methodType;
                    const isUPI = methodType === "UPI";
                    const isWallet = methodType === "WALLET";

                    return (
                      <div 
                        key={method.id}
                        className={`payment-card-item ${isSelected ? "selected" : ""}`}
                        onClick={() => selectSavedPaymentMethod(method)}
                      >
                        <div className="payment-icon-wrapper">
                          {isUPI ? "⚡" : isWallet ? "👛" : "💳"}
                        </div>
                        <div className="payment-card-info">
                          <div className="payment-card-title">
                            {formatSavedPaymentMethodLabel(method)}
                            <span className="payment-card-badge">
                              {formatSavedPaymentMethodType(methodType)}
                            </span>
                          </div>
                          <p className="payment-card-desc">
                            {formatSavedPaymentMethodSubtitle(method)}
                          </p>
                        </div>
                        <div className="payment-card-radio-wrapper">
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={isSelected}
                            onChange={() => selectSavedPaymentMethod(method)}
                            style={{ accentColor: '#ff6b00' }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Standard Payment Options */}
                  {paymentOptions.map((option) => {
                    const isSelected = !selectedSavedPaymentMethodId && paymentMethod === option.value;
                    const optionValue = option.value;
                    const optIcon = optionValue === "UPI" ? "⚡" 
                                  : optionValue === "CARD" ? "💳" 
                                  : optionValue === "WALLET" ? "👛" 
                                  : "💵";

                    return (
                      <div 
                        key={option.value}
                        className={`payment-card-item ${isSelected ? "selected" : ""}`}
                        onClick={() => selectPaymentOption(option.value)}
                      >
                        <div className="payment-icon-wrapper">
                          {optIcon}
                        </div>
                        <div className="payment-card-info">
                          <div className="payment-card-title">
                            {option.label}
                            <span className="payment-card-badge">{option.pill}</span>
                          </div>
                          <p className="payment-card-desc">
                            {option.description}
                          </p>
                        </div>
                        <div className="payment-card-radio-wrapper">
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={isSelected}
                            onChange={() => selectPaymentOption(option.value)}
                            style={{ accentColor: '#ff6b00' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="delivery-instructions-wrapper">
                  <label className="delivery-instructions-label">
                    Delivery instructions
                  </label>
                  <textarea
                    className="delivery-instructions-textarea"
                    rows="3"
                    value={specialInstructions}
                    onChange={(event) => setSpecialInstructions(event.target.value)}
                    placeholder="E.g., Ring the bell, leave at the gate, or contactless delivery request"
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Sticky Order Summary Column */}
        <div className="checkout-sticky-panel">
          <div className="restaurant-summary-header">
            <p className="eyebrow" style={{ margin: 0 }}>Order From</p>
            <h3 className="restaurant-summary-name">{restaurantName}</h3>
            <div className="restaurant-summary-meta">
              <span className="summary-eta-badge">
                ⏱ 25-35 MINS
              </span>
              <span>•</span>
              <span>Safety Assured</span>
            </div>
          </div>

          {/* Cart Item Cards with Quantities */}
          <div className="summary-items-list">
            {items.map((lineItem) => {
              const itemPrice = getItemPrice(lineItem);
              const isVeg = lineItem.item.vegetarian !== false && lineItem.item.isVeg !== false;

              return (
                <div className="summary-item-row" key={lineItem.key}>
                  <div className="summary-item-diet">
                    {isVeg ? <VegIcon /> : <NonVegIcon />}
                  </div>
                  <h4 className="summary-item-name" title={lineItem.item.name}>
                    {lineItem.item.name}
                  </h4>
                  <div className="checkout-item-stepper">
                    <button 
                      type="button" 
                      onClick={() => onQuantityChange(lineItem.key, lineItem.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="stepper-value">{lineItem.quantity}</span>
                    <button 
                      type="button" 
                      onClick={() => onQuantityChange(lineItem.key, lineItem.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="summary-item-total">
                    {formatPrice(itemPrice * lineItem.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Coupon Entry Card */}
          <div className="checkout-coupon-panel">
            <h4 className="coupon-panel-title">Apply Coupon</h4>
            <div className="coupon-input-wrapper">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(event) => onCouponCodeChange(event.target.value.toUpperCase())}
              />
              <button
                type="button"
                className="coupon-apply-btn"
                onClick={() => {
                  setFeedback(couponCode.trim() ? "Coupon code will be validated when order is placed." : "Enter a code first.");
                  setFeedbackTone(couponCode.trim() ? "success" : "error");
                }}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Detailed Bill Breakdown */}
          <div className="checkout-bill-card">
            <div className="bill-line-row">
              <span>Item Total</span>
              <span className="bill-value">{formatPrice(total)}</span>
            </div>
            <div className="bill-line-row free-tier">
              <span>Delivery Fee</span>
              <span className="bill-value">FREE</span>
            </div>
            <div className="bill-line-row">
              <span>Platform Fee</span>
              <span className="bill-value">{formatPrice(platformFee)}</span>
            </div>
            <div className="bill-line-row">
              <span>GST and Restaurant Charges</span>
              <span className="bill-value">{formatPrice(gstCharges)}</span>
            </div>
            
            {savings > 0 && (
              <div className="bill-line-row" style={{ color: '#0f8a4f', fontWeight: '700' }}>
                <span>Item Discount Savings</span>
                <span>-{formatPrice(savings)}</span>
              </div>
            )}

            <div className="bill-line-row grand-total">
              <span>TO PAY</span>
              <span className="bill-value">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {/* Status feedback message */}
          {feedback && (
            <div className={`checkout-notice-banner ${feedbackTone === "error" ? "error" : "success"}`}>
              {feedback}
            </div>
          )}

          {/* Place Order CTA Button */}
          <button
            type="submit"
            className="checkout-submit-action"
            disabled={!canPlaceOrder}
          >
            {submitting ? "Placing Order..." : checkoutButtonLabel}
          </button>
        </div>

      </form>
    </div>
  );
}

export default CheckoutPage;

