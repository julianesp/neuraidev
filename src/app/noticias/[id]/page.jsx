"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NoticiaPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to blog page
    router.push("/Blog");
  }, [router]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <p className="text-xl text-gray-700 dark:text-gray-300">
          Redirigiendo al blog...
        </p>
      </div>
    </div>
  );
}
