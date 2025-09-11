// src/app/admin/page.tsx
import AdminDashboard from "./AdminDashboard";
import AdminGuard from "../../components/AdminGuard";

export default function AdminPage() {
  return (
    <AdminGuard>
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <AdminDashboard />
        </div>
      </main>
    </AdminGuard>
  );
}