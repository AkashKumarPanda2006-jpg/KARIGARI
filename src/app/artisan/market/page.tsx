"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Globe,
  Package,
  Store,
  CheckCircle2,
  Loader2,
  Pencil,
  Camera,
  MapPin,
  CalendarDays,
  AlertTriangle,
  ExternalLink,
  Code2,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/lib/translations";
import { KarigariLogo } from "@/components/ui/KarigariLogo";
import { CaptureModal } from "@/components/CaptureModal";
import { cn } from "@/lib/utils";
import { getListingPrice } from "@/lib/pricing";

interface Listing {
  id: string;
  craftType: string;
  patchId: string | null;
  status: string;
  images: string[];
  descriptionOriginal: string | null;
  descriptionEnglish: string | null;
  aiGeneratedListing: string | null;
  marketPriceMin: number | null;
  marketPriceMax: number | null;
  fairWageFloor: number | null;
  standardMarketPrice: number | null;
  askingPrice: number | null;
  salePrice: number | null;
  isListedOnMarketplace: boolean;
  createdAt: string;
}

interface BoardDemand {
  id: string;
  craftType: string;
  quantity: number;
  targetPriceMin: number | null;
  targetPriceMax: number | null;
  location: string | null;
  festival: string | null;
  buyerName: string | null;
  notes: string | null;
}

type Tab = "listings" | "ondc" | "b2b";

/** Only the parts of the Beckn `on_search` payload this panel reports on. */
interface BecknCatalog {
  context?: { domain?: string; core_version?: string; bpp_id?: string };
  message?: {
    catalog?: {
      "bpp/providers"?: { id: string; items?: unknown[] }[];
    };
  };
}

function rupees(value?: number | null): string {
  return value || value === 0 ? `₹${value.toLocaleString("en-IN")}` : "—";
}

export default function MarketPage() {
  const { t } = useLanguage();

  const [tab, setTab] = useState<Tab>("listings");
  const [listings, setListings] = useState<Listing[]>([]);
  const [drafts, setDrafts] = useState<Listing[]>([]);
  const [demands, setDemands] = useState<BoardDemand[]>([]);
  const [craftType, setCraftType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [captureOpen, setCaptureOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftEnglish, setDraftEnglish] = useState("");
  const [draftLocal, setDraftLocal] = useState("");
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  // The Beckn catalog this node broadcasts. Loaded lazily the first time the
  // ONDC tab is opened so the listings tab never pays for it.
  const [catalog, setCatalog] = useState<BecknCatalog | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(false);
  const [showCatalogJson, setShowCatalogJson] = useState(false);

  const load = useCallback(async () => {
    try {
      const [listingRes, demandRes, dashRes] = await Promise.all([
        fetch("/api/artisan/listings", { cache: "no-store" }),
        fetch("/api/demand?status=OPEN&limit=50", { cache: "no-store" }),
        fetch("/api/artisan/dashboard", { cache: "no-store" }),
      ]);

      if (listingRes.status === 401 || listingRes.status === 403) {
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        window.location.href = "/login";
        return;
      }

      const listingData = await listingRes.json();
      if (listingData.success) {
        setListings(listingData.listings ?? []);
        setDrafts(listingData.drafts ?? []);
      }

      const demandData = await demandRes.json();
      if (demandData.success) setDemands(demandData.demands ?? []);

      if (dashRes.ok) {
        const dash = await dashRes.json();
        if (dash?.success) setCraftType(dash.data?.artisanProfile?.craftType ?? null);
      }
    } catch (e) {
      console.error("Failed to load marketplace", e);
      setBanner({ tone: "error", text: t("market_load_failed") });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    // Deferred by a macrotask so the effect body performs no synchronous
    // setState — same pattern the schemes page uses.
    const kickoff = setTimeout(load, 0);
    return () => clearTimeout(kickoff);
  }, [load]);

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 6000);
    return () => clearTimeout(timer);
  }, [banner]);

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(false);
    try {
      const res = await fetch("/api/ondc/catalog", { cache: "no-store" });
      if (!res.ok) throw new Error(`ONDC catalog responded ${res.status}`);
      setCatalog(await res.json());
    } catch (e) {
      console.error("Failed to load ONDC catalog", e);
      setCatalogError(true);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab !== "ondc" || catalog || catalogLoading || catalogError) return;
    const kickoff = setTimeout(loadCatalog, 0);
    return () => clearTimeout(kickoff);
  }, [tab, catalog, catalogLoading, catalogError, loadCatalog]);

  const startEdit = (item: Listing) => {
    setEditingId(item.id);
    setDraftEnglish(item.aiGeneratedListing || item.descriptionEnglish || "");
    setDraftLocal(item.descriptionOriginal || "");
  };

  const saveEdit = async (itemId: string) => {
    if (!draftEnglish.trim()) {
      setBanner({ tone: "error", text: t("listing_english_required") });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/artisan/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          descriptionEnglish: draftEnglish,
          aiGeneratedListing: draftEnglish,
          descriptionOriginal: draftLocal,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setBanner({ tone: "error", text: data.error || t("listing_save_failed") });
        return;
      }
      const apply = (list: Listing[]) =>
        list.map((l) => (l.id === itemId ? { ...l, ...data.item } : l));
      setListings(apply);
      setDrafts(apply);
      setEditingId(null);
      setBanner({ tone: "ok", text: t("listing_saved") });
    } catch (e) {
      console.error("Failed to save listing", e);
      setBanner({ tone: "error", text: t("network_error_retry") });
    } finally {
      setSaving(false);
    }
  };

  const matchingDemands = useMemo(() => {
    const mine = (craftType || "").toLowerCase();
    if (!mine) return demands;
    const tokens = new Set(mine.split(/[^a-z0-9]+/).filter((w) => w.length >= 4));
    const score = (d: BoardDemand) => {
      const theirs = d.craftType.toLowerCase();
      if (theirs.includes(mine) || mine.includes(theirs)) return 2;
      return theirs.split(/[^a-z0-9]+/).some((w) => w.length >= 4 && tokens.has(w)) ? 1 : 0;
    };
    return [...demands].sort((a, b) => score(b) - score(a));
  }, [demands, craftType]);

  const liveCount = listings.filter((l) => l.isListedOnMarketplace).length;

  const providers = catalog?.message?.catalog?.["bpp/providers"] ?? [];
  const broadcastItems = providers.reduce((sum, p) => sum + (p.items?.length ?? 0), 0);

  const renderCard = (item: Listing, isDraft: boolean) => (
    <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-40 h-40 shrink-0 bg-gray-100">
          <Image
            src={item.images?.[0] || "/ikat_saree.jpg"}
            alt={item.craftType}
            fill
            className="object-cover"
            sizes="160px"
          />
        </div>

        <div className="flex-1 min-w-0 p-5">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 truncate">{item.craftType}</h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                {item.patchId || `#${item.id.slice(0, 8).toUpperCase()}`}
              </p>
            </div>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border shrink-0",
                item.isListedOnMarketplace
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-orange-50 text-orange-700 border-orange-200"
              )}
            >
              {item.isListedOnMarketplace ? t("live_on_ondc") : t("awaiting_qa")}
            </span>
          </div>

          <div className="text-sm font-bold text-gray-900 mb-1">
            {t("your_listing_price")}: {rupees(getListingPrice(item))}
          </div>
          <div className="text-xs text-gray-500 mb-3">
            {t("valuation")}: {rupees(item.marketPriceMin)} – {rupees(item.marketPriceMax)} ·{" "}
            {t("fair_wage_floor")}: {rupees(item.fairWageFloor)}
          </div>

          {editingId === item.id ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  {t("listing_english_title")} · {t("ondc_listing_tag")}
                </label>
                <textarea
                  value={draftEnglish}
                  onChange={(e) => setDraftEnglish(e.target.value)}
                  rows={4}
                  className="w-full text-xs text-gray-700 leading-relaxed bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  {t("listing_local_title")}
                </label>
                <textarea
                  value={draftLocal}
                  onChange={(e) => setDraftLocal(e.target.value)}
                  rows={3}
                  className="w-full text-xs text-gray-700 leading-relaxed bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => saveEdit(item.id)}
                  disabled={saving}
                  className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  {t("save_listing")}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-sm font-bold text-gray-500 hover:text-gray-800 px-3 transition-colors"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                {item.aiGeneratedListing || item.descriptionEnglish || (
                  <span className="italic text-gray-400">{t("no_listing_text")}</span>
                )}
              </p>
              {item.descriptionOriginal && (
                <p className="text-xs text-gray-500 italic mt-2 line-clamp-2">
                  “{item.descriptionOriginal}”
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <button
                  onClick={() => startEdit(item)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Pencil size={12} /> {t("edit_listing_text")}
                </button>
                {item.patchId && (
                  <Link
                    href={`/verify/${item.patchId}`}
                    className="text-xs font-bold text-gray-500 hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink size={12} /> {t("view_passport")}
                  </Link>
                )}
                {isDraft && (
                  <span className="text-[11px] text-gray-400">{t("draft_hint")}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-12">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/artisan/dashboard"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={t("back_to_dashboard")}
          >
            <ArrowLeft size={20} />
          </Link>
          <KarigariLogo variant="dark" showWordmark={true} size={28} />
        </div>
        <button
          onClick={() => setCaptureOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
        >
          <Camera size={16} /> {t("new_listing")}
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-primary flex items-center gap-3">
            <Globe size={28} /> {t("market_title")}
          </h1>
          <p className="text-gray-600 mt-2 text-lg">{t("market_subtitle")}</p>
        </div>

        {banner && (
          <div
            className={cn(
              "mb-6 px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 animate-fade-in-up",
              banner.tone === "ok"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            )}
          >
            {banner.tone === "ok" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {banner.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {([
            { key: "listings" as Tab, label: t("my_listings"), icon: <Package size={18} /> },
            { key: "ondc" as Tab, label: "ONDC", icon: <Store size={18} /> },
            { key: "b2b" as Tab, label: t("bulk_buyers"), icon: <Globe size={18} /> },
          ]).map((entry) => (
            <button
              key={entry.key}
              onClick={() => setTab(entry.key)}
              className={cn(
                "flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors",
                tab === entry.key
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              )}
            >
              {entry.icon} {entry.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 flex items-center justify-center text-gray-400">
            <Loader2 size={20} className="animate-spin" />
          </div>
        )}

        {/* ------------------------- My listings ------------------------- */}
        {!loading && tab === "listings" && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-5 flex flex-wrap items-center gap-6">
              <div>
                <div className="text-2xl font-bold text-gray-900">{liveCount}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {t("live_listings")}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{drafts.length}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {t("awaiting_qa")}
                </div>
              </div>
              <p className="text-xs text-gray-500 max-w-sm ml-auto leading-relaxed">
                {t("publish_explainer")}
              </p>
            </div>

            {listings.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                  {t("previous_listings")}
                </h2>
                {listings.map((item) => renderCard(item, false))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                <Package className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-gray-500 font-medium text-sm mb-4">{t("no_listings_yet")}</p>
                <button
                  onClick={() => setCaptureOpen(true)}
                  className="bg-primary hover:bg-primary-dark text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2"
                >
                  <Camera size={16} /> {t("new_listing")}
                </button>
              </div>
            )}

            {drafts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                  {t("awaiting_qa")}
                </h2>
                {drafts.map((item) => renderCard(item, true))}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------- ONDC ----------------------------- */}
        {!loading && tab === "ondc" && (
          <div className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden animate-fade-in-up">
            <div className="bg-[var(--color-mint)] p-6 border-b border-gray-100 flex justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-2">{t("ondc_title")}</h2>
                <p className="text-primary/80 max-w-lg">{t("ondc_body")}</p>
              </div>
              <div className="w-24 h-24 bg-white rounded-full items-center justify-center shadow-sm p-4 hidden md:flex">
                <Globe size={40} className="text-primary" />
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                <div className="font-bold text-gray-900">
                  {liveCount} {t("items_live_on_network")}
                </div>
                <div className="text-sm text-gray-500 mt-1">{t("ondc_status_note")}</div>
              </div>

              {/* ---------------- Provider node (Beckn on_search) ---------------- */}
              <div className="border border-[var(--color-sage)] bg-[var(--color-mint)]/40 rounded-xl p-5 mb-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-primary text-lg flex items-center gap-2">
                      <Code2 size={18} /> {t("ondc_provider_node")}
                    </h3>
                    <p className="text-sm text-primary/80 mt-1 max-w-xl leading-relaxed">
                      {t("ondc_provider_node_body")}
                    </p>
                  </div>
                  {catalog && (
                    <button
                      onClick={loadCatalog}
                      className="p-2 rounded-full hover:bg-white/70 text-primary/60 hover:text-primary transition-colors shrink-0"
                      aria-label={t("refresh")}
                    >
                      <RefreshCw size={16} className={catalogLoading ? "animate-spin" : ""} />
                    </button>
                  )}
                </div>

                <div className="text-sm font-bold text-primary mb-4" aria-live="polite">
                  {catalogLoading && !catalog ? (
                    <span className="inline-flex items-center gap-2 text-primary/70">
                      <Loader2 size={14} className="animate-spin" /> {t("ondc_catalog_loading")}
                    </span>
                  ) : catalogError ? (
                    <span className="text-red-600">{t("ondc_catalog_failed")}</span>
                  ) : (
                    <>
                      {broadcastItems} {t("ondc_broadcast_ready")} · {providers.length}{" "}
                      {t("ondc_providers_label")}
                      {catalog?.context?.domain && (
                        <span className="ml-2 font-mono text-xs font-medium text-primary/60">
                          {catalog.context.domain} · core {catalog.context.core_version}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="/api/ondc/catalog"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary hover:bg-primary-dark text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2"
                  >
                    <ExternalLink size={16} /> {t("ondc_view_catalog")}
                  </a>
                  <button
                    onClick={() => setShowCatalogJson((open) => !open)}
                    disabled={!catalog}
                    className="bg-white hover:bg-gray-50 disabled:opacity-50 text-primary border border-[var(--color-sage)] text-sm font-bold px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2"
                  >
                    <Code2 size={16} />
                    {showCatalogJson ? t("ondc_hide_json") : t("ondc_show_json")}
                  </button>
                </div>

                {showCatalogJson && catalog && (
                  <pre className="mt-4 max-h-80 overflow-auto bg-[#14211B] text-green-200 text-[11px] leading-relaxed p-4 rounded-xl font-mono">
                    {JSON.stringify(catalog, null, 2)}
                  </pre>
                )}
              </div>

              <h3 className="font-bold text-gray-900 mb-4 text-lg">{t("features_benefits")}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: t("zero_commission"), body: t("zero_commission_body") },
                  { title: t("auto_translation"), body: t("auto_translation_body") },
                  { title: t("logistics_handled"), body: t("logistics_handled_body") },
                  { title: t("trust_badges"), body: t("trust_badges_body") },
                ].map((feature) => (
                  <div key={feature.title} className="flex gap-3">
                    <div className="mt-1">
                      <CheckCircle2 className="text-green-500" size={20} />
                    </div>
                    <div>
                      <strong className="block text-gray-900">{feature.title}</strong>
                      <span className="text-gray-600 text-sm">{feature.body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --------------------------- B2B board -------------------------- */}
        {!loading && tab === "b2b" && (
          <div className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden animate-fade-in-up">
            <div className="bg-[var(--color-mint)] p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-primary mb-2">{t("bulk_orders_title")}</h2>
              <p className="text-primary/80 max-w-lg">{t("bulk_orders_body")}</p>
            </div>

            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">{t("active_bulk_enquiries")}</h3>

              {matchingDemands.length === 0 ? (
                <p className="text-sm text-gray-500">{t("no_open_demands")}</p>
              ) : (
                <div className="space-y-4">
                  {matchingDemands.map((demand) => (
                    <div
                      key={demand.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-primary transition-colors"
                    >
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                        <h4 className="font-bold text-lg text-gray-900">
                          {demand.buyerName || t("verified_buyer")}
                        </h4>
                        <span className="text-sm font-bold text-primary">
                          {rupees(demand.targetPriceMin)} – {rupees(demand.targetPriceMax)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {demand.quantity} × {demand.craftType}
                        {demand.notes ? ` — ${demand.notes}` : ""}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        {demand.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {demand.location}
                          </span>
                        )}
                        {demand.festival && (
                          <span className="flex items-center gap-1">
                            <CalendarDays size={12} /> {demand.festival}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <CaptureModal
        isOpen={captureOpen}
        onClose={() => {
          setCaptureOpen(false);
          load();
        }}
      />
    </div>
  );
}
