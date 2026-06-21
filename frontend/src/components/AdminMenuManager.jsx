import { useEffect, useState } from "react";
import {
  createAdminMenuItem,
  deleteAdminMenuItem,
  fetchAdminMenuItems,
  fetchAdminRestaurants,
  updateAdminMenuItem
} from "../api/client.js";

function createMenuForm(item = null) {
  return {
    available: item ? Boolean(item.available) : true,
    category: item?.category || "",
    description: item?.description || "",
    image: item?.image || "",
    name: item?.name || "",
    price: item?.price ?? "",
    vegetarian: Boolean(item?.vegetarian)
  };
}

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value || 0);
}

function AdminMenuManager({ onStatusChange, refreshVersion, session }) {
  const [editingMenuItemId, setEditingMenuItemId] = useState(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState("neutral");
  const [form, setForm] = useState(createMenuForm);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const user = session.user;
  const selectedRestaurant = restaurants.find((restaurant) => String(restaurant.id) === String(selectedRestaurantId)) || null;

  useEffect(() => {
    loadRestaurants();
  }, [refreshVersion, session.token, user?.id]);

  async function loadRestaurants() {
    setLoading(true);
    setError("");

    try {
      const restaurantPayload = await fetchAdminRestaurants(user.id, session.token);
      const nextRestaurants = Array.isArray(restaurantPayload) ? restaurantPayload : [];
      const nextRestaurantId = nextRestaurants.some((restaurant) => String(restaurant.id) === String(selectedRestaurantId))
        ? String(selectedRestaurantId)
        : String(nextRestaurants[0]?.id || "");

      setRestaurants(nextRestaurants);
      setSelectedRestaurantId(nextRestaurantId);
      setEditingMenuItemId(null);
      setForm(createMenuForm());

      if (nextRestaurantId) {
        await loadMenuItems(nextRestaurantId);
      } else {
        setMenuItems([]);
      }
    } catch (loadError) {
      const message = loadError.message || "Could not load admin restaurant data.";
      setError(message);
      setMenuItems([]);
      onStatusChange(message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMenuItems(restaurantId) {
    if (!restaurantId) {
      setMenuItems([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const items = await fetchAdminMenuItems(restaurantId, user.id, session.token);
      setMenuItems(items);
    } catch (loadError) {
      const message = loadError.message || "Could not load menu items.";
      setError(message);
      setMenuItems([]);
      onStatusChange(message);
    } finally {
      setLoading(false);
    }
  }

  function updateForm(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function handleRestaurantChange(event) {
    const restaurantId = event.target.value;
    setSelectedRestaurantId(restaurantId);
    setEditingMenuItemId(null);
    setForm(createMenuForm());
    setFeedback("");
    loadMenuItems(restaurantId);
  }

  function startEdit(item) {
    setEditingMenuItemId(item.id);
    setForm(createMenuForm(item));
    setFeedback("");
  }

  function resetForm() {
    setEditingMenuItemId(null);
    setForm(createMenuForm());
    setFeedback("");
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!selectedRestaurantId || !form.name.trim() || Number(form.price) <= 0) {
      setFeedback("Restaurant, item name, and price are required.");
      setFeedbackTone("error");
      return;
    }

    const payload = {
      active: true,
      available: Boolean(form.available),
      category: form.category.trim() || "main course",
      description: form.description.trim(),
      image: form.image.trim(),
      name: form.name.trim(),
      price: Number(form.price),
      restaurantId: Number(selectedRestaurantId),
      vegetarian: Boolean(form.vegetarian)
    };

    setLoading(true);
    setFeedback(editingMenuItemId ? "Updating menu item..." : "Creating menu item...");
    setFeedbackTone("neutral");

    try {
      if (editingMenuItemId) {
        await updateAdminMenuItem(editingMenuItemId, payload, user.id, session.token);
      } else {
        await createAdminMenuItem(payload, user.id, session.token);
      }

      setEditingMenuItemId(null);
      setForm(createMenuForm());
      setFeedback("Menu item saved successfully.");
      setFeedbackTone("success");
      await loadMenuItems(selectedRestaurantId);
    } catch (saveError) {
      const message = saveError.message || "Could not save menu item.";
      setFeedback(message);
      setFeedbackTone("error");
      onStatusChange(message);
      setLoading(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete ${item.name}?`)) {
      return;
    }

    setLoading(true);
    setFeedback("");

    try {
      await deleteAdminMenuItem(item.id, user.id, session.token);
      setMenuItems((currentItems) => currentItems.filter((entry) => entry.id !== item.id));
      setFeedback("Menu item deleted.");
      setFeedbackTone("success");

      if (editingMenuItemId === item.id) {
        setEditingMenuItemId(null);
        setForm(createMenuForm());
      }
    } catch (deleteError) {
      const message = deleteError.message || "Could not delete menu item.";
      setFeedback(message);
      setFeedbackTone("error");
      onStatusChange(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {error ? <div className="checkout-feedback error">{error}</div> : null}
      <div className="admin-menu-layout">
        <section className="admin-menu-list-panel">
          <label className="account-form-field account-form-field-full"><span>Restaurant</span><select disabled={loading || !restaurants.length} onChange={handleRestaurantChange} value={selectedRestaurantId}>{restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name} ({restaurant.locality || restaurant.city || "N/A"})</option>)}</select></label>
          {loading ? <div className="account-placeholder-card compact"><p>Loading menu items...</p></div> : <div className="admin-menu-item-list">{menuItems.length ? menuItems.map((item) => <article className="admin-menu-item-card" key={item.id}><div><strong>{item.name}</strong><p>{item.category || "General"} - {formatPrice(item.price)}</p></div><div className="admin-menu-actions"><button className="secondary-button" onClick={() => startEdit(item)} type="button">Edit</button><button className="text-button danger-button" onClick={() => handleDelete(item)} type="button">Delete</button></div></article>) : <div className="account-placeholder-card compact"><p>No menu items found for this restaurant.</p></div>}</div>}
        </section>

        <section className="admin-menu-form-panel">
          <div className="payment-form-header"><strong>{editingMenuItemId ? "Edit menu item" : "Add menu item"}</strong><p>{selectedRestaurant ? `Managing ${selectedRestaurant.name}` : "Select a restaurant to start."}</p></div>
          <form className="account-settings-form" onSubmit={handleSave}>
            <label className="account-form-field account-form-field-full"><span>Name</span><input disabled={loading || !selectedRestaurantId} onChange={(event) => updateForm("name", event.target.value)} required type="text" value={form.name} /></label>
            <div className="account-stat-grid"><label className="account-form-field"><span>Category</span><input disabled={loading || !selectedRestaurantId} onChange={(event) => updateForm("category", event.target.value)} placeholder="main course" required type="text" value={form.category} /></label><label className="account-form-field"><span>Price</span><input disabled={loading || !selectedRestaurantId} min="1" onChange={(event) => updateForm("price", event.target.value)} required step="0.01" type="number" value={form.price} /></label></div>
            <label className="account-form-field account-form-field-full"><span>Description</span><textarea disabled={loading || !selectedRestaurantId} onChange={(event) => updateForm("description", event.target.value)} placeholder="Menu item description" rows="3" value={form.description} /></label>
            <label className="account-form-field account-form-field-full"><span>Image URL</span><input disabled={loading || !selectedRestaurantId} onChange={(event) => updateForm("image", event.target.value)} placeholder="https://..." type="url" value={form.image} /></label>
            <div className="account-stat-grid"><label className="address-default-toggle"><input checked={form.vegetarian} disabled={loading || !selectedRestaurantId} onChange={(event) => updateForm("vegetarian", event.target.checked)} type="checkbox" /><span>Vegetarian</span></label><label className="address-default-toggle"><input checked={form.available} disabled={loading || !selectedRestaurantId} onChange={(event) => updateForm("available", event.target.checked)} type="checkbox" /><span>Available</span></label></div>
            <div className="auth-actions"><button className="primary-button" disabled={loading || !selectedRestaurantId} type="submit">{loading ? "Saving..." : editingMenuItemId ? "Update item" : "Create item"}</button>{editingMenuItemId ? <button className="secondary-button" disabled={loading} onClick={resetForm} type="button">Cancel edit</button> : null}</div>
            {feedback ? <div className={`checkout-feedback ${feedbackTone === "error" ? "error" : feedbackTone === "success" ? "success" : ""}`}>{feedback}</div> : null}
          </form>
        </section>
      </div>
    </>
  );
}

export default AdminMenuManager;
