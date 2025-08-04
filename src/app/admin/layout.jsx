"use client";

import { AdminAuthProvider } from "../../hooks/useAdminAuth";

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
}