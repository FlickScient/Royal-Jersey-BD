import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { ClerkProvider, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { useEffect, useRef } from "react";

import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";

import Header from "@/components/layout/Header";
import CartDrawer from "@/components/layout/CartDrawer";
import FloatingCart from "@/components/layout/FloatingCart";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import Jerseys from "@/pages/Jerseys";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Wishlist from "@/pages/Wishlist";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import NotFound from "@/pages/not-found";

import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOffers from "@/pages/admin/AdminOffers";
import AdminOrders from "@/pages/admin/AdminOrders";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// proxyUrl is only valid in production — in dev it causes Clerk to load its JS
// bundle from the Replit dev proxy which doesn't serve CDN assets.
const clerkProxyUrl = import.meta.env.PROD
  ? import.meta.env.VITE_CLERK_PROXY_URL
  : undefined;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#c9a84c",
    colorForeground: "#fafaf8",
    colorMutedForeground: "#888888",
    colorBackground: "#0a0a0a",
    colorInput: "#1c1c1c",
    colorInputForeground: "#fafaf8",
    colorNeutral: "#2a2a2a",
    colorDanger: "#8b0000",
    fontFamily: "'Playfair Display', Georgia, serif",
    borderRadius: "6px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#111111] border border-[#c9a84c]/30 rounded-xl w-[440px] max-w-full overflow-hidden shadow-2xl shadow-black/60",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#fafaf8] font-serif",
    headerSubtitle: "text-[#888888]",
    socialButtonsBlockButtonText: "text-[#fafaf8]",
    formFieldLabel: "text-[#aaaaaa]",
    footerActionLink: "text-[#c9a84c] hover:text-[#e8c76d]",
    footerActionText: "text-[#666666]",
    dividerText: "text-[#555555]",
    identityPreviewEditButton: "text-[#c9a84c]",
    formFieldSuccessText: "text-[#4ade80]",
    alertText: "text-[#fafaf8]",
    logoBox: "flex justify-center",
    socialButtonsBlockButton: "border-[#2a2a2a] bg-[#1c1c1c] hover:bg-[#252525] text-[#fafaf8]",
    formButtonPrimary: "bg-[#c9a84c] hover:bg-[#b8973b] text-black font-semibold",
    formFieldInput: "bg-[#1c1c1c] border-[#2a2a2a] text-[#fafaf8] placeholder:text-[#555555]",
    footerAction: "bg-[#0f0f0f]",
    dividerLine: "bg-[#2a2a2a]",
    alert: "bg-[#1a0000] border-[#8b0000]",
    otpCodeFieldInput: "bg-[#1c1c1c] border-[#2a2a2a] text-[#fafaf8]",
    formFieldRow: "gap-3",
    main: "gap-4",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/jerseys" component={Jerseys} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/admin">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/products">
        <AdminLayout>
          <AdminProducts />
        </AdminLayout>
      </Route>
      <Route path="/admin/offers">
        <AdminLayout>
          <AdminOffers />
        </AdminLayout>
      </Route>
      <Route path="/admin/orders">
        <AdminLayout>
          <AdminOrders />
        </AdminLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey ?? ""}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: "Welcome back", subtitle: "Sign in to Royal Jersey BD" } },
        signUp: { start: { title: "Create your account", subtitle: "Join Royal Jersey BD" } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <CartProvider>
            <WishlistProvider>
              <TooltipProvider>
                <div className="min-h-[100dvh] flex flex-col relative bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
                  <Header />
                  <main className="flex-1 flex flex-col">
                    <Router />
                  </main>
                  <CartDrawer />
                  <FloatingCart />
                  <WhatsAppButton />
                </div>
                <Toaster />
              </TooltipProvider>
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
