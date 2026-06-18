const AUTH_STORAGE_KEY = "snap_eats_current_user";
const AUTH_TOKEN_STORAGE_KEY = "snap_eats_auth_token";

function normalizeUser(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  return {
    ...user,
    id: user.id || user.userId || null
  };
}

export function readStoredAuthSession() {
  try {
    const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "";
    const user = storedUser ? normalizeUser(JSON.parse(storedUser)) : null;

    return { token, user };
  } catch {
    return { token: "", user: null };
  }
}

export function saveAuthSession(session) {
  const user = normalizeUser(session?.user);
  const token = session?.token || "";

  try {
    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    if (token) {
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  } catch {
    return { token: "", user: null };
  }

  return { token, user };
}

export function clearAuthSession() {
  return saveAuthSession({ token: "", user: null });
}
