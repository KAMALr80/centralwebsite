"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { UserAccountMenu } from "./UserAccountMenu";

export function UtilityBar() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-brand-navy text-[#C8D2E5] font-mono text-[11px] tracking-[0.04em] uppercase px-4 sm:px-8 py-2 flex justify-between items-center">
      <span className="hidden sm:inline">Disposable Vape Distributor in White Plains</span>
      <span className="sm:hidden">Disposable Vape Distributor</span>

      <div className="flex items-center gap-4 sm:gap-6">
        {isAuthenticated ? (
          <UserAccountMenu />
        ) : (
            <>
            <Link href="/register" className="text-white">
                REGISTER
            </Link>
            <Link href="/login" className="text-brand-orange hover:text-white transition-colors">
                SIGN IN
            </Link>
            </>
        )}
      </div>
    </div>
  );
}
