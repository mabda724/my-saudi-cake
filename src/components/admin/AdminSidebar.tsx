import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, FolderTree, ShoppingCart, Package, LogOut } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";

const links = [
  { to: "/admin", label: "لوحة التحكم", labelEn: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/categories", label: "الأصناف", labelEn: "Categories", icon: FolderTree },
  { to: "/admin/products", label: "المنتجات", labelEn: "Products", icon: Package },
  { to: "/admin/orders", label: "الطلبات", labelEn: "Orders", icon: ShoppingCart },
] as const;

export function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAdminAuth();

  return (
    <aside className="flex h-screen w-64 flex-col border-e border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-6 py-5">
        <LayoutDashboard className="h-6 w-6 text-primary" />
        <span className="font-display text-lg font-bold tracking-tight text-primary">
          لوحة الأدمن
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((l) => {
          const active = location.pathname === l.to;
          return (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
