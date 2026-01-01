"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "../../lib/auth";

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    logout();
    router.push("/login");
  }, [router]);

  return (
    <main className="max-w-md mx-auto py-10">
      <div className="text-sm">Signing out…</div>
    </main>
  );
}
