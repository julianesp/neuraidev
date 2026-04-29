import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const ADMIN_EMAILS = ["julii1295@gmail.com", "admin@neurai.dev"];

export const metadata = {
  title: "Panel de Administración | Neurai.dev",
  description: "Panel de administración de Neurai.dev",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/admin");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const emails = user.emailAddresses.map((e) => e.emailAddress);
  const esAdmin = emails.some((e) => ADMIN_EMAILS.includes(e));

  if (!esAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}
