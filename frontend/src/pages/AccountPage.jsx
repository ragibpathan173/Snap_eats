import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { requestAuthOtp, verifyAuthOtp } from "../api/client.js";

function getFirstName(user) {
  return user?.name ? user.name.trim().split(/\s+/)[0] : "";
}

const accountNavItems = [
  { id: "orders", label: "Orders" },
  { id: "subscription", label: "SnapEatPro" },
  { id: "favorites", label: "Favorites" },
  { id: "payments", label: "Payments" },
  { id: "addresses", label: "Addresses" },
  { id: "settings", label: "Settings" }
];

function AccountNavIcon({ section }) {
  const paths = {
    addresses: "M12 2C7.58 2 4 5.58 4 10c0 5.25 6.12 11.39 7.38 12.59a1 1 0 0 0 1.24 0C13.88 21.39 20 15.25 20 10c0-4.42-3.58-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z",
    favorites: "M12 21.35 10.55 20.03C5.4 15.36 2 12.27 2 8.5A4.5 4.5 0 0 1 6.5 4c1.74 0 3.41.81 4.5 2.09A6.03 6.03 0 0 1 15.5 4 4.5 4.5 0 0 1 20 8.5c0 3.77-3.4 6.86-8.55 11.54L12 21.35Z",
    orders: "M7 7.5A2.5 2.5 0 0 1 9.5 5h5A2.5 2.5 0 0 1 17 7.5V9h1.5A1.5 1.5 0 0 1 20 10.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-8A1.5 1.5 0 0 1 5.5 9H7V7.5Zm2.5-1A1.5 1.5 0 0 0 8 8v1h8V8a1.5 1.5 0 0 0-1.5-1.5h-5Z",
    payments: "M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H3V6Zm0 4h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8Zm4 5v2h4v-2H7Z",
    settings: "M19.14 12.94a7.77 7.77 0 0 0 .05-.94c0-.32-.02-.63-.05-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.46 7.46 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.58.23-1.12.53-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.48a.5.5 0 0 0 .12.64l2.03 1.58c-.03.31-.05.62-.05.94 0 .32.02.63.05.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.51.41 1.05.72 1.63.94l.36 2.54a.5.5 0 0 0 .49.42h3.8a.5.5 0 0 0 .49-.42l.36-2.54c.58-.23 1.12-.53 1.63-.94l2.39.96c.22.09.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z",
    subscription: "M12 2 9.2 7.63 3 8.53l4.5 4.39-1.06 6.2L12 16.2l5.56 2.92-1.06-6.2L21 8.53l-6.2-.9L12 2Z"
  };

  return <span className="account-nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d={paths[section] || paths.orders} /></svg></span>;
}

function AccountDashboard({ onLogout, session }) {
  const user = session.user;
  const displayName = user?.name || user?.email || user?.phoneNumber || "SnapEats customer";
  const [activeSection, setActiveSection] = useState("orders");

  function renderPanel() {
    if (activeSection === "subscription") {
      return (
        <section className="account-panel">
          <p className="menu-eyebrow">SnapEatPro</p>
          <h3>Membership plans</h3>
          <p className="account-panel-copy">Choose a plan and save more on every order with free delivery and member discounts.</p>
          <div className="account-stat-grid">
            <div className="account-card"><span>Current status</span><strong>Not subscribed</strong></div>
            <div className="account-card"><span>Monthly fee</span><strong>Choose a plan</strong></div>
          </div>
          <div className="account-placeholder-card compact"><strong>No active plan yet</strong><p>Membership plans and benefits will appear here when available.</p></div>
        </section>
      );
    }

    if (activeSection === "favorites") {
      return (
        <section className="account-panel">
          <p className="menu-eyebrow">Favorites</p>
          <h3>Your favorite picks</h3>
          <p className="account-panel-copy">Save restaurants and dishes you love so they stay one tap away.</p>
          <div className="account-placeholder-card"><strong>No favorites saved yet</strong><p>Tap the heart on any restaurant or dish to save it here.</p><Link className="primary-button" to="/restaurants">Explore restaurants</Link></div>
        </section>
      );
    }

    if (activeSection === "payments") {
      return (
        <section className="account-panel">
          <div className="account-panel-head"><div><p className="menu-eyebrow">Payments</p><h3>Payment methods</h3><p className="account-panel-copy">Save cards, wallets, and UPI handles so checkout is faster.</p></div></div>
          <div className="account-stat-grid">
            <div className="account-card"><span>Default method</span><strong>Cash on delivery</strong></div>
            <div className="account-card"><span>Saved methods</span><strong>0 total</strong></div>
          </div>
          <div className="account-placeholder-card compact"><strong>No digital methods saved</strong><p>Your saved methods will appear here and during checkout.</p><Link className="primary-button" to="/checkout">Open checkout</Link></div>
        </section>
      );
    }

    if (activeSection === "addresses") {
      return (
        <section className="account-panel">
          <div className="account-panel-head"><div><p className="menu-eyebrow">Addresses</p><h3>Manage saved addresses</h3><p className="account-panel-note">Use the address book flow to add, edit, delete, and choose a delivery address.</p></div><Link className="secondary-button" to="/addresses">Open address book</Link></div>
          <div className="account-placeholder-card"><strong>Saved addresses</strong><p>Manage your delivery locations in the React address book.</p><Link className="primary-button" to="/addresses">Manage addresses</Link></div>
        </section>
      );
    }

    if (activeSection === "settings") {
      return (
        <section className="account-panel">
          <div className="account-panel-head"><div><p className="menu-eyebrow">Settings</p><h3>Profile and app settings</h3></div></div>
          <div className="account-settings-form">
            <div className="account-stat-grid">
              <label className="account-form-field"><span>Name</span><input readOnly value={user?.name || "Not added"} /></label>
              <label className="account-form-field"><span>Email</span><input readOnly value={user?.email || "Not added"} /></label>
              <label className="account-form-field"><span>Phone</span><input readOnly value={user?.phoneNumber || "Not added"} /></label>
            </div>
            <div className="auth-actions"><button className="text-button danger-button" onClick={onLogout} type="button">Log out</button></div>
          </div>
          <section className="account-danger-zone"><div className="account-panel-head account-panel-head-compact"><div><h4>Delete account</h4><p className="account-panel-note">Secure account deletion is not available in the React flow yet.</p></div></div></section>
        </section>
      );
    }

    return (
      <section className="account-panel account-panel-orders">
        <div className="account-panel-head"><div><p className="menu-eyebrow">Orders</p><h3>Your orders</h3><p className="account-panel-copy">Review recent meals, delivery progress, and order details here.</p></div><Link className="secondary-button" to="/restaurants">Order food</Link></div>
        <div className="account-empty-state"><h3>No orders placed yet</h3><p>Your completed orders will appear here after checkout.</p><Link className="primary-button" to="/restaurants">Explore restaurants</Link></div>
      </section>
    );
  }

  return (
    <div className="account-shell">
      <section className="account-hero"><div className="account-hero-inner"><div className="account-hero-copy"><p className="menu-eyebrow">My account</p><h2>{displayName}</h2><div className="account-hero-meta-row"><p className="account-hero-meta">{user?.phoneNumber || "-"} <span>&bull;</span> {user?.email || "-"}</p><button className="account-edit-button" onClick={() => setActiveSection("settings")} type="button">Edit profile</button></div></div></div></section>
      <section className="account-layout"><aside className="account-sidebar">{accountNavItems.map((item) => <button className={`account-nav-item ${activeSection === item.id ? "active" : ""}`} key={item.id} onClick={() => setActiveSection(item.id)} type="button"><AccountNavIcon section={item.id} /><span>{item.label}</span></button>)}</aside><div className="account-main">{renderPanel()}</div></section>
    </div>
  );
}

function AccountPage({ onAuthSuccess, onLogout, onStatusChange, session }) {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("form");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [otp, setOtp] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState("neutral");
  const [pending, setPending] = useState(false);
  const [forceSignup, setForceSignup] = useState(false);

  const isSignup = mode === "signup";
  const identifierIsEmail = useMemo(() => identifier.includes("@"), [identifier]);

  useEffect(() => {
    if (session.user && session.token) {
      onStatusChange(`Signed in as ${getFirstName(session.user) || "customer"}`);
    } else {
      onStatusChange("Account route ready");
    }
  }, [onStatusChange, session.token, session.user]);

  function switchMode(nextMode) {
    if (forceSignup && nextMode !== "signup") {
      return;
    }

    setMode(nextMode);
    setStep("form");
    setOtp("");
    setFeedback("");
    setFeedbackTone("neutral");
  }

  async function handleOtpRequest(event) {
    event.preventDefault();

    if (!identifier.trim()) {
      setFeedback("Enter your email or phone number first.");
      setFeedbackTone("error");
      return;
    }

    setPending(true);
    setFeedback("Sending OTP...");
    setFeedbackTone("neutral");

    try {
      const response = await requestAuthOtp(identifier.trim());

      if (response?.existingUser === false) {
        setMode("signup");
        setForceSignup(true);
      } else {
        setForceSignup(false);
      }

      setStep("verify");
      setOtp(response?.devOtp || "");
      setFeedback(response?.devOtp ? `Dev OTP ready: ${response.devOtp}` : response?.message || "OTP sent.");
      setFeedbackTone("success");
    } catch (error) {
      setFeedback(error.message || "Could not send OTP.");
      setFeedbackTone("error");
    } finally {
      setPending(false);
    }
  }

  async function handleOtpVerify(event) {
    event.preventDefault();

    if (!otp.trim()) {
      setFeedback("Enter the OTP first.");
      setFeedbackTone("error");
      return;
    }

    if (isSignup && !name.trim()) {
      setFeedback("Enter your name to create the account.");
      setFeedbackTone("error");
      return;
    }

    setPending(true);
    setFeedback("Verifying OTP...");
    setFeedbackTone("neutral");

    try {
      const authResponse = await verifyAuthOtp({
        email: identifierIsEmail ? "" : email.trim(),
        identifier: identifier.trim(),
        name: name.trim(),
        otp: otp.trim(),
        referralCode: referralCode.trim()
      });

      onAuthSuccess(authResponse);
      setFeedback("Logged in successfully.");
      setFeedbackTone("success");
      setIdentifier("");
      setName("");
      setEmail("");
      setReferralCode("");
      setOtp("");
      setStep("form");
      setForceSignup(false);
    } catch (error) {
      setFeedback(error.message || "Could not verify OTP.");
      setFeedbackTone("error");
    } finally {
      setPending(false);
    }
  }

  if (session.user && session.token) {
    return <AccountDashboard onLogout={onLogout} session={session} />;
  }

  return (
    <section className="auth-shell">
      <div className="auth-header">
        <p className="menu-eyebrow">My account</p>
        <h2>Login or sign up with OTP</h2>
        <p className="auth-subtitle">Enter your email or phone, verify OTP, and continue.</p>
      </div>

      <div className="account-card">
        <div className="auth-tabs" role="tablist" aria-label="Account mode">
          <button
            className={mode === "login" ? "active" : ""}
            disabled={forceSignup}
            onClick={() => switchMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => switchMode("signup")}
            type="button"
          >
            Sign up
          </button>
        </div>

        {step === "form" ? (
          <form className="auth-form" onSubmit={handleOtpRequest}>
            <label>
              Phone number or email
              <input
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="you@example.com or 9876543210"
                type="text"
                value={identifier}
              />
            </label>

            {isSignup ? (
              <>
                <label>
                  Name
                  <input
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your full name"
                    type="text"
                    value={name}
                  />
                </label>

                {!identifierIsEmail ? (
                  <label>
                    Email
                    <input
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      type="email"
                      value={email}
                    />
                  </label>
                ) : null}

                <label>
                  Referral code
                  <input
                    onChange={(event) => setReferralCode(event.target.value)}
                    placeholder="Optional"
                    type="text"
                    value={referralCode}
                  />
                </label>
              </>
            ) : null}

            <button className="primary-button" disabled={pending} type="submit">
              {pending ? "Sending..." : "Continue with OTP"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleOtpVerify}>
            <div className="otp-review">
              <p>OTP sent to <strong>{identifier}</strong></p>
              <button className="text-button" onClick={() => setStep("form")} type="button">
                Change
              </button>
            </div>

            {forceSignup ? (
              <p className="auth-note">This looks like a new account. Add your name and verify OTP to sign up.</p>
            ) : null}

            {isSignup ? (
              <>
                <label>
                  Name
                  <input
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your full name"
                    type="text"
                    value={name}
                  />
                </label>

                {!identifierIsEmail ? (
                  <label>
                    Email
                    <input
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      type="email"
                      value={email}
                    />
                  </label>
                ) : null}
              </>
            ) : null}

            <label>
              OTP
              <input
                inputMode="numeric"
                maxLength="6"
                onChange={(event) => setOtp(event.target.value)}
                placeholder="6-digit OTP"
                type="text"
                value={otp}
              />
            </label>

            <div className="account-actions">
              <button className="primary-button" disabled={pending} type="submit">
                {pending ? "Verifying..." : isSignup ? "Create account" : "Login"}
              </button>
              <button className="secondary-button" disabled={pending} onClick={handleOtpRequest} type="button">
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {feedback ? <p className={`checkout-feedback ${feedbackTone === "error" ? "error" : feedbackTone === "success" ? "success" : ""}`}>{feedback}</p> : null}
      </div>
    </section>
  );
}

export default AccountPage;
