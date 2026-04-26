"use client";

import { useEffect, useRef, type ReactNode } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import {
  Shield,
  Lock,
  Server,
  FileCheck,
  Scale,
  Briefcase,
  HardHat,
  Home,
  HeartPulse,
  FileText,
  ChevronDown,
  Clock,
  TrendingUp,
  Target,
  CheckCircle2,
  Mail,
  Calendar,
  Building2,
  Star,
  Users,
} from "lucide-react";

/* ─── Scroll-reveal hooks ─────────────────────────────────────────────────── */

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("reveal-visible");
          el.classList.remove("reveal-hidden");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    el.classList.add("reveal-hidden");
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return ref;
}

function useScrollRevealWithDelay(delayMs: number) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add("reveal-visible");
            el.classList.remove("reveal-hidden");
          }, delayMs);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    el.classList.add("reveal-hidden");
    observer.observe(el);

    return () => observer.disconnect();
  }, [delayMs]);

  return ref;
}

/* ─── FAQ data ────────────────────────────────────────────────────────────── */

const faqItems = [
  {
    question: "Is this legal advice?",
    answer:
      "No. CaseSift provides AI-generated case assessments for decision-support purposes only. Our reports are designed to inform your professional judgement — they do not constitute legal advice and should not be relied upon as such. All case decisions remain the responsibility of the instructed solicitor.",
  },
  {
    question: "How long does an assessment take?",
    answer:
      "Professional plan assessments are typically completed within 1 hour of uploading your case documents. Starter plan assessments are delivered within 4 hours. Complex cases with extensive evidence may take slightly longer. You will receive an email notification as soon as your report is ready.",
  },
  {
    question: "What case types do you support?",
    answer:
      "CaseSift currently supports Personal Injury, Clinical Negligence, Employment, Contract Disputes, and Housing Disrepair cases. We are actively expanding our coverage — if your practice area is not listed, please contact us to register your interest.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. All documents are encrypted in transit and at rest using AES-256 encryption. Data is stored exclusively on UK-based servers. Each firm's data is completely isolated — no other firm can access your information. We are fully compliant with UK GDPR and the Data Protection Act 2018.",
  },
  {
    question: "Can I try it before subscribing?",
    answer:
      "Yes. Our Starter plan includes 2 free case assessments with no credit card required. You receive the same full detailed report as our Professional plan — the only difference is a 4-hour turnaround instead of 1 hour. This allows you to evaluate the quality on real cases before committing.",
  },
  {
    question: "How accurate are the predictions?",
    answer:
      "Our proprietary assessment engine is continuously refined and tested against real case outcomes. Whilst no prediction system is infallible, our internal analysis shows strong correlation between predicted and actual outcomes. Each report includes a confidence score so you can calibrate your reliance accordingly.",
  },
];

/* ─── Local sub-components ───────────────────────────────────────────────── */

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className="rounded-xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        {step}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function ProblemCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className="rounded-xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function SolutionCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className="rounded-xl border border-border bg-slate-50 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-primary">
        {number}
      </p>
      <h3 className="mt-3 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function CaseTypeCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className="rounded-xl border border-border bg-slate-50 p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="mt-3 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function ReportPreviewMockup() {
  return (
    <div className="max-w-md rounded-2xl border border-border bg-white p-8 shadow-xl rotate-1">
      {/* Header */}
      <div className="border-b border-border pb-4 mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
          CaseSift Assessment Report
        </p>
        <p className="text-sm font-semibold text-foreground">
          Road Traffic Accident — Whiplash
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">14 April 2026</p>
      </div>

      {/* Predicted outcome */}
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Predicted Outcome
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 rounded-full bg-primary/20">
            <div
              className="h-3 rounded-full bg-primary animate-[pulse-slow_2s_ease-in-out_infinite]"
              style={{ width: "74%" }}
            />
          </div>
          <span className="text-sm font-semibold text-primary whitespace-nowrap">
            74% Likely to Succeed
          </span>
        </div>
      </div>

      {/* Recommendation + Confidence */}
      <div className="mb-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Recommendation
          </p>
          <p className="text-sm font-semibold text-green-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Proceed with CFA
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Confidence
          </p>
          <p className="text-sm font-semibold text-foreground">High (74%)</p>
        </div>
      </div>

      {/* Damages */}
      <div className="mb-5 rounded-lg bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
          Estimated Damages Range
        </p>
        <p className="text-xl font-bold text-foreground">£8,500 — £14,200</p>
        <p className="text-xs text-muted-foreground mt-1">
          Based on current Judicial College Guidelines &amp; comparables
        </p>
      </div>

      {/* Strengths */}
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Key Strengths
        </p>
        <ul className="space-y-1.5">
          {[
            "Clear liability — rear-end collision",
            "Medical evidence supports claim",
            "Within limitation period",
          ].map((s) => (
            <li key={s} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Weaknesses */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Key Weaknesses
        </p>
        <ul className="space-y-1.5">
          {["Pre-existing condition (minor)", "Gap in treatment records"].map(
            (w) => (
              <li key={w} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-0.5 text-red-500 font-bold shrink-0">✕</span>
                {w}
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  support,
}: {
  value: string;
  label: string;
  support?: string;
}) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="p-8 text-center">
      <p className="text-4xl font-bold text-primary md:text-5xl">{value}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{label}</p>
      {support && (
        <p className="mt-1 text-xs text-muted-foreground">{support}</p>
      )}
    </div>
  );
}

function PricingCard({
  tier,
  price,
  period,
  description,
  features,
  cta,
  ctaHref,
  highlighted,
}: {
  tier: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
}) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className={
        highlighted
          ? "relative rounded-2xl border-2 border-primary bg-white p-8 shadow-xl ring-2 ring-primary/20 transition-all duration-300 hover:shadow-2xl"
          : "rounded-2xl border border-border bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg"
      }
    >
      {highlighted && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground whitespace-nowrap">
          Most Popular
        </span>
      )}
      <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {tier}
      </p>
      <div className="mt-4 flex items-end gap-1">
        <span className="text-4xl font-bold text-foreground">{price}</span>
        {period && (
          <span className="mb-1 text-lg text-muted-foreground">{period}</span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <ul className="mt-8 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <span className="text-foreground">{f}</span>
          </li>
        ))}
      </ul>
      <a
        href={ctaHref}
        className={
          highlighted
            ? "mt-8 block rounded-md bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            : "mt-8 block rounded-md border border-border py-3 text-center text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        }
      >
        {cta}
      </a>
    </div>
  );
}

/* PLACEHOLDER TESTIMONIALS — Replace with real testimonials when available */
function TestimonialCard({
  quote,
  attribution,
}: {
  quote: string;
  attribution: string;
}) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className="rounded-xl border border-border bg-slate-50 p-8"
    >
      {/* Star rating */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      {/* Decorative quotation mark */}
      <div className="text-6xl leading-none text-primary/10 font-serif select-none -mt-2 mb-2">
        &ldquo;
      </div>
      <p className="text-sm leading-relaxed text-foreground italic">{quote}</p>
      <p className="mt-4 text-sm font-semibold text-muted-foreground">
        — {attribution}
      </p>
    </div>
  );
}

function TrustCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className="rounded-xl border border-border bg-white p-6 transition-all duration-300 hover:shadow-md"
    >
      <div className="mb-4 h-10 w-10 text-primary">{icon}</div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-[Inter,system-ui,sans-serif] scroll-smooth">

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-primary">CaseSift</span>
          <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
            <a href="#contact" className="transition-colors hover:text-foreground">
              Contact
            </a>
          </div>
          <a
            href="mailto:info@casesift.co.uk?subject=CaseSift Access Request"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Sign In
          </a>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-4xl overflow-hidden px-6 pb-28 pt-20 text-center">
        {/* Geometric radial accent */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(30,58,95,0.06) 0%, rgba(30,58,95,0.02) 50%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        <div
          className="mb-6 inline-flex items-center rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm"
          style={{ animation: "fade-in-up 0.6s ease-out both" }}
        >
          Built for UK solicitors
        </div>

        <h1
          className="text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          style={{ animation: "fade-in-up 0.6s ease-out 0.1s both" }}
        >
          Know if a case is worth
          <br />
          <span className="text-primary">taking on — before you commit</span>
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
          style={{ animation: "fade-in-up 0.6s ease-out 0.2s both" }}
        >
          Stop spending hours on initial case assessment. Upload your evidence
          and within hours receive a predicted outcome, estimated damages
          range, and a clear take-on or reject recommendation — so you can
          focus your time on the cases that will actually win.
        </p>

        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          style={{ animation: "fade-in-up 0.6s ease-out 0.3s both" }}
        >
          <a
            href="mailto:info@casesift.co.uk?subject=CaseSift Access Request"
            className="rounded-md bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            Request Access
          </a>
          <a
            href="#how-it-works"
            className="rounded-md border border-border px-8 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            How It Works
          </a>
        </div>

        <p
          className="mt-8 text-sm text-muted-foreground"
          style={{ animation: "fade-in-up 0.6s ease-out 0.4s both" }}
        >
          Trusted by personal injury, clinical negligence, and employment law
          firms across England &amp; Wales
        </p>
      </section>

      {/* ── Problem Section ───────────────────────────────────────────────── */}
      <section id="features" className="border-t border-border bg-slate-50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              The Challenge
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Case Assessment Takes Too Long
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Every week, solicitors spend hours evaluating cases that will
              never proceed — time that could be spent on matters that actually
              generate revenue.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <ProblemCard
              icon={<Clock className="h-8 w-8" />}
              title="Hours Wasted on Dead-End Cases"
              description="Initial case review — reading statements, checking liability, estimating quantum — routinely takes three to four hours per matter, even for cases that are ultimately rejected."
            />
            <ProblemCard
              icon={<Scale className="h-8 w-8" />}
              title="CFA Risk Exposure"
              description="Taking on a losing case under a Conditional Fee Agreement means unrecoverable disbursements, lost fee-earner time, and reputational cost. The stakes of a poor assessment are high."
            />
            <ProblemCard
              icon={<Target className="h-8 w-8" />}
              title="No Reliable Screening Tool"
              description="Current assessment relies on experience and manual review. There is no systematic method to stress-test a case against relevant law before committing firm resources."
            />
          </div>
        </div>
      </section>

      {/* ── Solution Section ──────────────────────────────────────────────── */}
      <section className="border-t border-border bg-white py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              The Solution
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Free Up Your Team. Cut Assessment Costs.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Stop paying for hours of junior solicitor time on cases that
              go nowhere. CaseSift delivers the same rigorous screening at a
              fraction of the cost — freeing your team to focus on billable work.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <SolutionCard
              number="01"
              title="Predicted Outcome"
              description="Our proprietary assessment engine analyses your evidence against relevant UK law and precedent to predict the likely result on the balance of probabilities."
            />
            <SolutionCard
              number="02"
              title="Estimated Damages Range"
              description="Receive a quantified damages estimate — informed by current guidelines and comparable awards — so you can evaluate the commercial viability before committing."
            />
            <SolutionCard
              number="03"
              title="Clear Recommendation"
              description="A take-on or reject recommendation with a confidence score, giving you the structured information you need to make a fast, defensible decision."
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-border bg-slate-50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              How It Works
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              How CaseSift Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Three simple steps from evidence to recommendation. Our advanced
              AI analysis handles the heavy lifting — you stay in control.
            </p>
          </div>

          <div className="relative mt-16 grid gap-8 md:grid-cols-3">
            {/* Connecting dashed line (desktop only) */}
            <div
              className="absolute left-1/3 right-1/3 top-5 hidden border-t-2 border-dashed border-primary/20 md:block"
              aria-hidden="true"
            />
            <StepCard
              step="1"
              title="Upload Evidence"
              description="Upload case documents, witness statements, medical reports — whatever you have. Describe what the client wants and the basis of the claim."
            />
            <StepCard
              step="2"
              title="AI Analyses Your Case"
              description="Our proprietary assessment engine reviews your evidence against relevant UK law, tests the strengths and weaknesses of the claim, and determines the most likely outcome."
            />
            <StepCard
              step="3"
              title="Get Your Report"
              description="Within hours, not days: predicted outcome, estimated damages range, confidence score, and a clear take-on or reject recommendation."
            />
          </div>
        </div>
      </section>

      {/* ── Case Types Supported ──────────────────────────────────────────── */}
      <section id="case-types" className="border-t border-border bg-white py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              Practice Areas
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Case Types Supported
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              CaseSift is purpose-built for the practice areas where rapid,
              accurate assessment has the greatest commercial impact.
            </p>
          </div>
          <div className="mt-14 grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <CaseTypeCard
              icon={<HardHat className="h-10 w-10" />}
              title="Personal Injury"
              description="Road traffic accidents, workplace injuries, slips and trips, and public liability claims."
            />
            <CaseTypeCard
              icon={<HeartPulse className="h-10 w-10" />}
              title="Clinical Negligence"
              description="Surgical errors, misdiagnosis, delayed treatment, and birth injury claims against NHS and private providers."
            />
            <CaseTypeCard
              icon={<Briefcase className="h-10 w-10" />}
              title="Employment"
              description="Unfair dismissal, discrimination, whistleblowing, and constructive dismissal claims."
            />
            <CaseTypeCard
              icon={<FileText className="h-10 w-10" />}
              title="Contract Disputes"
              description="Breach of contract, commercial agreements, partnership disputes, and professional negligence."
            />
            <CaseTypeCard
              icon={<Home className="h-10 w-10" />}
              title="Housing"
              description="Disrepair claims, unlawful eviction, deposit disputes, and housing condition cases."
            />
          </div>
        </div>
      </section>

      {/* ── Report Preview Mockup ─────────────────────────────────────────── */}
      <section id="report-preview" className="border-t border-border bg-slate-50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid items-center gap-16 md:grid-cols-2">
            {/* Left: copy */}
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                Sample Output
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                See What You'll Receive
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Every assessment delivers a structured report with a predicted
                outcome, damages estimate, confidence score, and clear
                recommendation — everything you need to make a fast, informed
                decision.
              </p>
              <ul className="mt-8 space-y-3 text-sm">
                {[
                  "Predicted outcome with probability score",
                  "Estimated damages range with supporting rationale",
                  "CFA take-on recommendation",
                  "Key strengths and weaknesses of the claim",
                  "Delivered within 1 hour",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Right: mockup */}
            <div className="flex justify-center md:justify-end">
              <ReportPreviewMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Statistics / Metrics ──────────────────────────────────────────── */}
      <section id="metrics" className="border-t border-border bg-white py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              By the Numbers
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Results That Matter
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4 max-w-5xl mx-auto">
            <StatCard
              value="&lt; 1 hr"
              label="Average Assessment Time"
              support="From upload to full report"
            />
            <StatCard
              value="85%+"
              label="Prediction Accuracy*"
              support="Outcome correlation analysis"
            />
            <StatCard
              value="£2,400"
              label="Average Saved Per Case*"
              support="Vs. manual senior review"
            />
            <StatCard
              value="500+"
              label="Cases Assessed*"
              support="And growing every month"
            />
          </div>
          {/* Required disclaimer for illustrative statistics */}
          <p className="mt-8 text-center text-xs text-muted-foreground">
            * Illustrative figures. Individual results may vary.
          </p>
        </div>
      </section>

      {/* ── Pricing — 3 Tiers ─────────────────────────────────────────────── */}
      <section id="pricing" className="border-t border-border bg-slate-50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              Pricing
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Start free. Scale as your firm grows. Every plan includes our
              full assessment quality — no compromise.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3 items-start">
            <PricingCard
              tier="Starter"
              price="£0"
              period="/month"
              description="2 free case assessments — no credit card required."
              features={[
                "2 free case assessments",
                "Full detailed reports with rationale",
                "Estimated damages range",
                "CFA take-on recommendation",
                "Confidence scoring",
                "Reports within 4 hours",
                "Email support",
              ]}
              cta="Start Free"
              ctaHref="mailto:info@casesift.co.uk?subject=CaseSift Access Request"
            />
            <PricingCard
              tier="Professional"
              price="£400"
              period="/month"
              description="~20 case assessments per month for growing firms."
              features={[
                "~20 case assessments per month",
                "Full detailed reports with rationale",
                "Priority support",
                "Estimated damages range",
                "CFA take-on recommendation",
                "Confidence scoring",
                "Reports within 1 hour",
              ]}
              cta="Get Started"
              ctaHref="mailto:info@casesift.co.uk?subject=CaseSift Access Request"
              highlighted
            />
            <PricingCard
              tier="Enterprise"
              price="Custom"
              description="Unlimited access and dedicated support for large firms."
              features={[
                "Unlimited assessments",
                "Dedicated account manager",
                "API access for integration",
                "Custom integrations",
                "Service-level agreement (SLA)",
                "Priority processing",
                "Bespoke reporting",
              ]}
              cta="Contact Us"
              ctaHref="#contact"
            />
          </div>
        </div>
      </section>

      {/* ── Social Proof / Testimonials ───────────────────────────────────── */}
      {/* PLACEHOLDER TESTIMONIALS — Replace with real testimonials when available */}
      <section id="testimonials" className="border-t border-border bg-white py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              What Solicitors Say
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Trusted by Legal Professionals
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {/* PLACEHOLDER — Replace with real testimonial when available */}
            <TestimonialCard
              quote="CaseSift has transformed how we screen new matters. What used to take half a day now takes an hour, and the quality of assessment is remarkably thorough."
              attribution="Senior Partner, London PI Firm"
            />
            {/* PLACEHOLDER — Replace with real testimonial when available */}
            <TestimonialCard
              quote="The damages estimates have been consistently within range of eventual settlements. It's become an essential part of our case intake process."
              attribution="Head of Clinical Negligence, Regional Practice"
            />
            {/* PLACEHOLDER — Replace with real testimonial when available */}
            <TestimonialCard
              quote="We trialled it on cases we'd already assessed manually. The recommendations aligned with our senior partners' views in the vast majority of cases."
              attribution="Managing Partner, Employment Law Specialists"
            />
          </div>
        </div>
      </section>

      {/* ── Trust & Security ──────────────────────────────────────────────── */}
      <section id="trust" className="border-t border-border bg-slate-50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              Security &amp; Compliance
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Built for the Demands of Legal Practice
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Your clients' data is sensitive. CaseSift is designed from the
              ground up for the security, privacy, and regulatory standards
              that legal practice demands.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TrustCard
              icon={<Lock className="h-10 w-10" />}
              title="End-to-End Encryption"
              description="All documents encrypted in transit and at rest using AES-256. Your case data is never accessible to other firms."
            />
            <TrustCard
              icon={<Server className="h-10 w-10" />}
              title="UK Data Residency"
              description="All data stored on UK-based servers. Your information never leaves the jurisdiction."
            />
            <TrustCard
              icon={<Shield className="h-10 w-10" />}
              title="GDPR Compliant"
              description="Full compliance with UK GDPR and the Data Protection Act 2018. Data processing agreements available on request."
            />
            <TrustCard
              icon={<FileCheck className="h-10 w-10" />}
              title="SRA-Friendly Positioning"
              description="CaseSift is a decision-support tool, not a legal adviser. Designed to complement — not replace — qualified solicitor judgement."
            />
            <TrustCard
              icon={<Users className="h-10 w-10" />}
              title="Firm-Level Isolation"
              description="Each firm's data is completely isolated. No cross-firm access, no shared data, no data commingling."
            />
            <TrustCard
              icon={<Scale className="h-10 w-10" />}
              title="Not Legal Advice"
              description="CaseSift provides AI-generated assessments for decision support only. All outputs require professional review before acting."
            />
          </div>
        </div>
      </section>

      {/* ── FAQ Accordion ─────────────────────────────────────────────────── */}
      <section id="faq" className="border-t border-border bg-white py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              FAQ
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Everything you need to know before getting started.
            </p>
          </div>

          <div className="mt-14 max-w-3xl mx-auto">
            <Accordion.Root type="single" collapsible className="space-y-3">
              {faqItems.map((item, i) => (
                <Accordion.Item
                  key={i}
                  value={`item-${i}`}
                  className="rounded-xl border border-border bg-white overflow-hidden"
                >
                  <Accordion.Trigger className="flex w-full items-center justify-between px-6 py-5 text-left text-base font-semibold text-foreground hover:bg-slate-50 transition-colors group">
                    {item.question}
                    <ChevronDown className="w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                  <Accordion.Content className="overflow-hidden data-[state=open]:animate-[accordion-down_0.3s_ease-out] data-[state=closed]:animate-[accordion-up_0.2s_ease-out]">
                    <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </div>
      </section>

      {/* ── Contact / CTA ─────────────────────────────────────────────────── */}
      <section id="contact" className="border-t border-border bg-primary py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            {/* Left: CTA copy */}
            <div>
              <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
                Ready to Transform Your Case Intake?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Join forward-thinking firms already using CaseSift to make
                faster, more confident case decisions.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="mailto:info@casesift.co.uk?subject=CaseSift Access Request"
                  className="rounded-md bg-white px-8 py-3.5 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-white/90"
                >
                  Request Access
                </a>
                <a
                  href="https://calendly.com/casesift"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-primary-foreground/30 px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  Book a Demo
                </a>
              </div>
            </div>

            {/* Right: contact details */}
            <div className="space-y-5">
              <a
                href="mailto:info@casesift.co.uk"
                className="flex items-center gap-3 text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              >
                <Mail className="h-5 w-5 shrink-0" />
                <span className="text-sm">info@casesift.co.uk</span>
              </a>
              <a
                href="https://calendly.com/casesift"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              >
                <Calendar className="h-5 w-5 shrink-0" />
                <span className="text-sm">Schedule a personalised demonstration</span>
              </a>
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <Building2 className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-primary-foreground">
                    CaseSift Ltd
                  </p>
                  <p className="text-xs text-primary-foreground/70">
                    Registered in England &amp; Wales
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-slate-50 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Column 1: Brand */}
            <div>
              <span className="text-lg font-bold text-primary">CaseSift</span>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                AI-powered case assessment for UK solicitors. Faster decisions,
                better outcomes.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                CaseSift Ltd — Registered in England &amp; Wales
              </p>
            </div>

            {/* Column 2: Quick links */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-4">
                Quick Links
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="transition-colors hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="transition-colors hover:text-foreground">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#faq" className="transition-colors hover:text-foreground">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#contact" className="transition-colors hover:text-foreground">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal / Contact */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-4">
                Legal &amp; Contact
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="mailto:info@casesift.co.uk"
                    className="transition-colors hover:text-foreground"
                  >
                    info@casesift.co.uk
                  </a>
                </li>
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                CaseSift provides AI-generated case assessments for decision
                support only. It does not constitute legal advice. Always rely
                on qualified solicitor judgement for final case decisions.
              </p>
            </div>
          </div>

          <div className="mt-10 border-t border-border pt-6">
            <p className="text-center text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} CaseSift Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
