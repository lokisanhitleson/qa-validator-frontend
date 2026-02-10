export interface User {
  username: string;
  name: string;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface SidebarItem {
  label: string;
  href: string;
  icon: string;
}
