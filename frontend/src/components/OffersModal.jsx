import { useEffect, useState } from "react";
import { fetchRestaurants } from "../api/client.js";

const platformCoupons = [
  {
    code: "WELCOME50",
    description: "New users only - valid on orders above Rs 199.",
    discountType: "FLAT",
    discountValue: 50,
    maxDiscount: 50,
    minOrder: 199,
    title: "Flat Rs 50 off"
  },
  {
    code: "SNAP20",
    description: "Applies on orders above Rs 299.",
    discountType: "PERCENT",
    discountValue: 20,
    maxDiscount: 120,
    minOrder: 299,
    title: "20% off up to Rs 120"
  },
  {
    code: "MEAL30",
    description: "Quick savings on orders above Rs 149.",
    discountType: "FLAT",
    discountValue: 30,
    maxDiscount: 30,
    minOrder: 149,
    title: "Flat Rs 30 off"
  }
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value || 0);
}

function formatDiscount(coupon) {
  return coupon.discountType === "PERCENT"
    ? `${coupon.discountValue}% off`
    : `${formatCurrency(coupon.discountValue)} off`;
}

function OffersModal({ appliedCouponCode, onApplyCoupon, onClose, onOpenCart, open }) {
  const [activeTab, setActiveTab] = useState("coupons");
  const [feedback, setFeedback] = useState(null);
  const [restaurantOffers, setRestaurantOffers] = useState([]);
  const [restaurantStatus, setRestaurantStatus] = useState("idle");

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    document.body.classList.add("modal-open");

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [open]);

  useEffect(() => {
    let ignore = false;

    async function loadRestaurantOffers() {
      if (!open || activeTab !== "restaurants") {
        return;
      }

      setRestaurantStatus("loading");

      try {
        const restaurants = await fetchRestaurants();

        if (!ignore) {
          setRestaurantOffers(restaurants.filter((restaurant) => restaurant.discount).slice(0, 6));
          setRestaurantStatus("ready");
        }
      } catch (error) {
        if (!ignore) {
          setRestaurantStatus(error.message || "Could not load restaurant offers.");
        }
      }
    }

    loadRestaurantOffers();

    return () => {
      ignore = true;
    };
  }, [activeTab, open]);

  if (!open) {
    return null;
  }

  function handleCouponApply(coupon) {
    setFeedback(onApplyCoupon(coupon));
  }

  const isCouponTab = activeTab === "coupons";

  return (
    <div className="modal open react-offers-modal" id="offersModal" role="dialog" aria-modal="true" aria-label="Coupons and restaurant deals">
      <div className="modal-content offers-modal-content">
        <button className="close-btn" onClick={onClose} type="button" aria-label="Close offers">
          &times;
        </button>

        <div className="help-shell offers-help-shell">
          <header className="help-hero">
            <h1>Coupons and restaurant deals</h1>
            <p className="help-hero-sub">Save more on every order with platform coupons and partner offers.</p>
          </header>

          <section className="help-panel-shell offers-panel-shell">
            <aside className="help-nav">
              <h2>Browse offers</h2>
              <button
                className={`help-nav-item ${isCouponTab ? "active" : ""}`}
                onClick={() => setActiveTab("coupons")}
                type="button"
              >
                <span>Coupon codes</span>
                <small>Cart savings</small>
              </button>
              <button
                className={`help-nav-item ${activeTab === "restaurants" ? "active" : ""}`}
                onClick={() => setActiveTab("restaurants")}
                type="button"
              >
                <span>Restaurant offers</span>
                <small>Auto-applied</small>
              </button>
            </aside>

            <div className="help-panel">
              <div className="help-panel-head">
                <div>
                  <p className="help-topic-meta">{isCouponTab ? "Cart savings" : "Auto-applied"}</p>
                  <h3>{isCouponTab ? "Coupon codes" : "Restaurant offers"}</h3>
                  <p className="help-topic-copy">
                    {isCouponTab ? "Use these codes in cart for extra savings." : "Live deals from active restaurants near you."}
                  </p>
                </div>
                <div className="help-panel-actions">
                  <button className="secondary-button" onClick={onOpenCart} type="button">Open cart</button>
                </div>
              </div>

              {feedback ? <div className={`checkout-feedback ${feedback.type}`}>{feedback.message}</div> : null}

              {isCouponTab ? (
                <div className="offers-grid">
                  {platformCoupons.map((coupon) => {
                    const isApplied = appliedCouponCode === coupon.code;

                    return (
                      <article className={`offer-card ${isApplied ? "applied" : ""}`} key={coupon.code}>
                        <div className="offer-card-head">
                          <div>
                            <span className="offer-code">{coupon.code}</span>
                            <h3>{coupon.title}</h3>
                          </div>
                          {isApplied ? <span className="offer-applied-pill">Applied</span> : null}
                        </div>
                        <p>{coupon.description}</p>
                        <div className="offer-meta-row">
                          <span>Min order {formatCurrency(coupon.minOrder)}</span>
                          <span>{formatDiscount(coupon)}</span>
                        </div>
                        <button
                          className={isApplied ? "secondary-button" : "primary-button"}
                          disabled={isApplied}
                          onClick={() => handleCouponApply(coupon)}
                          type="button"
                        >
                          {isApplied ? "Already applied" : "Apply coupon"}
                        </button>
                      </article>
                    );
                  })}
                </div>
              ) : null}

              {!isCouponTab && restaurantStatus === "loading" ? <p className="modal-loading">Loading restaurant offers...</p> : null}
              {!isCouponTab && restaurantStatus !== "loading" && restaurantStatus !== "ready" && restaurantStatus !== "idle" ? (
                <p className="modal-error">{restaurantStatus}</p>
              ) : null}
              {!isCouponTab && restaurantStatus === "ready" && !restaurantOffers.length ? (
                <div className="account-placeholder-card compact"><p>No restaurant offers available right now.</p></div>
              ) : null}
              {!isCouponTab && restaurantOffers.length ? (
                <div className="restaurant-offers-grid">
                  {restaurantOffers.map((restaurant) => (
                    <article className="restaurant-offer-card" key={restaurant.restaurantId || restaurant.id || restaurant.name}>
                      <div className="restaurant-offer-top">
                        <strong>{restaurant.name}</strong>
                        <span className="restaurant-offer-discount">{restaurant.discount}</span>
                      </div>
                      <p>{restaurant.cuisine || "Multiple cuisines"} - {restaurant.time || "Fast delivery"}</p>
                      <small>Auto-applied on menu items. No coupon code needed.</small>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default OffersModal;
