import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Tag, ShoppingCart, FolderTree, LogOut } from "lucide-react";
import { useAdminMe } from "@/hooks/useAdminMe";
import { useClerk } from "@clerk/react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAdminMe();
  const [, setLocation] = useLocation();
  const { signOut } = useClerk();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      setLocation("/");
    }
  }, [isAdmin, isLoading, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#111] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  if (!isAdmin) {
    return null;
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Offers", href: "/admin/offers", icon: Tag },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#111] border-r border-border/10 flex flex-col">
        <div className="p-6 border-b border-border/10">
          <h2 className="font-serif text-xl font-bold tracking-tight text-primary">Royal Jersey BD</h2>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-white/5 hover:text-primary transition-colors cursor-pointer text-sm font-medium">
                <item.icon className="w-4 h-4" />
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border/10">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white" onClick={() => signOut()}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-16 border-b border-border/10 bg-[#111]/50 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
          <h1 className="font-medium text-lg">Admin Dashboard</h1>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
