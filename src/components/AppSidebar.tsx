import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Plus,
  Settings as SettingsIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import kpsLogo from "@/assets/kps-tractors.jpeg";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, tamil: "டாஷ்போர்டு" },
  { title: "New Bill", url: "/bills/new", icon: Plus, tamil: "புதிய பில்" },
  { title: "Bills", url: "/bills", icon: Receipt, tamil: "பில்கள்" },
  { title: "Customers", url: "/customers", icon: Users, tamil: "வாடிக்கையாளர்கள்" },
  { title: "Settings", url: "/settings", icon: SettingsIcon, tamil: "அமைப்புகள்" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(path + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-3">
        <div className="flex items-center gap-2">
          <img
            src={kpsLogo}
            alt="KPS"
            className="h-9 w-9 rounded-full border-2 border-primary object-cover shadow"
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-primary">KPS கவர்பணை</p>
              <p className="truncate text-[10px] text-muted-foreground">
                டிராக்டர் உழவு பில்லிங்
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>மெனு</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end={item.url === "/"} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.tamil}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
