import { useEffect, useState } from "react";
import { cancelMyOrder, fetchMyOrders } from "../api/client.js";

const orderStages = ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toFixed(2)}`;
}

function formatStatus(status) {
  return String(status || "PENDING")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClassName(status) {
  return `status-${String(status || "PENDING").toLowerCase()}`;
}

function formatDateTime(value) {
  if (!value) {
    return "Order time unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function formatTime(value) {
  if (!value) {
    return "TBD";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function getStageIndex(status) {
  const normalizedStatus = String(status || "PENDING").toUpperCase();

  return orderStages.indexOf(normalizedStatus === "PENDING" ? "CONFIRMED" : normalizedStatus);
}

function getTrackingDetails(order) {
  const status = String(order.status || "PENDING").toUpperCase();

  if (status === "PREPARING") {
    return { copy: "The restaurant is preparing your order.", headline: "Your food is being prepared", sideCopy: "We will notify you when it leaves the kitchen." };
  }

  if (status === "OUT_FOR_DELIVERY") {
    return { copy: "Your delivery partner is on the way.", headline: "Your order is out for delivery", sideCopy: "Keep your phone reachable for delivery updates." };
  }

  if (status === "DELIVERED") {
    return { copy: "This order was delivered successfully.", headline: "Order delivered", sideCopy: "Thanks for ordering with SnapEats." };
  }

  if (status === "CANCELLED") {
    return { copy: "This order has been cancelled.", headline: "Order cancelled", sideCopy: "Any eligible refund will be processed automatically." };
  }

  return { copy: "The restaurant has received your order.", headline: "Order confirmed", sideCopy: "We will update you as preparation starts." };
}

function OrderProgress({ status }) {
  if (String(status || "").toUpperCase() === "CANCELLED") {
    return <div className="order-cancelled-line">This order was cancelled.</div>;
  }

  const activeIndex = getStageIndex(status);

  return <div className="order-progress">{orderStages.map((stage, index) => <div className={`order-progress-step ${index <= activeIndex ? "active" : ""}`} key={stage}><span className="order-progress-dot"></span><span>{formatStatus(stage)}</span></div>)}</div>;
}

function OrderMilestones({ order }) {
  const activeIndex = getStageIndex(order.status);
  const cancelled = String(order.status || "").toUpperCase() === "CANCELLED";
  const labels = ["Confirmed", "Preparing", "On the way", "Delivered"];
  const times = [
    formatTime(order.createdAt),
    activeIndex >= 1 ? "In progress" : "Pending",
    activeIndex >= 2 ? "In progress" : "Pending",
    order.actualDeliveryTime ? formatTime(order.actualDeliveryTime) : activeIndex >= 3 ? "Delivered" : "Pending"
  ];

  return <div className="order-milestone-row">{labels.map((label, index) => <div className={`order-milestone ${!cancelled && index <= activeIndex ? "active" : ""}`} key={label}><span>{label}</span><strong>{cancelled ? "Cancelled" : times[index]}</strong></div>)}</div>;
}

function OrdersModal({ onClose, onOpenCart, onReorder, onStatusChange, open, session }) {
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState("neutral");
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("idle");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const user = session.user;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    document.body.classList.add("modal-open");
    loadOrders();

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [open, session.token, user?.id]);

  async function loadOrders() {
    if (!user?.id || !session.token) {
      setOrders([]);
      setStatus("ready");
      return;
    }

    setStatus("loading");
    setFeedback("");

    try {
      const orderData = await fetchMyOrders(user.id, session.token);
      setOrders(Array.isArray(orderData) ? orderData : []);
      setStatus("ready");
    } catch (error) {
      const message = error.message || "Could not load your orders.";
      setFeedback(message);
      setFeedbackTone("error");
      setStatus("error");
      onStatusChange(message);
    }
  }

  async function handleCancel(order) {
    if (!window.confirm(`Cancel order ${order.orderNumber}?`)) {
      return;
    }

    setUpdatingOrderId(order.id);
    setFeedback("");

    try {
      await cancelMyOrder(order.id, user.id, session.token);
      setFeedback("Order cancelled successfully.");
      setFeedbackTone("success");
      onStatusChange("Order cancelled");
      await loadOrders();
    } catch (error) {
      const message = error.message || "Could not cancel this order.";
      setFeedback(message);
      setFeedbackTone("error");
      onStatusChange(message);
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function handleReorder(order) {
    setUpdatingOrderId(order.id);
    setFeedback("");

    try {
      const result = await onReorder(order);

      if (result?.cancelled) {
        return;
      }

      setFeedback("Previous order added to your cart.");
      setFeedbackTone("success");
      onOpenCart();
    } catch (error) {
      const message = error.message || "Could not add this order to the cart.";
      setFeedback(message);
      setFeedbackTone("error");
      onStatusChange(message);
    } finally {
      setUpdatingOrderId(null);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="modal open" id="ordersModal" role="dialog" aria-modal="true" aria-label="Your orders">
      <div className="modal-content orders-modal-content">
        <button className="close-btn" onClick={onClose} type="button" aria-label="Close orders">&times;</button>
        {status === "loading" ? <div className="modal-loading">Loading your orders...</div> : null}
        {status !== "loading" ? <div className="orders-shell">
          <div className="orders-header"><div><p className="menu-eyebrow">My orders</p><h2>Track every order in one place</h2></div><button className="secondary-button" disabled={updatingOrderId !== null} onClick={loadOrders} type="button">Refresh</button></div>
          {feedback ? <p className={`checkout-feedback ${feedbackTone === "error" ? "error" : feedbackTone === "success" ? "success" : ""}`}>{feedback}</p> : null}
          {!orders.length ? <div className="orders-empty"><h2>No orders yet</h2><p>Your recent orders will appear here with tracking and reorder options.</p></div> : null}
          {orders.length ? <div className="orders-list">{orders.map((order) => {
            const tracking = getTrackingDetails(order);
            const statusClass = statusClassName(order.status);

            return <article className="order-card" key={order.id}>
              <div className="order-card-top"><div className="order-restaurant">{order.restaurantImage ? <img alt={order.restaurantName || "Restaurant"} className="order-restaurant-image" src={order.restaurantImage} /> : null}<div><h3>{order.restaurantName || "Restaurant"}</h3><p>{order.orderNumber || "Order"} - {formatDateTime(order.createdAt)}</p></div></div><span className={`order-status-badge ${statusClass}`}>{formatStatus(order.status)}</span></div>
              <div className={`order-tracking-hero ${statusClass}`}><div><p className="order-tracking-kicker">Live tracking</p><h4>{tracking.headline}</h4><p>{tracking.copy}</p></div><div className="order-tracking-side"><span className="order-tracking-eta">{order.estimatedDeliveryTime ? `ETA ${formatTime(order.estimatedDeliveryTime)}` : "ETA TBD"}</span><small>{tracking.sideCopy}</small></div></div>
              <OrderProgress status={order.status} />
              <div className="order-meta-grid"><div><span>Items</span><strong>{order.itemCount || order.items?.length || 0}</strong></div><div><span>Total</span><strong>{formatCurrency(order.finalAmount)}</strong></div><div><span>Payment</span><strong>{formatStatus(order.paymentMethod)}</strong></div><div><span>Delivery</span><strong>{order.estimatedDeliveryTime ? formatTime(order.estimatedDeliveryTime) : "TBD"}</strong></div></div>
              <OrderMilestones order={order} />
              <div className="order-items-preview">{(order.items || []).map((item, index) => <div className="order-line-item" key={item.id || `${item.itemName}-${index}`}><span>{item.quantity || 1}x {item.itemName || item.name || "Menu item"}</span><strong>{formatCurrency(item.totalPrice || (Number(item.price || 0) * Number(item.quantity || 1)))}</strong></div>)}</div>
              <div className="order-address-block"><p className="order-block-label">Delivering to</p><p>{order.deliveryAddress || "Address unavailable"}</p>{order.contactNumber ? <p>{order.contactNumber}</p> : null}{order.specialInstructions ? <p className="order-note">Note: {order.specialInstructions}</p> : null}</div>
              <div className="order-card-actions">{order.canReorder ? <button className="primary-button" disabled={updatingOrderId === order.id} onClick={() => handleReorder(order)} type="button">{updatingOrderId === order.id ? "Adding..." : "Reorder"}</button> : null}{order.canCancel ? <button className="secondary-button" disabled={updatingOrderId === order.id} onClick={() => handleCancel(order)} type="button">{updatingOrderId === order.id ? "Cancelling..." : "Cancel order"}</button> : null}</div>
            </article>;
          })}</div> : null}
        </div> : null}
      </div>
    </div>
  );
}

export default OrdersModal;
