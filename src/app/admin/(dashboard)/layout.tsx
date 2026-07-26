import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    redirect("/admin/login");
  }

  return (
    <div className="bg-soft-cloud flex h-screen">
      <a
        href="#main-content"
        className="focus:ring-ink-900 text-body-sm-strong rounded-pill sr-only fixed top-0 left-0 z-[100] m-2 bg-white px-4 py-2 focus:not-sr-only focus:ring-2"
      >
        Skip to content
      </a>
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar email={session.user.email ?? ""} />
        <main id="main-content" className="flex-1 overflow-y-auto p-6" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
