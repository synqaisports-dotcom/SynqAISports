"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SandboxTeamPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/sandbox/app/team");
  }, [router]);

  return <div className="min-h-[100dvh] bg-black text-white" />;
}

