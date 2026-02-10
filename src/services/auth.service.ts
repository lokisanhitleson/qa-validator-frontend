import { LoginCredentials, User } from "@/interfaces";
import { HARDCODED_CREDENTIALS, DEFAULT_USER } from "@/utils/constants";

export function authenticate(credentials: LoginCredentials): User | null {
  if (
    credentials.username === HARDCODED_CREDENTIALS.username &&
    credentials.password === HARDCODED_CREDENTIALS.password
  ) {
    return DEFAULT_USER;
  }
  return null;
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("user");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function storeUser(user: User): void {
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem("user");
}
