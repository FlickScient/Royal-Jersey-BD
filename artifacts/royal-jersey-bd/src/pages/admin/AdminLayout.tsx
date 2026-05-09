import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Tag, ShoppingCart, LogOut, Copy, CheckCircle, Shield, ExternalLink } from "lucide-react";
import { useAdminMe } from "@/hooks/useAdminMe";
import { useClerk } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading, isSignedIn, userId } = useAdminMe();
  const [location] = useLocation();
  const { signOut } = useClerk();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#c9a84c] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <Shield className="w-16 h-16 text-[#c9a84c] mx-auto" />
          <div>
            <h1 className="font-serif text-3xl font-bold text-white">Admin Access</h1>
            <p className="text-muted-foreground mt-2">You need to sign in to access the admin panel.</p>
          </div>
          <Link href="/sign-in">
            <Button className="bg-[#c9a84c] hover:bg-[#b8973b] text-black font-bold px-8 py-3 h-auto">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center space-y-3">
            <Shield className="w-16 h-16 text-[#c9a84c] mx-auto" />
            <h1 className="font-serif text-3xl font-bold text-white">Set Up Admin Access</h1>
            <p className="text-muted-foreground">
              You are signed in but not yet set as an admin. Follow these steps to unlock the admin panel.
            </p>
          </div>

          <div className="bg-[#111] border border-[#c9a84c]/20 rounded-xl p-6 space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#c9a84c] uppercase tracking-wider">Step 1 — Your User ID</p>
              <p className="text-sm text-muted-foreground">Copy your unique user ID below:</p>
              <div className="flex items-center gap-2 bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3">
                <code className="flex-1 text-sm text-white font-mono break-all">{userId ?? "Loading..."}</code>
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 text-[#c9a84c] hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#c9a84c] uppercase tracking-wider">Step 2 — Add to Replit Secrets</p>
              <ol className="text-sm text-muted-foreground space-y-2 list-none">
                <li className="flex gap-2"><span className="text-[#c9a84c] font-bold">1.</span>Open your Replit project</li>
                <li className="flex gap-2"><span className="text-[#c9a84c] font-bold">2.</span>Click <strong className="text-white">Secrets</strong> (lock icon in the left sidebar)</li>
                <li className="flex gap-2"><span className="text-[#c9a84c] font-bold">3.</span>Add a secret named <code className="bg-white/10 px-1 rounded text-white">ADMIN_USER_IDS</code></li>
                <li className="flex gap-2"><span className="text-[#c9a84c] font-bold">4.</span>Paste your User ID as the value</li>
                <li className="flex gap-2"><span className="text-[#c9a84c] font-bold">5.</span>Restart the API server workflow</li>
              </ol>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#c9a84c] uppercase tracking-wider">Step 3 — Reload This Page</p>
              <p className="text-sm text-muted-foreground">After restarting, come back here and refresh. The admin panel will unlock.</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full border-white/10 hover:bg-white/5"
              >
                Refresh Page
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Multiple admins? Paste all IDs separated by commas in <code className="bg-white/10 px-1 rounded">ADMIN_USER_IDS</code>
          </p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Offers", href: "/admin/offers", icon: Tag },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-[#111] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5">
          <h2 className="font-serif text-xl font-bold tracking-tight text-[#c9a84c]">Royal Jersey BD</h2>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <span className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-[#c9a84c]/10 text-[#c9a84c]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}>
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link href="/">
            <span className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer">
              <ExternalLink className="w-4 h-4" /> View Site
            </span>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-white hover:bg-red-500/10"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="h-16 border-b border-white/5 bg-[#111]/50 backdrop-blur-md sticky top-0 z-10 px-6 md:px-8 flex items-center justify-between shrink-0">
          <h1 className="font-serif font-semibold text-lg capitalize">
            {navItems.find(n => n.href === location)?.name ?? "Admin"}
          </h1>
          <span className="text-xs text-muted-foreground hidden sm:block">Royal Jersey BD Admin</span>
        </header>
        <div className="p-6 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
