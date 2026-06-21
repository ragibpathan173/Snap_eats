import { useEffect, useState } from "react";
import { fetchAdminUsers, fetchAdminUserStats } from "../api/client.js";
import AdminMenuManager from "./AdminMenuManager.jsx";

function formatRole(role) {
  return String(role || "USER")
    .toLowerCase()
    .split("_")
    .map((part) => part ? `${part.charAt(0).toUpperCase()}${part.slice(1)}` : "")
    .join(" ");
}

function formatDateTime(value) {
  if (!value) {
    return "-";
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

function AdminPanel({ onStatusChange, session }) {
  const [appliedSearch, setAppliedSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const user = session.user;
  const isAdmin = String(user?.role || "").toUpperCase() === "ADMIN";

  useEffect(() => {
    loadAdminData("");
  }, [session.token, user?.id]);

  async function loadAdminData(query = appliedSearch) {
    if (!isAdmin || !user?.id || !session.token) {
      setError("Admin access required.");
      setLoading(false);
      return;
    }

    const normalizedQuery = String(query || "").trim();
    setLoading(true);
    setError("");

    try {
      const [statsPayload, usersPayload] = await Promise.all([
        fetchAdminUserStats(user.id, session.token),
        fetchAdminUsers(normalizedQuery, user.id, session.token)
      ]);
      setStats(statsPayload && typeof statsPayload === "object" ? statsPayload : null);
      setUsers(Array.isArray(usersPayload) ? usersPayload : []);
      setAppliedSearch(normalizedQuery);
    } catch (loadError) {
      const message = loadError.message || "Could not load admin user data.";
      setError(message);
      onStatusChange(message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    loadAdminData(searchTerm);
  }

  function clearSearch() {
    setSearchTerm("");
    loadAdminData("");
  }

  function refreshAdminPanel() {
    loadAdminData(appliedSearch);
    setRefreshVersion((currentVersion) => currentVersion + 1);
  }

  if (!isAdmin) {
    return <section className="account-panel"><h3>Admin access required</h3><p className="account-panel-copy">Only admin users can view people data and manage menus.</p></section>;
  }

  const totalUsers = Number(stats?.totalUsers || users.length || 0);
  const activeUsers = Number(stats?.activeUsers || users.filter((entry) => entry.active).length || 0);
  const totalCustomers = Number(stats?.totalCustomers || users.filter((entry) => entry.role === "USER").length || 0);
  const totalAdmins = Number(stats?.totalAdmins || users.filter((entry) => entry.role === "ADMIN").length || 0);
  const searchSummary = appliedSearch
    ? `${users.length} match${users.length === 1 ? "" : "es"} for "${appliedSearch}"`
    : `${users.length} registered user${users.length === 1 ? "" : "s"}`;

  return (
    <section className="account-panel">
      <div className="account-panel-head"><div><p className="menu-eyebrow">Admin</p><h3>Admin control center</h3><p className="account-panel-copy">Review registered users and manage menu operations by restaurant.</p></div><button className="secondary-button" disabled={loading} onClick={refreshAdminPanel} type="button">{loading ? "Refreshing..." : "Refresh all"}</button></div>

      <section className="admin-user-directory-panel">
        <div className="account-panel-head account-panel-head-compact"><div><p className="menu-eyebrow">People</p><h3>User access overview</h3><p className="account-panel-copy">Only admin users can see signed-up account details here. This shows registered users, not anonymous visitors.</p></div></div>

        <div className="account-stat-grid admin-user-stats-grid"><div className="account-card"><span>Total users</span><strong>{totalUsers}</strong></div><div className="account-card"><span>Active users</span><strong>{activeUsers}</strong></div><div className="account-card"><span>Customers</span><strong>{totalCustomers}</strong></div><div className="account-card"><span>Admins</span><strong>{totalAdmins}</strong></div></div>

        <div className="admin-user-directory-head"><div className="payment-form-header"><strong>User directory</strong><p>{searchSummary}</p></div><form className="admin-user-search" onSubmit={handleSearch}><input disabled={loading} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by name, email, or phone" type="search" value={searchTerm} /><button className="secondary-button" disabled={loading} type="submit">Search</button>{appliedSearch ? <button className="text-button" disabled={loading} onClick={clearSearch} type="button">Clear</button> : null}</form></div>

        {error ? <div className="checkout-feedback error">{error}</div> : null}
        {loading ? <div className="account-placeholder-card compact"><p>Loading user access data...</p></div> : <div className="admin-user-list">{users.length ? users.map((entry) => <article className="admin-user-card" key={entry.id}><div><strong>{entry.name || "Unnamed user"}</strong><p>{entry.email || "No email"}{entry.phoneNumber ? <> &bull; {entry.phoneNumber}</> : null}</p>{entry.address ? <p>{entry.address}</p> : null}<div className="admin-user-meta"><span className="admin-user-pill">{formatRole(entry.role)}</span><span className={`admin-user-pill ${entry.active ? "active" : "inactive"}`}>{entry.active ? "Active" : "Inactive"}</span>{entry.city || entry.state ? <span className="admin-user-pill">{[entry.city, entry.state].filter(Boolean).join(", ")}</span> : null}{entry.pincode ? <span className="admin-user-pill">PIN {entry.pincode}</span> : null}</div></div><div className="admin-user-side"><span>ID #{entry.id ?? "-"}</span><strong>{formatDateTime(entry.createdAt)}</strong></div></article>) : <div className="account-placeholder-card compact"><p>No users found for this filter.</p></div>}</div>}
      </section>

      <AdminMenuManager onStatusChange={onStatusChange} refreshVersion={refreshVersion} session={session} />
    </section>
  );
}

export default AdminPanel;
