import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createAddress, deleteAddress, fetchAddresses, setDefaultAddress, updateAddress } from "../api/client.js";

function createAddressForm(user) {
  return {
    addressLine: "",
    city: "",
    defaultAddress: true,
    label: "Home",
    landmark: "",
    latitude: null,
    longitude: null,
    phoneNumber: user?.phoneNumber || "",
    pincode: "",
    recipientName: user?.name || "",
    state: ""
  };
}

function formatAddress(address) {
  return [address.addressLine, address.landmark, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(", ");
}

function getAddressArea(address) {
  return [address.landmark, address.city, address.state].filter(Boolean).join(", ");
}

function AddressesPage({ onStatusChange, session }) {
  const user = session.user;
  const canUseAddresses = Boolean(user?.id && session.token);
  const [addresses, setAddresses] = useState([]);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState("neutral");
  const [form, setForm] = useState(() => createAddressForm(user));
  const [loading, setLoading] = useState(false);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [mapPreview, setMapPreview] = useState("");
  const [mapStatus, setMapStatus] = useState({ message: "Step 1: Search and pick an area. Step 2: Confirm and proceed.", tone: "" });
  const [saving, setSaving] = useState(false);
  const [selectedArea, setSelectedArea] = useState("");

  useEffect(() => {
    if (!canUseAddresses) {
      onStatusChange("Login to manage delivery addresses");
      setAddresses([]);
      return;
    }

    loadAddresses();
  }, [canUseAddresses, onStatusChange, session.token, user?.id]);

  async function loadAddresses() {
    setLoading(true);

    try {
      const addressData = await fetchAddresses(user.id, session.token);
      setAddresses(Array.isArray(addressData) ? addressData : []);
      onStatusChange("Address book ready");
    } catch (error) {
      setFeedback(error.message || "Could not load addresses.");
      setFeedbackTone("error");
      onStatusChange("Could not load addresses");
    } finally {
      setLoading(false);
    }
  }

  function updateForm(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function resetForm() {
    setEditingAddressId(null);
    setForm(createAddressForm(user));
    setLocationConfirmed(false);
    setLocationQuery("");
    setMapPreview("");
    setSelectedArea("");
    setMapStatus({ message: "Step 1: Search and pick an area. Step 2: Confirm and proceed.", tone: "" });
  }

  function startEdit(address) {
    const area = getAddressArea(address);

    setEditingAddressId(address.id);
    setForm({
      addressLine: address.addressLine || "",
      city: address.city || "",
      defaultAddress: Boolean(address.defaultAddress),
      label: address.label || "Home",
      landmark: address.landmark || "",
      latitude: address.latitude ?? null,
      longitude: address.longitude ?? null,
      phoneNumber: address.phoneNumber || "",
      pincode: address.pincode || "",
      recipientName: address.recipientName || "",
      state: address.state || ""
    });
    setLocationConfirmed(true);
    setLocationQuery(area);
    setMapPreview(area || formatAddress(address));
    setSelectedArea(area || "Saved address location");
    setMapStatus({ message: "Location loaded. You can change the area before updating this address.", tone: "success" });
    setFeedback("");
  }

  function handleMapSearch() {
    const query = locationQuery.trim();

    if (!query) {
      setMapStatus({ message: "Enter an area, building, or street name first.", tone: "error" });
      return;
    }

    setSelectedArea(query);
    setMapPreview(query);
    setLocationConfirmed(false);
    setMapStatus({ message: "Area selected. Confirm and proceed to enter full address details.", tone: "success" });
  }

  function confirmLocation() {
    if (!selectedArea) {
      setMapStatus({ message: "Search and select an area before continuing.", tone: "error" });
      return;
    }

    setLocationConfirmed(true);
    setForm((currentForm) => ({
      ...currentForm,
      landmark: currentForm.landmark || selectedArea
    }));
    setMapStatus({ message: "Location confirmed. Fill complete address details below.", tone: "success" });
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMapStatus({ message: "Geolocation is not supported in this browser.", tone: "error" });
      return;
    }

    setMapStatus({ message: "Detecting your current location...", tone: "loading" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const locationLabel = `GPS location (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`;

        setForm((currentForm) => ({
          ...currentForm,
          latitude: coords.latitude,
          longitude: coords.longitude,
          landmark: currentForm.landmark || locationLabel
        }));
        setLocationQuery(locationLabel);
        setMapPreview(`${coords.latitude},${coords.longitude}`);
        setSelectedArea(locationLabel);
        setLocationConfirmed(true);
        setMapStatus({ message: "Current location confirmed. Fill complete address details below.", tone: "success" });
      },
      () => setMapStatus({ message: "Unable to fetch your current location. Search an area instead.", tone: "error" }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canUseAddresses) {
      setFeedback("Login before saving an address.");
      setFeedbackTone("error");
      return;
    }

    if (!locationConfirmed) {
      setFeedback("Confirm delivery location on the map first.");
      setFeedbackTone("error");
      setMapStatus({ message: "Confirm the selected area before saving this address.", tone: "error" });
      return;
    }

    setSaving(true);
    setFeedback(editingAddressId ? "Updating address..." : "Saving address...");
    setFeedbackTone("neutral");

    try {
      const payload = { ...form, defaultAddress: Boolean(form.defaultAddress) };

      if (editingAddressId) {
        await updateAddress(editingAddressId, payload, user.id, session.token);
      } else {
        await createAddress(payload, user.id, session.token);
      }

      setFeedback(editingAddressId ? "Address updated successfully." : "Address saved successfully.");
      setFeedbackTone("success");
      resetForm();
      await loadAddresses();
    } catch (error) {
      setFeedback(error.message || "Could not save address.");
      setFeedbackTone("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleSetDefault(addressId) {
    setFeedback("Updating default address...");
    setFeedbackTone("neutral");

    try {
      await setDefaultAddress(addressId, user.id, session.token);
      setFeedback("Default address updated.");
      setFeedbackTone("success");
      await loadAddresses();
    } catch (error) {
      setFeedback(error.message || "Could not update default address.");
      setFeedbackTone("error");
    }
  }

  async function handleDelete(addressId) {
    setFeedback("Deleting address...");
    setFeedbackTone("neutral");

    try {
      await deleteAddress(addressId, user.id, session.token);
      setFeedback("Address deleted.");
      setFeedbackTone("success");
      if (editingAddressId === addressId) {
        resetForm();
      }
      await loadAddresses();
    } catch (error) {
      setFeedback(error.message || "Could not delete address.");
      setFeedbackTone("error");
    }
  }

  if (!canUseAddresses) {
    return (
      <section className="address-book-shell">
        <div className="address-book-header"><p className="menu-eyebrow">Address book</p><h2>Choose where SnapEats delivers</h2><p className="address-book-subtitle">Save multiple addresses and mark one as your default for quick checkout.</p></div>
        <div className="account-placeholder-card"><strong>Login to manage delivery addresses</strong><p>Sign in to save and choose addresses for checkout.</p><Link className="primary-button" to="/account">Login or sign up</Link></div>
      </section>
    );
  }

  const editingAddress = addresses.find((address) => String(address.id) === String(editingAddressId));

  return (
    <section className="address-book-shell">
      <div className="address-book-header"><div><p className="menu-eyebrow">Address book</p><h2>Choose where SnapEats delivers</h2><p className="address-book-subtitle">Save multiple addresses and mark one as your default for quick checkout.</p></div></div>

      <div className="address-book-layout">
        <section className="address-list-panel">
          {loading ? <p className="address-empty-note">Loading addresses...</p> : null}
          {!loading && !addresses.length ? <div className="address-empty-state"><h3>No saved addresses yet</h3><p>Add your first address here. You can save multiple places and switch the default anytime.</p></div> : null}

          {addresses.map((address) => (
            <article className={`address-card ${address.defaultAddress ? "default" : ""}`} key={address.id}>
              <div className="address-card-head"><div><h3>{address.label}</h3><p>{[address.recipientName, address.phoneNumber].filter(Boolean).join(" - ")}</p></div>{address.defaultAddress ? <span className="address-default-pill">Default</span> : null}</div>
              <p className="address-line">{formatAddress(address)}</p>
              {(address.latitude || address.longitude) ? <p className="address-map-link-row"><a href={`https://www.google.com/maps?q=${address.latitude},${address.longitude}`} target="_blank" rel="noopener noreferrer">View pinned location on map</a></p> : null}
              <div className="address-card-actions">
                {!address.defaultAddress ? <button className="secondary-button" onClick={() => handleSetDefault(address.id)} type="button">Make default</button> : null}
                <button className="text-button" onClick={() => startEdit(address)} type="button">Edit</button>
                {!address.defaultAddress ? <button className="text-button danger-button" onClick={() => handleDelete(address.id)} type="button">Delete</button> : <span className="address-action-note">Default address cannot be deleted.</span>}
              </div>
            </article>
          ))}
        </section>

        <section className="address-form-panel">
          <div className="address-form-head"><h3>{editingAddress ? "Edit saved address" : "Save a new address"}</h3>{editingAddress ? <button className="text-button" onClick={resetForm} type="button">Cancel editing</button> : null}</div>
          <form className="address-form" onSubmit={handleSubmit}>
            <div className="address-map-shell">
              <div className="address-map-head"><p>Pin exact location on map</p><button className="secondary-button" onClick={useCurrentLocation} type="button">Use live location</button></div>
              <div className="address-map-search"><input autoComplete="off" onChange={(event) => setLocationQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); handleMapSearch(); } }} placeholder="Search area, building, or street name" type="text" value={locationQuery} /><button className="secondary-button" onClick={handleMapSearch} type="button">Search on map</button></div>
              <div className="address-map-results">{selectedArea && !locationConfirmed ? <button className="address-map-result" onClick={confirmLocation} type="button"><strong>{selectedArea}</strong><p>Select this area and continue with address details.</p></button> : null}</div>
              <div className={`address-map-canvas ${mapPreview ? "" : "address-map-canvas-hidden"}`} role="application" aria-label="Address map preview">{mapPreview ? <iframe className="react-address-map-frame" title="Address location preview" src={`https://www.google.com/maps?q=${encodeURIComponent(mapPreview)}&output=embed`} /> : null}</div>
              <div className={`address-selected-area-row ${selectedArea ? "visible" : ""}`}><strong>Delivery area</strong><p>{selectedArea || "No delivery area selected yet"}</p><button className="text-button" onClick={() => setLocationConfirmed(false)} type="button">Change</button></div>
              <div className="address-map-actions"><button className="primary-button" onClick={confirmLocation} type="button">Confirm and proceed</button></div>
              <p className={`address-map-status ${mapStatus.tone}`}>{mapStatus.message}</p>
            </div>

            <p className={`address-details-lock-hint ${locationConfirmed ? "ready" : "locked"}`}>{locationConfirmed ? "Location confirmed. Fill complete address details below." : "Confirm map location first, then complete full address details."}</p>
            <div className={`address-details-section ${locationConfirmed ? "visible" : "hidden"}`}>
              <label>Address label<input disabled={!locationConfirmed} onChange={(event) => updateForm("label", event.target.value)} placeholder="Home, Work, Hostel" required type="text" value={form.label} /></label>
              <label>Recipient name<input disabled={!locationConfirmed} onChange={(event) => updateForm("recipientName", event.target.value)} placeholder="Name for delivery" required type="text" value={form.recipientName} /></label>
              <label>Phone number<input disabled={!locationConfirmed} onChange={(event) => updateForm("phoneNumber", event.target.value)} placeholder="10-digit phone" required type="tel" value={form.phoneNumber} /></label>
              <label>Address line<textarea disabled={!locationConfirmed} onChange={(event) => updateForm("addressLine", event.target.value)} placeholder="House number, apartment, street" required rows="3" value={form.addressLine} /></label>
              <label>Area / Locality<input disabled={!locationConfirmed} onChange={(event) => updateForm("landmark", event.target.value)} placeholder="Area or locality" type="text" value={form.landmark} /></label>
              <div className="address-form-row"><label>City<input disabled={!locationConfirmed} onChange={(event) => updateForm("city", event.target.value)} placeholder="City" required type="text" value={form.city} /></label><label>State<input disabled={!locationConfirmed} onChange={(event) => updateForm("state", event.target.value)} placeholder="State" required type="text" value={form.state} /></label></div>
              <div className="address-form-row"><label>Pincode<input disabled={!locationConfirmed} inputMode="numeric" maxLength="6" onChange={(event) => updateForm("pincode", event.target.value)} placeholder="Pincode" required type="text" value={form.pincode} /></label><label className="address-default-toggle"><input checked={form.defaultAddress} disabled={!locationConfirmed} onChange={(event) => updateForm("defaultAddress", event.target.checked)} type="checkbox" /><span>Make this my default delivery address</span></label></div>
            </div>

            <div className="address-lookup-feedback">Search an area, confirm it, and then enter the complete delivery details.</div>
            <button className="primary-button" disabled={saving || !locationConfirmed} type="submit">{saving ? "Saving..." : editingAddress ? "Update address" : "Save address"}</button>
            {feedback ? <div className={`checkout-feedback ${feedbackTone === "error" ? "error" : feedbackTone === "success" ? "success" : ""}`}>{feedback}</div> : null}
          </form>
        </section>
      </div>
    </section>
  );
}

export default AddressesPage;
