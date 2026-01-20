import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LaneyLogo } from "@/components/laney/LaneyLogo";
import { ArrowRight, Sparkles, Heart } from "lucide-react";
import { toast } from "sonner";
import heroVideo from "@/assets/hero-video.mp4";

export default function Beta() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call - replace with actual beta signup logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Welcome to the Laney beta! We'll be in touch soon.", {
      duration: 5000,
    });
    
    setName("");
    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-secondary to-laney-peach">
      {/* Ambient background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/25 to-accent/20 blur-[100px]" />
        <div className="absolute -left-40 bottom-20 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-accent/15 to-primary/20 blur-[80px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[60px]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen flex-col px-6 py-8">
        {/* Header with logo */}
        <header className="mx-auto w-full max-w-6xl">
          <LaneyLogo size="md" className="mx-auto lg:mx-0" />
        </header>

        {/* Hero Section */}
        <main className="mx-auto flex flex-1 w-full max-w-6xl flex-col items-center justify-center gap-12 py-8 lg:flex-row lg:items-center lg:gap-16">
          {/* Video Section */}
          <div className="relative flex-shrink-0">
            <div className="relative aspect-[9/16] w-[240px] overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 shadow-2xl shadow-primary/20 sm:w-[280px] lg:w-[300px]">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              >
                <source src={heroVideo} type="video/mp4" />
              </video>
              {/* Glassy border effect */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20" />
            </div>
            {/* Floating glow behind video */}
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 to-accent/15 blur-2xl" />
          </div>

          {/* Content Section */}
          <div className="flex max-w-xl flex-col text-center lg:text-left">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 self-center rounded-full bg-gradient-to-r from-primary/15 to-accent/15 px-5 py-2.5 text-sm font-medium text-primary backdrop-blur-sm lg:self-start">
              <Sparkles className="h-4 w-4" />
              Exclusive Beta Access
            </div>

            {/* Headline */}
            <h1 className="mb-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Want to build a photobook in{" "}
              <span className="gradient-text">5 minutes</span>{" "}
              instead of hours?
            </h1>

            {/* Subheadline */}
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              With Laney AI you can create a beautiful photobook in minutes. Sign up for the exclusive beta release and get early access.
            </p>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="flex flex-col gap-3 sm:flex-row lg:max-w-md">
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 border-primary/20 bg-background/80 backdrop-blur-sm focus:border-primary/40"
                  disabled={isSubmitting}
                />
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-primary/20 bg-background/80 backdrop-blur-sm focus:border-primary/40"
                  disabled={isSubmitting}
                />
              </div>
              
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="mt-4 w-full gap-2 bg-gradient-to-r from-primary to-accent px-8 py-6 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:opacity-95 sm:w-auto"
              >
                {isSubmitting ? (
                  "Joining..."
                ) : (
                  <>
                    Get early access
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
              
              <p className="mt-3 text-sm text-muted-foreground">
                Early access is limited.
              </p>
            </form>

            {/* Trust section */}
            <div className="rounded-2xl border border-primary/10 bg-background/50 p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                  <Heart className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Built for people who care about their memories. Designed for people who love beautiful books. Powered by AI. Guided by heart.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mx-auto w-full max-w-6xl pt-4 text-center">
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} Laney. Made with love for your memories.
          </p>
        </footer>
      </div>
    </div>
  );
}
