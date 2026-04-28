import type { User } from "../types";

const TOKEN_KEY = "smart-campus-auth-token";

export interface AuthResult {
  token: string;
  user: User;
  tuProfile: {
    displayNameTh: string;
    displayNameEn: string;
    type: string;
    department: string;
    organization: string;
  };
}

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

/**
 * Get the stored JWT token from localStorage.
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store a JWT token in localStorage.
 */
export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Clear the stored JWT token.
 */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if a token exists (quick check without verifying).
 */
export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

/**
 * Login with TU credentials.
 */
export async function login(
  username: string,
  password: string,
): Promise<AuthResult> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    let message = "เข้าสู่ระบบไม่สำเร็จ";

    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      // Ignore non-JSON responses.
    }

    throw new AuthError(message, response.status);
  }

  const data = (await response.json()) as AuthResult;
  storeToken(data.token);
  return data;
}

/**
 * Logout — clear local token and notify the server.
 */
export async function logout(): Promise<void> {
  const token = getStoredToken();
  clearToken();

  if (token) {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Ignore logout failures — token is already cleared locally.
    }
  }
}

/**
 * Get the current session — validate the stored token against the server.
 */
export async function getSession(): Promise<User | null> {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      clearToken();
      return null;
    }

    const data = (await response.json()) as { user: User };
    return data.user;
  } catch {
    return null;
  }
}

/**
 * Get the Authorization header value if authenticated.
 */
export function getAuthHeader(): Record<string, string> {
  const token = getStoredToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}
