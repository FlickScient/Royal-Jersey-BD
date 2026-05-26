import { SignUp } from "@clerk/react";

export default function SignUpPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative py-12">
      <div className="absolute inset-0 bg-background bg-[url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/50 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center mb-8">
        <h1 className="font-serif text-4xl font-bold tracking-tighter">
          Royal Jersey <span className="text-primary">BD</span>
        </h1>
        <p className="text-muted-foreground mt-2 font-medium tracking-widest uppercase text-sm">Join the Club</p>
      </div>

      <div className="relative z-10">
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      </div>
    </div>
  );
}
