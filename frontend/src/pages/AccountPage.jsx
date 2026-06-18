import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { requestAuthOtp, verifyAuthOtp } from "../api/client.js";

function getFirstName(user) {
  return user?.name ? user.name.trim().split(/\s+/)[0] : "";
}

function AccountSummary({ session, onLogout }) {
  const user = session.user;
  const displayName = user?.name || user?.email || user?.phoneNumber || "SnapEats customer";

  return (
    <section className="account-card profile-card">
      <div>
        <p className="eyebrow">Signed in</p>
        <h1>{displayName}</h1>
        <p className="profile-copy">
          Your React session is active and shared with the legacy SnapEats screens.
        </p>
      </div>

      <div className="profile-detail-grid">
        <span>Email</span>
        <strong>{user?.email || "Not added"}</strong>
        <span>Phone</span>
        <strong>{user?.phoneNumber || "Not added"}</strong>
        <span>Role</span>
        <strong>{user?.role || "USER"}</strong>
      </div>

      <div className="account-actions">
        <Link className="primary-action" to="/checkout">Continue checkout</Link>
        <Link className="secondary-action" to="/addresses">Manage addresses</Link>
        <button className="secondary-action" onClick={onLogout} type="button">
          Log out
        </button>
      </div>
    </section>
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
      onStatusChange("React account route ready");
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
    return <AccountSummary onLogout={onLogout} session={session} />;
  }

  return (
    <section className="account-page">
      <div className="section-heading">
        <p className="eyebrow">React account</p>
        <h1>Login or create your SnapEats account.</h1>
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

            <button className="primary-action" disabled={pending} type="submit">
              {pending ? "Sending..." : "Continue with OTP"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleOtpVerify}>
            <div className="otp-review">
              <p>OTP sent to <strong>{identifier}</strong></p>
              <button className="text-action" onClick={() => setStep("form")} type="button">
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
              <button className="primary-action" disabled={pending} type="submit">
                {pending ? "Verifying..." : isSignup ? "Create account" : "Login"}
              </button>
              <button className="secondary-action" disabled={pending} onClick={handleOtpRequest} type="button">
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {feedback ? <p className={`auth-feedback ${feedbackTone}`}>{feedback}</p> : null}
      </div>
    </section>
  );
}

export default AccountPage;
