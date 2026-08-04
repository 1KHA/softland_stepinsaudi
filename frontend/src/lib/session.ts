// Single source of truth for the browser session.
//
// Every other module should read the token / user through these helpers rather
// than touching localStorage directly. In particular `getUser()` is the ONLY
// guarded `JSON.parse` of the "user" key: a malformed value returns null
// instead of throwing during render (which used to white-screen the app).

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function getToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    return token && token !== "null" && token !== "undefined" ? token : null;
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getUser(): any | null {
  try {
    const raw = localStorage.getItem(USER_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    // `null`, a bare string or a number are all unusable as a user object.
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    // Malformed JSON in localStorage must never throw.
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setSession(token: string, user: any): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);

    if (user !== undefined && user !== null) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch {
    // Storage can be unavailable (private mode / quota). Nothing to do.
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // Ignore storage failures on the way out.
  }
}

// `navigate` is react-router's navigate function. It is optional so this can be
// called from places that are not inside a Router.
export function logout(navigate?: (path: string) => void): void {
  clearSession();

  if (navigate) {
    navigate("/login");
    return;
  }

  window.location.href = "/login";
}

export function authHeaders(): Record<string, string> {
  const token = getToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
}
