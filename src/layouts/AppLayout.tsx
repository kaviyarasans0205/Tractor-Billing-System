import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PasswordGate } from "@/components/PasswordGate";
import { Tractor } from "lucide-react";

export default function AppLayout() {
  return (
    <PasswordGate>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur">
              <SidebarTrigger />
              <Tractor className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">
                KPS கவர்பணை · Owner
              </span>
            </header>
            <main className="flex-1 p-4 sm:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </PasswordGate>
  );
}
