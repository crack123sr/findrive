import {
  ArrowUpRight,
  ChartNoAxesCombined,
  CircleDollarSign,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import SignInForm from "./_component/signin-form.tsx";
import Logo from "@/components/logo/logo.tsx";

const SignIn = () => {
  return (
    <main className="auth-shell grid min-h-svh overflow-hidden lg:grid-cols-[0.88fr_1.12fr]">
      <section className="auth-form-panel flex min-h-svh flex-col px-6 py-7 sm:px-10 sm:py-9 lg:px-14 xl:px-20">
        <div className="flex justify-center sm:justify-start">
          <Logo url="/" />
        </div>
        <div className="flex flex-1 items-center justify-center py-12 sm:py-16 lg:py-8">
          <div className="w-full max-w-[390px]">
            <SignInForm />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground sm:text-left">
          © {new Date().getFullYear()} FinDrive. Your money, in motion.
        </p>
      </section>

      <aside className="auth-hero relative isolate flex min-h-[610px] overflow-hidden lg:min-h-svh">
        <div className="auth-hero-grid absolute inset-0" aria-hidden="true" />
        <div className="auth-glow auth-glow-one" aria-hidden="true" />
        <div className="auth-glow auth-glow-two" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex w-full max-w-[760px] flex-col justify-center px-6 py-12 sm:px-10 sm:py-14 xl:px-16">
          <div className="mb-9 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium tracking-wide text-emerald-100/90">
            <Sparkles className="size-3.5 text-emerald-300" aria-hidden="true" />
            FINANCES, WITH CLARITY
          </div>

          <h1 className="max-w-xl text-3xl font-semibold leading-[1.12] tracking-[-0.04em] text-white sm:text-4xl xl:text-[48px]">
            Take control of your{" "}
            <span className="auth-heading-accent">finances.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300/75 xl:text-[17px]">
            Smart insights, effortless tracking, and better financial decisions
            — all in one place.
          </p>

          <div className="auth-dashboard relative mt-8 sm:mt-10" aria-hidden="true">
            <div className="auth-dashboard-top flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-300/10 bg-emerald-400/10 text-emerald-300">
                  <Wallet className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Your overview</p>
                  <p className="mt-0.5 text-xs text-slate-400">A snapshot of your money</p>
                </div>
              </div>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] text-slate-300">
                THIS MONTH
              </span>
            </div>

            <div className="auth-metric-grid mt-5 grid grid-cols-2 gap-3">
              <div className="auth-glass-card auth-float-slow rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Monthly savings</span>
                  <CircleDollarSign className="size-4 text-emerald-300" />
                </div>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[25px] font-semibold tracking-tight text-white">
                      ₹24,850
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-300">
                      <ArrowUpRight className="size-3" />
                      12.8% <span className="text-slate-500">vs last month</span>
                    </p>
                  </div>
                  <div className="flex h-10 items-end gap-1 pb-0.5">
                    {[35, 52, 41, 70, 57, 88, 74, 100].map((height, index) => (
                      <span
                        key={index}
                        className="w-1.5 rounded-full bg-emerald-400/70"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="auth-glass-card auth-float-fast rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Spending plan</span>
                  <span className="text-[11px] text-slate-500">68% used</span>
                </div>
                <p className="mt-3 text-[25px] font-semibold tracking-tight text-white">
                  ₹18,420
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300" />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">of ₹27,000 monthly budget</p>
              </div>
            </div>

            <div className="auth-glass-card mt-3 rounded-2xl p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Income & spending</p>
                  <p className="mt-1 text-xs text-slate-500">Your cash flow, at a glance</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <i className="size-1.5 rounded-full bg-emerald-300" />
                    Income
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="size-1.5 rounded-full bg-amber-300" />
                    Spending
                  </span>
                </div>
              </div>
              <svg
                className="mt-3 h-[125px] w-full overflow-visible"
                viewBox="0 0 560 130"
                fill="none"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="income-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity=".24" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[24, 58, 92, 126].map((y) => (
                  <path
                    key={y}
                    d={`M0 ${y}H560`}
                    stroke="white"
                    strokeOpacity=".07"
                    strokeDasharray="3 6"
                  />
                ))}
                <path
                  d="M0 95 C40 87 48 73 82 79 S132 96 164 68 S218 69 247 56 S297 72 329 48 S379 58 411 35 S465 50 493 26 S532 37 560 14 V130 H0Z"
                  fill="url(#income-area)"
                />
                <path
                  d="M0 95 C40 87 48 73 82 79 S132 96 164 68 S218 69 247 56 S297 72 329 48 S379 58 411 35 S465 50 493 26 S532 37 560 14"
                  stroke="#6ee7b7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0 111 C42 105 54 98 82 100 S136 110 164 93 S215 101 247 84 S294 91 329 77 S382 90 411 68 S463 81 493 61 S530 70 560 54"
                  stroke="#fbbf24"
                  strokeOpacity=".72"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="493" cy="26" r="4" fill="#a7f3d0" />
                <circle cx="493" cy="26" r="8" fill="#34d399" fillOpacity=".18" />
              </svg>
              <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                <span>WEEK 1</span>
                <span>WEEK 2</span>
                <span>WEEK 3</span>
                <span>WEEK 4</span>
              </div>
            </div>

            <div className="auth-breakdown-card auth-float-slow absolute -right-5 top-[45%] hidden w-[184px] rounded-2xl p-4 xl:block">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-300/10 text-amber-200">
                  <ChartNoAxesCombined className="size-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-white">Top category</p>
                  <p className="text-[10px] text-slate-500">This month</p>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-xs text-slate-300">Essentials</span>
                <span className="text-xs font-medium text-white">₹8,240</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[62%] rounded-full bg-amber-300/80" />
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs text-slate-400/80">
            <ShieldCheck className="size-4 text-emerald-300/80" aria-hidden="true" />
            Thoughtful tools for a more confident financial life
          </div>
        </div>
      </aside>
    </main>
  );
};

export default SignIn;
