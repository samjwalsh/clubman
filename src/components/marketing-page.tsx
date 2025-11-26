import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  Trophy,
  GraduationCap,
  Settings,
  Smartphone,
  Bell,
  QrCode,
  BarChart3,
  Clock,
  Zap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export function MarketingPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Navigation */}
      <nav className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Calendar className="text-primary h-8 w-8" />
            <span className="text-xl font-bold">Clubman</span>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <Badge variant="secondary" className="w-fit">
                ✨ Built for modern sports clubs
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                The complete platform for{" "}
                <span className="text-primary">sports club</span> management
              </h1>
              <p className="text-muted-foreground max-w-xl text-lg sm:text-xl">
                Real-time bookings, member management, coaching sessions, and
                analytics—all in one beautiful, mobile-first app. No app store
                needed.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#features">See Features</Link>
                </Button>
              </div>
              <div className="text-muted-foreground flex items-center gap-6 text-sm">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="text-primary h-4 w-4" />
                  Free 14-day trial
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="text-primary h-4 w-4" />
                  No credit card required
                </span>
              </div>
            </div>

            {/* Hero Illustration - Booking Grid Mockup */}
            <div className="relative">
              <div className="bg-card rounded-xl border p-4 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary h-3 w-3 rounded-full" />
                    <span className="text-sm font-medium">
                      Today&apos;s Bookings
                    </span>
                  </div>
                  <Badge>Live</Badge>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-muted-foreground text-xs" />
                  <div className="text-muted-foreground text-center text-xs font-medium">
                    Court 1
                  </div>
                  <div className="text-muted-foreground text-center text-xs font-medium">
                    Court 2
                  </div>
                  <div className="text-muted-foreground text-center text-xs font-medium">
                    Court 3
                  </div>
                  {["9:00", "9:30", "10:00", "10:30", "11:00"].map(
                    (time, i) => (
                      <>
                        <div
                          key={`time-${time}`}
                          className="text-muted-foreground py-2 text-xs"
                        >
                          {time}
                        </div>
                        <div
                          key={`c1-${time}`}
                          className={`rounded py-2 text-center text-xs ${
                            i === 0 || i === 1
                              ? "bg-primary/20 text-primary"
                              : i === 3
                                ? "bg-muted"
                                : "bg-muted/50 hover:bg-muted cursor-pointer"
                          }`}
                        >
                          {i === 0 || i === 1
                            ? i === 0
                              ? "Ben S."
                              : ""
                            : i === 3
                              ? "Class"
                              : ""}
                        </div>
                        <div
                          key={`c2-${time}`}
                          className={`rounded py-2 text-center text-xs ${
                            i === 2 || i === 3
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-muted/50 hover:bg-muted cursor-pointer"
                          }`}
                        >
                          {i === 2 ? "Anna M." : i === 3 ? "" : ""}
                        </div>
                        <div
                          key={`c3-${time}`}
                          className={`rounded py-2 text-center text-xs ${
                            i === 4
                              ? "bg-accent text-accent-foreground"
                              : "bg-muted/50 hover:bg-muted cursor-pointer"
                          }`}
                        >
                          {i === 4 ? "Lesson" : ""}
                        </div>
                      </>
                    ),
                  )}
                </div>
              </div>
              {/* Floating notification */}
              <div className="bg-card absolute -right-4 -bottom-4 flex items-center gap-2 rounded-lg border p-3 shadow-lg sm:-right-8">
                <Bell className="text-primary h-5 w-5" />
                <div className="text-xs">
                  <p className="font-medium">Booking confirmed!</p>
                  <p className="text-muted-foreground">Court 2 at 10:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Showcase */}
      <section className="bg-muted/30 border-y px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-muted-foreground mb-8 text-center text-sm font-medium tracking-wide uppercase">
            Built for every sport your club offers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {[
              { name: "Tennis", emoji: "🎾" },
              { name: "Padel", emoji: "🏓" },
              { name: "Squash", emoji: "🎯" },
              { name: "Badminton", emoji: "🏸" },
              { name: "Snooker", emoji: "🎱" },
              { name: "Gym", emoji: "💪" },
            ].map((sport) => (
              <div
                key={sport.name}
                className="flex items-center gap-2 text-lg font-medium"
              >
                <span className="text-2xl">{sport.emoji}</span>
                <span>{sport.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">
              Features
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to run your club
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              From real-time court bookings to member rankings, Clubman handles
              it all so you can focus on what matters—your members.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Dynamic Booking Grid"
              description="Real-time availability with a beautiful, mobile-first interface. Swipe between courts and days effortlessly."
            />
            <FeatureCard
              icon={<QrCode className="h-6 w-6" />}
              title="Attendance Verification"
              description="QR codes, NFC taps, or manual check-in. Reduce no-shows with automated reminders and penalties."
            />
            <FeatureCard
              icon={<Trophy className="h-6 w-6" />}
              title="Player Matching & Rankings"
              description="Elo-based rankings, partner matching, and leaderboards. Score verification ensures fair play."
            />
            <FeatureCard
              icon={<GraduationCap className="h-6 w-6" />}
              title="Coaching & Classes"
              description="Schedule lessons, manage group classes, handle waitlists and payments—all integrated with your booking grid."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Member Management"
              description="Invite members, assign roles, track guest bookings. Full permission control from owners to members."
            />
            <FeatureCard
              icon={<Settings className="h-6 w-6" />}
              title="Admin Control Center"
              description="Configure booking rules, cancellation policies, guest fees, and opening hours. White-label with your branding."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 border-y px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">
              How It Works
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Up and running in minutes
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Get your club online quickly with our simple setup process.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <StepCard
              number="1"
              title="Create Your Club"
              description="Sign up and create your club profile with your branding, logo, and basic information."
            />
            <StepCard
              number="2"
              title="Configure Facilities"
              description="Add your courts, gyms, and studios. Set opening hours, booking rules, and pricing."
            />
            <StepCard
              number="3"
              title="Invite Members"
              description="Send invites to your members. They install the PWA and start booking instantly."
            />
          </div>
        </div>
      </section>

      {/* Mobile-First PWA Section */}
      <section className="px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="secondary" className="mb-4">
                Mobile-First PWA
              </Badge>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                No app store. No friction.
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Clubman is a Progressive Web App that installs directly from the
                browser. Your members get push notifications, offline access,
                and a native app experience—without the app store hassle.
              </p>
              <div className="space-y-4">
                <BenefitItem
                  icon={<Smartphone className="h-5 w-5" />}
                  title="Install from browser"
                  description="One tap to add to home screen on any device"
                />
                <BenefitItem
                  icon={<Bell className="h-5 w-5" />}
                  title="Push notifications"
                  description="Booking reminders and updates in real-time"
                />
                <BenefitItem
                  icon={<Zap className="h-5 w-5" />}
                  title="Real-time sync"
                  description="WebSocket-powered live updates across all devices"
                />
                <BenefitItem
                  icon={<Clock className="h-5 w-5" />}
                  title="Offline capable"
                  description="View schedules even without internet"
                />
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="flex justify-center">
              <div className="bg-card w-64 rounded-3xl border-4 p-2 shadow-2xl">
                <div className="bg-muted flex h-[480px] flex-col rounded-2xl p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold">Clubman</span>
                    <Badge variant="secondary" className="text-xs">
                      PWA
                    </Badge>
                  </div>
                  <div className="bg-card flex-1 rounded-lg p-3">
                    <p className="text-muted-foreground mb-2 text-xs">
                      Today, Nov 26
                    </p>
                    <div className="space-y-2">
                      <div className="bg-primary/10 rounded p-2">
                        <p className="text-primary text-xs font-medium">
                          9:00 - Padel Court 1
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Confirmed
                        </p>
                      </div>
                      <div className="bg-muted rounded p-2">
                        <p className="text-xs font-medium">
                          14:00 - Tennis Court 2
                        </p>
                        <p className="text-muted-foreground text-xs">
                          With Sam W.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-around">
                    <div className="text-center">
                      <Calendar className="text-primary mx-auto h-5 w-5" />
                      <span className="text-xs">Book</span>
                    </div>
                    <div className="text-center">
                      <Trophy className="text-muted-foreground mx-auto h-5 w-5" />
                      <span className="text-muted-foreground text-xs">
                        Rank
                      </span>
                    </div>
                    <div className="text-center">
                      <Users className="text-muted-foreground mx-auto h-5 w-5" />
                      <span className="text-muted-foreground text-xs">
                        Club
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section className="bg-muted/30 border-y px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Analytics Mockup */}
            <div className="bg-card rounded-xl border p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-semibold">Court Utilization</h3>
                <Badge variant="outline">This Week</Badge>
              </div>
              <div className="mb-6 grid grid-cols-3 gap-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-primary text-2xl font-bold">87%</p>
                  <p className="text-muted-foreground text-xs">Peak Hours</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-muted-foreground text-xs">Bookings</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">4.2%</p>
                  <p className="text-muted-foreground text-xs">No-Shows</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Padel Courts</span>
                    <span className="text-muted-foreground">92%</span>
                  </div>
                  <div className="bg-muted h-2 rounded-full">
                    <div className="bg-primary h-2 w-[92%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Tennis Courts</span>
                    <span className="text-muted-foreground">78%</span>
                  </div>
                  <div className="bg-muted h-2 rounded-full">
                    <div className="bg-primary h-2 w-[78%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Gym Studio</span>
                    <span className="text-muted-foreground">65%</span>
                  </div>
                  <div className="bg-muted h-2 rounded-full">
                    <div className="bg-primary h-2 w-[65%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Badge variant="secondary" className="mb-4">
                Analytics
              </Badge>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Data-driven decisions
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Understand how your facilities are used with comprehensive
                analytics. Track utilization, revenue, and member engagement.
              </p>
              <div className="space-y-4">
                <BenefitItem
                  icon={<BarChart3 className="h-5 w-5" />}
                  title="Utilization heat maps"
                  description="See which courts are busiest and when"
                />
                <BenefitItem
                  icon={<Users className="h-5 w-5" />}
                  title="No-show tracking"
                  description="Identify problematic patterns and enforce policies"
                />
                <BenefitItem
                  icon={<Trophy className="h-5 w-5" />}
                  title="Member engagement"
                  description="Track active members and booking frequency"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Ready to modernize your club?
          </h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
            Join clubs already using Clubman to streamline bookings, engage
            members, and grow their community.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/signup">
                Start Your Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            Free 14-day trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="text-primary h-6 w-6" />
                <span className="text-lg font-bold">Clubman</span>
              </div>
              <p className="text-muted-foreground text-sm">
                The complete platform for sports club facility management. Built
                for tennis, padel, squash, and more.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Product</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <Link href="#features" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Company</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Legal</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-muted-foreground mt-12 border-t pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} Clubman. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="bg-primary/10 text-primary mb-2 w-fit rounded-lg p-2">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="bg-primary text-primary-foreground mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold">
        {number}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function BenefitItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="text-primary mt-0.5">{icon}</div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}
