import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ShoppingBag, Moon, Sun, ChevronRight, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useCart } from "@/contexts/CartContext";
import { useGetCart } from "@workspace/api-client-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { openCart } = useCart();
  const { data: cart } = useGetCart();
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const itemCount = cart?.itemCount || 0;

  const navLinks = [
    { name: "Jerseys", path: "/products?category=jerseys" },
    { name: "Trousers", path: "/products?category=trousers" },
    { name: "Balls", path: "/products?category=balls" },
    { name: "New Arrivals", path: "/products?collection=new" },
    { name: "Offers", path: "/products?collection=offers" },
  ];

  return (
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
                <SheetTitle className="font-serif text-2xl font-bold tracking-tight text-primary">Royal Jersey BD</SheetTitle>
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
                </nav>
              </div>
              <div className="p-6 border-t bg-muted/30">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium">Theme</span>
                  <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </div>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <User className="mr-2 h-4 w-4" />
                    Log In
                  </Button>
                  <Button className="w-full">Sign Up</Button>
                </div>
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <p>Help & Support</p>
                  <a href="tel:+8801234567890" className="font-bold text-foreground mt-1 block">+880 1234-567890</a>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="font-serif text-2xl md:text-3xl font-bold tracking-tighter hover:text-primary transition-colors" data-testid="link-home">
            Royal Jersey <span className="text-primary">BD</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.path} className="text-sm font-medium hover:text-primary transition-colors relative group">
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
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
  );
}
