"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Info,
  Loader2,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/translations";
import { KarigariLogo } from "@/components/ui/KarigariLogo";
import { ProfileEditorModal } from "@/components/ProfileEditorModal";
import { PM_VISHWAKARMA_TRADES } from "@/lib/schemes";
import type {
  ApplicationStatus,
  ApplyMode,
  ProfileField,
  PublicRule,
  RuleFailure,
  SchemeKey,
} from "@/lib/schemes";
import { cn } from "@/lib/utils";

/** `catch` binds `unknown`; pull a message out of it without widening to `any`. */
function errorMessage(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

/* ------------------------------------------------------------------ */
/* Wire types (mirror of the /api/artisan/schemes response)            */
/* ------------------------------------------------------------------ */

type Verdict =
  | { status: "ELIGIBLE"; failed: []; selfDeclare: PublicRule[] }
  | { status: "INELIGIBLE"; failed: RuleFailure[]; selfDeclare: PublicRule[] }
  | {
      status: "INFO_NEEDED";
      missing: ProfileField[];
      failed: RuleFailure[];
      selfDeclare: PublicRule[];
    };

interface TrackedApplication {
  id: string;
  schemeKey: SchemeKey;
  schemeName: string;
  status: ApplicationStatus;
  appliedAt: string | null;
  notes: string | null;
  /** Server-set: the artisan no longer meets this scheme's criteria. */
  stale?: boolean;
}

interface EvaluatedScheme {
  key: SchemeKey;
  name: string;
  description: string;
  benefit: string;
  officialUrl: string;
  applyMode: ApplyMode;
  formPath?: string;
  note?: string;
  rules: PublicRule[];
  verdict: Verdict;
  application: TrackedApplication | null;
}

/** The subset of the artisan profile that ProfileEditorModal reads and writes. */
interface EditorProfile {
  name?: string | null;
  photoUrl?: string | null;
  mobileNumber?: string | null;
  aadhaarLast4?: string | null;
  socialCategory?: string | null;
  annualIncome?: number | null;
  upiId?: string | null;
  description?: string | null;
}

interface ProfileSummary {
  craftType: string | null;
  location: string | null;
  socialCategory: string | null;
  annualIncome: number | null;
  aadhaarLast4: string | null;
  upiId: string | null;
  clusterName: string | null;
  cooperativeId: string | null;
  hasListedItem: boolean;
  hasVerifiedItem: boolean;
}

/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<ApplicationStatus, { box: string; icon: React.ReactNode }> = {
  ELIGIBLE: { box: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle2 size={16} /> },
  APPLIED: { box: "bg-orange-50 text-orange-700 border-orange-200", icon: <Clock size={16} /> },
  UNDER_REVIEW: { box: "bg-orange-50 text-orange-700 border-orange-200", icon: <Clock size={16} /> },
  APPROVED: { box: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle2 size={16} /> },
  REJECTED: { box: "bg-red-50 text-red-700 border-red-200", icon: <AlertCircle size={16} /> },
  DISBURSED: { box: "bg-blue-50 text-blue-700 border-blue-200", icon: <Award size={16} /> },
};

export default function SchemesPage() {
  const { t } = useLanguage();

  const router = useRouter();

  const [schemes, setSchemes] = useState<EvaluatedScheme[]>([]);
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const [editorData, setEditorData] = useState<EditorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [expanded, setExpanded] = useState<SchemeKey | null>(null);
  const [applyTarget, setApplyTarget] = useState<EvaluatedScheme | null>(null);
  const [ticked, setTicked] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  /** `t()` returns the key itself when a language has no entry — fall back to server copy. */
  const tr = useCallback(
    (key: string, fallback: string) => {
      const v = t(key);
      return !v || v === key ? fallback : v;
    },
    [t]
  );

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const [schemeRes, dashRes] = await Promise.all([
        fetch("/api/artisan/schemes", { cache: "no-store" }),
        fetch("/api/artisan/dashboard", { cache: "no-store" }),
      ]);

      // A signed-in-but-unknown user (e.g. the database was re-seeded under a
      // live session) can never be fixed by retrying — send them to sign in.
      if (schemeRes.status === 401) {
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        router.replace("/login");
        return;
      }

      const data = await schemeRes.json();
      if (!schemeRes.ok || !data.success) {
        throw new Error(data.error || "Request failed");
      }
      setSchemes(data.schemes ?? []);
      setProfileSummary(data.profileSummary ?? null);

      if (dashRes.ok) {
        const dash = await dashRes.json();
        if (dash?.success) {
          setEditorData({ ...(dash.data.artisanProfile ?? {}), name: dash.data.artisanName });
        }
      }
    } catch (e) {
      console.error("Failed to load schemes", e);
      setLoadError(errorMessage(e, "unknown"));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Deferred by a macrotask so the effect body performs no synchronous
    // setState (load() clears the error state on entry).
    const kickoff = setTimeout(load, 0);
    return () => clearTimeout(kickoff);
  }, [load]);

  // Escape closes the apply dialog and focus moves into it on open, so the
  // confirmation is reachable and escapable without a mouse.
  useEffect(() => {
    if (!applyTarget) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setApplyTarget(null);
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [applyTarget]);

  const eligible = useMemo(() => schemes.filter((s) => s.verdict.status === "ELIGIBLE"), [schemes]);
  // INFO_NEEDED first: those are the ones the artisan can actually unblock today.
  const blocked = useMemo(
    () =>
      schemes
        .filter((s) => s.verdict.status !== "ELIGIBLE")
        .sort((a, b) =>
          a.verdict.status === b.verdict.status ? 0 : a.verdict.status === "INFO_NEEDED" ? -1 : 1
        ),
    [schemes]
  );

  const openApply = (scheme: EvaluatedScheme) => {
    setApplyError(null);
    setTicked({});
    setApplyTarget(scheme);
  };

  const submitApply = async () => {
    if (!applyTarget) return;
    setSubmitting(true);
    setApplyError(null);
    try {
      const res = await fetch("/api/artisan/schemes/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemeKey: applyTarget.key, selfDeclarations: ticked }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setApplyError(data.error || "Could not record the application.");
        return;
      }
      setSchemes((prev) =>
        prev.map((s) => (s.key === applyTarget.key ? { ...s, application: data.application } : s))
      );
      setApplyTarget(null);
    } catch (e) {
      setApplyError(errorMessage(e, "Network error"));
    } finally {
      setSubmitting(false);
    }
  };

  const allTicked =
    !!applyTarget && applyTarget.verdict.selfDeclare.every((r) => ticked[r.id] === true);

  /* ---------------------------------------------------------------- */

  const header = (
    <header className="px-4 sm:px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-40 flex items-center justify-between">
      <div className="flex items-center gap-4 min-w-0">
        <Link
          href="/artisan/dashboard"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors shrink-0"
          aria-label={tr("schemes_back_to_dashboard", "Back to dashboard")}
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl font-serif font-bold text-gray-900 truncate">
            {tr("schemes_title", "Government Schemes")}
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">
            {tr("schemes_page_subtitle", "Checked against published eligibility criteria — not a guess.")}
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <KarigariLogo variant="dark" showWordmark={true} size={28} />
      </div>
    </header>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans pb-16">
        {header}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8" aria-busy="true">
          <div className="h-32 rounded-2xl bg-gray-200 animate-pulse mb-8" />
          <div className="h-5 w-48 rounded bg-gray-200 animate-pulse mb-4" />
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-gray-100 border border-gray-200 animate-pulse" />
            ))}
          </div>
          <p className="sr-only">{tr("schemes_loading", "Checking your eligibility...")}</p>
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans pb-16">
        {header}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-6">
            {tr("schemes_error", "Could not load schemes. Please try again.")}
          </p>
          <button
            onClick={() => {
              setLoading(true);
              load();
            }}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-colors"
          >
            {tr("schemes_retry", "Retry")}
          </button>
        </main>
      </div>
    );
  }

  const income = profileSummary?.annualIncome;
  const missingCategory = !profileSummary?.socialCategory;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-16">
      {header}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* ---------------- Profile banner (all values from the DB) --------------- */}
        <section className="bg-primary text-white p-6 rounded-2xl shadow-sm mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center shrink-0">
              <ShieldCheck size={28} className="text-green-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-serif font-bold mb-3">
                {tr("schemes_profile_title", "Your eligibility profile")}
              </h2>
              <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-white/60 text-xs uppercase tracking-wide">
                    {tr("schemes_profile_aadhaar", "Aadhaar")}
                  </dt>
                  <dd className="font-mono font-bold">
                    {profileSummary?.aadhaarLast4
                      ? `•••• ${profileSummary.aadhaarLast4}`
                      : tr("schemes_not_set", "Not set")}
                  </dd>
                </div>
                <div>
                  <dt className="text-white/60 text-xs uppercase tracking-wide">
                    {tr("schemes_profile_income", "Declared annual income")}
                  </dt>
                  <dd className="font-bold">
                    {typeof income === "number"
                      ? `₹${income.toLocaleString("en-IN")}`
                      : tr("schemes_not_set", "Not set")}
                  </dd>
                </div>
                <div>
                  <dt className="text-white/60 text-xs uppercase tracking-wide">
                    {tr("schemes_profile_category", "Social category")}
                  </dt>
                  <dd className="font-bold">
                    {profileSummary?.socialCategory ?? tr("schemes_not_set", "Not set")}
                  </dd>
                </div>
                <div>
                  <dt className="text-white/60 text-xs uppercase tracking-wide">
                    {tr("schemes_profile_craft", "Craft")}
                  </dt>
                  <dd className="font-bold truncate">
                    {profileSummary?.craftType ?? tr("schemes_not_set", "Not set")}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="shrink-0 bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              <UserCheck size={14} />
              {eligible.length}/{schemes.length}
            </div>
          </div>
        </section>

        {missingCategory && (
          <button
            onClick={() => setProfileOpen(true)}
            className="w-full mb-8 flex items-center gap-3 text-left bg-yellow-50 border border-yellow-200 text-yellow-800 px-5 py-4 rounded-2xl hover:bg-yellow-100 transition-colors"
          >
            <Info size={20} className="shrink-0" />
            <span className="flex-1 text-sm font-medium">
              {tr("schemes_category_prompt", "Complete your profile to unlock SC/OBC schemes")}
            </span>
            <span className="shrink-0 text-sm font-bold underline">
              {tr("schemes_complete_profile", "Complete profile")}
            </span>
          </button>
        )}
        {!missingCategory && <div className="mb-8" />}

        {/* ------------------------- Eligible ------------------------- */}
        <div className="mb-4">
          <h3 className="text-lg font-serif font-bold text-gray-900">
            {tr("schemes_eligible_heading", "Eligible for you")} ({eligible.length})
          </h3>
          <p className="text-sm text-gray-500">
            {tr("schemes_eligible_sub", "Every criterion below was checked against your saved profile.")}
          </p>
        </div>

        {eligible.length === 0 ? (
          <p className="bg-white border border-gray-200 rounded-2xl p-6 text-sm text-gray-500 mb-10">
            {tr(
              "schemes_none_eligible",
              "No scheme matches your profile yet. Clear the blockers below to unlock them."
            )}
          </p>
        ) : (
          <div className="space-y-4 mb-10">
            {eligible.map((s) => (
              <SchemeCard
                key={s.key}
                scheme={s}
                tr={tr}
                expanded={expanded === s.key}
                onToggle={() => setExpanded(expanded === s.key ? null : s.key)}
                onApply={() => openApply(s)}
                onCompleteProfile={() => setProfileOpen(true)}
              />
            ))}
          </div>
        )}

        {/* --------------------- Not yet eligible --------------------- */}
        <div className="mb-4">
          <h3 className="text-lg font-serif font-bold text-gray-900">
            {tr("schemes_not_eligible_heading", "Not yet eligible")} ({blocked.length})
          </h3>
          <p className="text-sm text-gray-500">
            {tr("schemes_not_eligible_sub", "Here is exactly what is blocking each one.")}
          </p>
        </div>

        {blocked.length === 0 ? (
          <p className="bg-white border border-gray-200 rounded-2xl p-6 text-sm text-gray-500">
            {tr("schemes_none_blocked", "Nothing is blocked — you qualify for every scheme we track.")}
          </p>
        ) : (
          <div className="space-y-4">
            {blocked.map((s) => (
              <SchemeCard
                key={s.key}
                scheme={s}
                tr={tr}
                expanded={expanded === s.key}
                onToggle={() => setExpanded(expanded === s.key ? null : s.key)}
                onApply={() => openApply(s)}
                onCompleteProfile={() => setProfileOpen(true)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ------------------------- Apply modal ------------------------- */}
      {applyTarget && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label={tr("schemes_modal_title", "Confirm before you apply")}
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] outline-none"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start gap-4 bg-gray-50 shrink-0">
              <div className="min-w-0">
                <h2 className="font-serif font-bold text-lg text-primary">
                  {tr("schemes_modal_title", "Confirm before you apply")}
                </h2>
                <p className="text-xs text-gray-500 truncate">
                  {tr(`scheme_${applyTarget.key}_name`, applyTarget.name)}
                </p>
              </div>
              <button
                onClick={() => setApplyTarget(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 shrink-0"
                aria-label={tr("schemes_modal_cancel", "Cancel")}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <p className="text-sm text-gray-600">
                {tr(
                  "schemes_modal_intro",
                  "These points cannot be checked from your KARIGARI profile. Tick each one only if it is true for you."
                )}
              </p>

              <div className="space-y-2">
                {applyTarget.verdict.selfDeclare.map((rule) => (
                  <label
                    key={rule.id}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={ticked[rule.id] === true}
                      onChange={(e) => setTicked({ ...ticked, [rule.id]: e.target.checked })}
                      className="mt-0.5 w-4 h-4 accent-[var(--color-primary)] shrink-0"
                    />
                    <span className="text-sm text-gray-800">{tr(`rule_${rule.id}`, rule.label)}</span>
                  </label>
                ))}
                {applyTarget.verdict.selfDeclare.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    {tr("schemes_verified_from_profile", "Checked from your profile")}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs p-3 rounded-xl flex items-start gap-2">
                <Info size={14} className="shrink-0 mt-0.5" />
                <p>
                  {tr(
                    "schemes_modal_honesty",
                    "KARIGARI does not send anything to a government system. You submit the application yourself on the official portal — this only records it in your tracker."
                  )}
                </p>
              </div>

              {applyError && (
                <p className="text-sm text-red-600 font-medium flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  {applyError}
                </p>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-wrap justify-end gap-3 shrink-0">
              <button
                onClick={() => setApplyTarget(null)}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-colors"
              >
                {tr("schemes_modal_cancel", "Cancel")}
              </button>
              <button
                onClick={submitApply}
                disabled={!allTicked || submitting}
                title={!allTicked ? tr("schemes_modal_tick_all", "Tick every box to continue") : undefined}
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {tr("schemes_tracking", "Saving...")}
                  </>
                ) : (
                  tr("schemes_modal_confirm", "Confirm & track")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ProfileEditorModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        artisanData={editorData}
        onSaved={() => {
          setLoading(true);
          load();
        }}
      />
    </div>
  );
}

/* ================================================================== */
/* Card                                                                */
/* ================================================================== */

function SchemeCard({
  scheme,
  tr,
  expanded,
  onToggle,
  onApply,
  onCompleteProfile,
}: {
  scheme: EvaluatedScheme;
  tr: (key: string, fallback: string) => string;
  expanded: boolean;
  onToggle: () => void;
  onApply: () => void;
  onCompleteProfile: () => void;
}) {
  const { verdict, application } = scheme;
  const isEligible = verdict.status === "ELIGIBLE";
  const isInfoNeeded = verdict.status === "INFO_NEEDED";
  const status = application?.status ?? null;
  const tracked = status && status !== "ELIGIBLE" ? status : null;
  // History for a scheme the artisan no longer qualifies for must never render as
  // a green "Approved" / blue "Disbursed" success badge beside an ineligible
  // reason — that reads as a government outcome that did not happen.
  const staleTrack = tracked && application?.stale ? tracked : null;
  const liveTrack = tracked && !application?.stale ? tracked : null;
  // A rejected application is not a dead end: the API accepts a fresh attempt.
  const canApply = isEligible && (!liveTrack || liveTrack === "REJECTED");

  const formHref = scheme.formPath || scheme.officialUrl;

  return (
    <article
      className={cn(
        "bg-white rounded-2xl border shadow-sm transition-shadow",
        isEligible ? "border-l-4 border-l-green-500 border-gray-200 hover:shadow-md" : "border-gray-200"
      )}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-5 lg:items-start justify-between">
          <div className={cn("flex gap-4 min-w-0", !isEligible && "opacity-75")}>
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0 border",
                isEligible
                  ? "bg-green-50 border-green-200 text-green-600"
                  : isInfoNeeded
                    ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                    : "bg-gray-100 border-gray-200 text-gray-400"
              )}
            >
              {isEligible ? <CheckCircle2 size={22} /> : isInfoNeeded ? <Info size={22} /> : <FileText size={22} />}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="font-bold text-gray-900 text-base sm:text-lg">
                  {tr(`scheme_${scheme.key}_name`, scheme.name)}
                </h4>
                {isInfoNeeded && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded-full">
                    {tr("schemes_info_needed", "Info needed")}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 mb-3 max-w-xl">
                {tr(`scheme_${scheme.key}_desc`, scheme.description)}
              </p>

              {/* Green reads as "you have this". On a blocked card the benefit is
                  only what the scheme offers, so it stays neutral. */}
              <p
                className={cn(
                  "inline-flex px-3 py-1.5 rounded-lg text-xs font-bold border mb-3",
                  isEligible
                    ? "bg-green-50 text-green-800 border-green-100"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                )}
              >
                {tr("schemes_benefit", "Benefit")}: {tr(`scheme_${scheme.key}_benefit`, scheme.benefit)}
              </p>

              {/* --------- blockers, with the exact published reason --------- */}
              {!isEligible && verdict.failed.length > 0 && (
                <div
                  className={cn(
                    "rounded-xl p-3 mb-3 border text-sm",
                    isInfoNeeded
                      ? "bg-yellow-50 border-yellow-200 text-yellow-900"
                      : "bg-gray-50 border-gray-200 text-gray-700"
                  )}
                >
                  <p className="font-bold text-xs uppercase tracking-wider mb-2 opacity-70">
                    {tr("schemes_why_blocked", "Why not yet")}
                  </p>
                  <ul className="space-y-1.5">
                    {verdict.failed.map((f) => (
                      <li key={f.id}>
                        <span className="font-medium">{tr(`rule_${f.id}`, f.label)}</span>
                        {(f.needed || f.actual) && (
                          <span className="block text-xs opacity-80">
                            {f.needed && (
                              <>
                                {tr("schemes_needs", "Needs")}: {tr(`need_${f.id}`, f.needed)}
                              </>
                            )}
                            {f.needed && f.actual && " · "}
                            {f.actual && (
                              <>
                                {tr("schemes_yours", "Yours")}: {f.actual}
                              </>
                            )}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {scheme.note && (
                <p className="text-xs text-gray-500 flex items-start gap-1.5 mb-3 max-w-xl">
                  <Info size={12} className="shrink-0 mt-0.5" />
                  {tr(`scheme_${scheme.key}_note`, scheme.note)}
                </p>
              )}

              {tracked && application?.notes && (
                <p className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-xs text-gray-600">
                  {application.notes}
                </p>
              )}

              <button
                onClick={onToggle}
                aria-expanded={expanded}
                className="mt-3 text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                {expanded
                  ? tr("schemes_hide_criteria", "Hide criteria")
                  : tr("schemes_show_criteria", "Show criteria")}
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {/* -------------------------- actions -------------------------- */}
          <div className="flex flex-col gap-2 lg:min-w-[190px] shrink-0">
            {liveTrack ? (
              <div
                className={cn(
                  "w-full py-3 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border text-sm",
                  STATUS_STYLES[liveTrack].box
                )}
              >
                {STATUS_STYLES[liveTrack].icon}
                {tr(`schemes_status_${liveTrack}`, liveTrack.replace(/_/g, " "))}
              </div>
            ) : null}

            {staleTrack ? (
              <div className="w-full py-2.5 px-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-xs text-center leading-snug">
                <span className="font-bold block">
                  {tr(`schemes_status_${staleTrack}`, staleTrack.replace(/_/g, " "))}
                </span>
                {tr(
                  "schemes_stale_note",
                  "Recorded earlier — you no longer meet the current criteria"
                )}
              </div>
            ) : null}

            {isEligible && (
              <>
                <a
                  href={scheme.applyMode === "DIRECT" ? scheme.officialUrl : formHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary hover:bg-primary-dark text-white w-full py-3 rounded-xl font-bold shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {scheme.applyMode === "DIRECT" ? (
                    <>
                      <ExternalLink size={15} />
                      {tr("schemes_direct_apply", "Direct Apply")}
                    </>
                  ) : (
                    <>
                      <Download size={15} />
                      {tr("schemes_download_form", "Download Form")}
                    </>
                  )}
                </a>
                <p className="text-[11px] text-gray-500 text-center leading-snug">
                  {tr("schemes_opens_portal", "Opens the official government portal")}
                </p>
                {canApply && (
                  <button
                    onClick={onApply}
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 w-full py-2.5 rounded-xl font-bold shadow-sm transition-colors text-sm"
                  >
                    {tr("schemes_track", "Track application")}
                  </button>
                )}
              </>
            )}

            {isInfoNeeded && (
              <button
                onClick={onCompleteProfile}
                className="bg-yellow-500 hover:bg-yellow-600 text-white w-full py-3 rounded-xl font-bold shadow-sm transition-colors text-sm"
              >
                {tr("schemes_complete_profile", "Complete profile")}
              </button>
            )}

            {!isEligible && (
              <a
                href={scheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-gray-500 hover:text-primary text-center underline flex items-center justify-center gap-1"
              >
                <ExternalLink size={11} />
                {tr("schemes_opens_portal", "Opens the official government portal")}
              </a>
            )}
          </div>
        </div>

        {/* --------------------- criteria disclosure --------------------- */}
        {expanded && (
          <div className="mt-5 pt-5 border-t border-gray-200">
            <p className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">
              {tr("schemes_criteria", "Eligibility criteria")}
            </p>
            <ul className="space-y-2">
              {scheme.rules.map((rule) => {
                const failure = verdict.failed.find((f) => f.id === rule.id);
                return (
                  <li key={rule.id} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 shrink-0">
                      {!rule.verifiable ? (
                        <UserCheck size={15} className="text-gray-400" />
                      ) : failure ? (
                        <AlertCircle size={15} className="text-red-500" />
                      ) : (
                        <CheckCircle2 size={15} className="text-green-600" />
                      )}
                    </span>
                    <span className="text-gray-700">
                      {tr(`rule_${rule.id}`, rule.label)}
                      <span className="block text-[11px] text-gray-400">
                        {rule.verifiable
                          ? tr("schemes_verified_from_profile", "Checked from your profile")
                          : tr("schemes_self_declared", "You declare this when applying")}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>

            {scheme.key === "pm_vishwakarma" && (
              <div className="mt-4">
                <p className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">
                  {tr("schemes_18_trades", "The 18 notified PM Vishwakarma trades")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PM_VISHWAKARMA_TRADES.map((trade) => (
                    <span
                      key={trade}
                      className="text-[11px] bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      {trade}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
