import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createAddress, deleteAddress, fetchAddresses, setDefaultAddress } from "../api/client.js";

const initialAddressForm = {
  addressLine: "",
  city: "",
  defaultAddress: true,
  label: "Home",
  landmark: "",
  phoneNumber: "",
  pincode: "",
  recipientName: "",
  state: ""
};

function formatAddress(address) {
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

function AddressesPage({ onStatusChange, session }) {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(initialAddressForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState("neutral");

  const user = session.user;
  const canUseAddresses = Boolean(user?.id && session.token);

  useEffect(() => {
    if (!canUseAddresses) {
      onStatusChange("Login to manage delivery addresses");
      setAddresses([]);
      return;
    }

    onStatusChange("Loading React address book");
    loadAddresses();
  }, [canUseAddresses, onStatusChange, session.token, user?.id]);

  async function loadAddresses() {
    setLoading(true);

    try {
      const addressData = await fetchAddresses(user.id, session.token);
      setAddresses(Array.isArray(addressData) ? addressData : []);
      onStatusChange("React address book ready");
    } catch (error) {
      setFeedback(error.message || "Could not load addresses.");
      setFeedbackTone("error");
      onStatusChange("Could not load addresses");
    } finally {
      setLoading(false);
    }
  }

  function updateForm(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canUseAddresses) {
      setFeedback("Login before saving an address.");
      setFeedbackTone("error");
      return;
    }

    setSaving(true);
    setFeedback("Saving address...");
    setFeedbackTone("neutral");

    try {
      await createAddress(
        {
          ...form,
          defaultAddress: Boolean(form.defaultAddress)
        },
        user.id,
        session.token
      );
      setFeedback("Address saved.");
      setFeedbackTone("success");
      setForm({
        ...initialAddressForm,
        recipientName: user.name || "",
        phoneNumber: user.phoneNumber || ""
      });
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
      await loadAddresses();
    } catch (error) {
      setFeedback(error.message || "Could not delete address.");
      setFeedbackTone("error");
    }
  }

  if (!canUseAddresses) {
    return (
      <section className="addresses-page">
        <div className="checkout-empty">
          <p>Login to save delivery addresses for React checkout.</p>
          <Link className="primary-action" to="/account">Login or sign up</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="addresses-page">
      <div className="section-heading">
        <p className="eyebrow">React address book</p>
        <h1>Manage delivery addresses.</h1>
      </div>

      <div className="addresses-layout">
        <section className="address-list">
          {loading ? <p className="empty-state">Loading addresses...</p> : null}
          {!loading && !addresses.length ? (
            <p className="empty-state">No saved addresses yet.</p>
          ) : null}

          {addresses.map((address) => (
            <article className="address-card" key={address.id}>
              <div>
                <p className="eyebrow">{address.defaultAddress ? "Default" : "Saved address"}</p>
                <h3>{address.label}</h3>
                <p>{formatAddress(address)}</p>
                <strong>{address.recipientName} - {address.phoneNumber}</strong>
              </div>

              <div className="address-card-actions">
                {!address.defaultAddress ? (
                  <button className="secondary-action" onClick={() => handleSetDefault(address.id)} type="button">
                    Make default
                  </button>
                ) : null}
                <button className="secondary-action" onClick={() => handleDelete(address.id)} type="button">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>

        <form className="account-card address-form" onSubmit={handleSubmit}>
          <h2>Add address</h2>

          <div className="address-form-grid">
            <label>
              Label
              <input
                onChange={(event) => updateForm("label", event.target.value)}
                required
                type="text"
                value={form.label}
              />
            </label>
            <label>
              Recipient
              <input
                onChange={(event) => updateForm("recipientName", event.target.value)}
                required
                type="text"
                value={form.recipientName}
              />
            </label>
            <label>
              Phone
              <input
                onChange={(event) => updateForm("phoneNumber", event.target.value)}
                required
                type="tel"
                value={form.phoneNumber}
              />
            </label>
            <label>
              Pincode
              <input
                onChange={(event) => updateForm("pincode", event.target.value)}
                required
                type="text"
                value={form.pincode}
              />
            </label>
          </div>

          <label>
            Address line
            <textarea
              onChange={(event) => updateForm("addressLine", event.target.value)}
              required
              rows="3"
              value={form.addressLine}
            />
          </label>

          <label>
            Landmark
            <input
              onChange={(event) => updateForm("landmark", event.target.value)}
              type="text"
              value={form.landmark}
            />
          </label>

          <div className="address-form-grid">
            <label>
              City
              <input
                onChange={(event) => updateForm("city", event.target.value)}
                required
                type="text"
                value={form.city}
              />
            </label>
            <label>
              State
              <input
                onChange={(event) => updateForm("state", event.target.value)}
                required
                type="text"
                value={form.state}
              />
            </label>
          </div>

          <label className="checkbox-label">
            <input
              checked={form.defaultAddress}
              onChange={(event) => updateForm("defaultAddress", event.target.checked)}
              type="checkbox"
            />
            Set as default delivery address
          </label>

          {feedback ? <p className={`auth-feedback ${feedbackTone}`}>{feedback}</p> : null}

          <button className="primary-action" disabled={saving} type="submit">
            {saving ? "Saving..." : "Save address"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AddressesPage;
