import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AuthGuard } from "@/components/providers/AuthGuard";
import { SocketProvider } from "@/components/providers/SocketProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SocketProvider>
        <div className="min-h-screen bg-base-900">
          <Sidebar />
          <div className="lg:pl-64">
            <Topbar />
            <main className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8 lg:py-8">{children}</main>
          </div>
        </div>
      </SocketProvider>
    </AuthGuard>
  );
}
