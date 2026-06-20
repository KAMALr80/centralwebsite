import { type ReactNode } from "react";

// Auth pages (login, register) use a minimal layout — no NavBar/Footer
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg flex items-start sm:items-center justify-center px-4 py-8 sm:py-4">
      {children}
    </div>
  );
}
