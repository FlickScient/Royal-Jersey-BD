import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ShoppingBag, Moon, Sun, ChevronRight, User, LogOut, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { useCart } from "@/contexts/CartContext";
import { useGetCart } from "@workspace/api-client-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useUser, useClerk } from "@clerk/react";
import { useAdminMe } from "@/hooks/useAdminMe";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const { openCart } = useCart();
  const { data: cart } = useGetCart();
  const [location, setLocation] = useLocation();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const { isAdmin } = useAdminMe();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  const itemCount = cart?.itemCount || 0;

  const navLinks = [
    { name: "Jerseys", path: "/jerseys" },
    { name: "T-Shirts", path: "/products?category=tshirts" },
    { name: "Tracksuits", path: "/products?category=tracksuits" },
    { name: "Balls", path: "/products?category=balls" },
    { name: "New Arrivals", path: "/products?collection=new" },
    { name: "Offers", path: "/products?collection=offers" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-start pt-24 justify-center px-4"
          onClick={() => setSearchOpen(false)}>
          <form onSubmit={handleSearch} className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search jerseys, teams, editions..."
                className="w-full h-14 pl-12 pr-14 rounded-xl border-2 border-primary bg-background text-lg focus:outline-none"
              />
              <button type="button" onClick={() => setSearchOpen(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-3">Press Enter to search · Esc to close</p>
          </form>
        </div>
      )}

      <header className={`fixed top-0 w-full z-40 transition-all duration-300 ${isScrolled ? "bg-background/80 backdrop-blur-md border-b" : "bg-transparent"}`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-background border-r-border/50 p-0 flex flex-col">
                <SheetHeader className="p-6 border-b text-left">
                  <Link href="/" className="block">
                    <img src="/logo-img.jpg" alt="Royal Jersey BD" className="h-14 w-14 rounded-lg object-cover" />
                    <SheetTitle className="font-serif text-xl font-bold tracking-tight text-primary mt-2">Royal Jersey BD</SheetTitle>
                  </Link>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-4">
                  <div className="px-6 pb-6">
                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-6">
                      <span className="w-2 h-2 rounded-full bg-accent mr-2 animate-pulse"></span>
                      Proudly Bangladeshi
                    </div>
                  </div>
                  <nav className="flex flex-col gap-1 px-4">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.name}>
                        <Link href={link.path} className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors group">
                          <span className="font-medium">{link.name}</span>
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </SheetClose>
                    ))}
                    <div className="mt-2 pt-2 border-t">
                      {[
                        { name: "About Us", path: "/about" },
                        { name: "Track Order", path: "/track-order" },
                        { name: "Contact", path: "/contact" },
                        { name: "FAQ", path: "/faq" },
                      ].map((link) => (
                        <SheetClose asChild key={link.name}>
                          <Link href={link.path} className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors group">
                            <span className="font-medium text-muted-foreground">{link.name}</span>
                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                    {isAdmin && (
                      <SheetClose asChild>
                        <Link href="/admin" className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors group text-primary font-bold">
                          <span>Admin Panel</span>
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </SheetClose>
                    )}
                  </nav>
                </div>
                <div className="p-6 border-t bg-muted/30">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-medium">Theme</span>
                    <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full">
                      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {!isSignedIn ? (
                      <>
                        <Button className="w-full justify-start" variant="outline" asChild>
                          <Link href="/sign-in"><User className="mr-2 h-4 w-4" />Log In</Link>
                        </Button>
                        <Button className="w-full" asChild>
                          <Link href="/sign-up">Sign Up</Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 mb-4 px-2">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            {user?.firstName?.[0] || user?.username?.[0] || "U"}
                          </div>
                          <span className="font-medium">{user?.firstName || user?.username || "User"}</span>
                        </div>
                        <Button className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" variant="ghost" onClick={() => signOut()}>
                          <LogOut className="mr-2 h-4 w-4" />Sign Out
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    <p>Help & Support</p>
                    <a href="tel:+8801234567890" className="font-bold text-foreground mt-1 block">+880 1234-567890</a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity" data-testid="link-home">
              <img
                src="/logo-img.jpg"
                alt="Royal Jersey BD"
                className="h-9 w-9 rounded-md object-cover flex-shrink-0"
              />
              <span className="font-serif text-xl md:text-2xl font-bold tracking-tight hidden sm:block">
                Royal Jersey <span className="text-primary">BD</span>
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.path} className="text-sm font-medium hover:text-primary transition-colors relative group">
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>

            <div className="hidden md:flex items-center gap-2">
              {!isSignedIn ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/sign-in">Log In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Hi, {user?.firstName || "User"}</span>
                  <Button variant="ghost" size="icon" onClick={() => signOut()}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Button variant="ghost" size="icon" className="relative" onClick={openCart} data-testid="button-cart">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              )}
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
