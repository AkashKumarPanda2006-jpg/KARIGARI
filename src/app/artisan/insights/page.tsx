"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  Info,
  MapPin,
  Package,
  CalendarDays,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/lib/translations";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { locateCity, distanceKm } from "@/lib/indiaGeo";
import type { DemandMarker, HomeMarker } from "@/components/DemandMap";
import { WhatsAppSimulation } from "@/components/WhatsAppSimulation";
import { NotificationsBell, type ArtisanNotification } from "@/components/NotificationsBell";

/** Leaflet touches `window` at import time, so it can only load in the browser. */
const DemandMap = dynamic(() => import("@/components/DemandMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video rounded-xl border border-gray-200 bg-gray-100 animate-pulse" />
  ),
});

interface Demand {
  id: string;
  craftType: string;
  quantity: number;
  targetPriceMin: number | null;
  targetPriceMax: number | null;
  location: string | null;
  festival: string | null;
  buyerName: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
}

interface Recommendation {
  trigger: string;
  headline: string;
  action: string;
  priceMin: number | null;
  priceMax: number | null;
  source: "gemini" | "rules";
}

interface InsightsPayload {
  craftType: string | null;
  cluster: string | null;
  profileLocation: string | null;
  hasMobileNumber: boolean;
  festival: { name: string; date: string; daysAway: number; demandNote: string } | null;
  demand: { matchingCount: number; totalQuantity: number; openCount: number; topDemands: Demand[] };
  ownSupply: number;
  priceBand: { floor: number; ceiling: number } | null;
  recommendation: Recommendation;
}

/** A demand posted this recently still counts as "just now" on the map. */
const FRESH_WINDOW_MS = 15 * 60 * 1000;
const POLL_MS = 20_000;

function rupees(value?: number | null): string {
  return value || value === 0 ? `₹${value.toLocaleString("en-IN")}` : "—";
}

function priceLabel(demand: Demand): string {
  const { targetPriceMin: min, targetPriceMax: max } = demand;
  if (min && max) return `${rupees(min)} – ${rupees(max)}`;
  if (max) return `≤ ${rupees(max)}`;
  if (min) return `≥ ${rupees(min)}`;
  return "—";
}

export default function InsightsPage() {
  const { t } = useLanguage();

  const [demands, setDemands] = useState<Demand[]>([]);
  const [insights, setInsights] = useState<InsightsPayload | null>(null);
  const [loadingDemands, setLoadingDemands] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [notifications, setNotifications] = useState<ArtisanNotification[]>([]);
  const [freshIds, setFreshIds] = useState<string[]>([]);

  /** Ids seen on a previous poll — anything new since then gets the "just listed" pulse. */
  const seenIds = useRef<Set<string> | null>(null);

  const fetchDemands = useCallback(async () => {
    try {
      const res = await fetch("/api/demand?status=OPEN&limit=100", { cache: "no-store" });
      const data = await res.json();
      if (!data.success) return;
      const list: Demand[] = data.demands ?? [];

      if (seenIds.current === null) {
        // First load: "new" means genuinely posted in the last few minutes.
        seenIds.current = new Set(list.map((d) => d.id));
        setFreshIds(
          list
            .filter((d) => Date.now() - new Date(d.createdAt).getTime() < FRESH_WINDOW_MS)
            .map((d) => d.id)
        );
      } else {
        const unseen = list.filter((d) => !seenIds.current!.has(d.id)).map((d) => d.id);
        if (unseen.length) {
          setFreshIds((prev) => Array.from(new Set([...prev, ...unseen])));
          unseen.forEach((id) => seenIds.current!.add(id));
        }
      }

      setDemands(list);
    } catch (e) {
      console.error("Failed to load demands", e);
    } finally {
      setLoadingDemands(false);
    }
  }, []);

  const fetchInsights = useCallback(async () => {
    setLoadingInsights(true);
    try {
      const res = await fetch("/api/artisan/insights", { cache: "no-store" });
      if (res.status === 401 || res.status === 403) {
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (data.success) setInsights(data);
    } catch (e) {
      console.error("Failed to load insights", e);
    } finally {
      setLoadingInsights(false);
    }
  }, []);

  useEffect(() => {
    // Deferred by a macrotask so the effect body performs no synchronous
    // setState — same pattern the schemes page uses.
    const kickoff = setTimeout(() => {
      fetchDemands();
      fetchInsights();
    }, 0);
    const poll = setInterval(fetchDemands, POLL_MS);
    return () => {
      clearTimeout(kickoff);
      clearInterval(poll);
    };
  }, [fetchDemands, fetchInsights]);

  const craft = insights?.craftType || t("your_craft");

  /** Does this demand match the artisan's craft? Same idea as the server matcher, kept simple here. */
  const matchesCraft = useCallback(
    (demand: Demand) => {
      const mine = (insights?.craftType || "").toLowerCase();
      if (!mine) return false;
      const theirs = demand.craftType.toLowerCase();
      if (mine.includes(theirs) || theirs.includes(mine)) return true;
      const mineTokens = new Set(mine.split(/[^a-z0-9]+/).filter((w) => w.length >= 4));
      return theirs.split(/[^a-z0-9]+/).some((w) => w.length >= 4 && mineTokens.has(w));
    },
    [insights?.craftType]
  );

  // Read out as plain locals so the memo dependencies below are exactly the
  // values used — the React Compiler rejects a hook whose declared deps are
  // narrower properties than the object it actually reads.
  const profileLocation = insights?.profileLocation ?? null;
  const ownSupply = insights?.ownSupply;

  const myLocationPoint = useMemo(() => locateCity(profileLocation), [profileLocation]);

  const homeMarker: HomeMarker | null = useMemo(() => {
    if (!myLocationPoint || !profileLocation) return null;
    return {
      lat: myLocationPoint.lat,
      lon: myLocationPoint.lon,
      label: profileLocation,
      supply: ownSupply,
    };
  }, [myLocationPoint, profileLocation, ownSupply]);

  /** One marker per resolvable location, carrying every demand posted there. */
  const demandMarkers: DemandMarker[] = useMemo(() => {
    const groups = new Map<string, DemandMarker>();

    for (const demand of demands) {
      const point = locateCity(demand.location);
      if (!point) continue;
      const key = (demand.location || "").toLowerCase().trim();
      const entry = {
        id: demand.id,
        craftType: demand.craftType,
        quantity: demand.quantity,
        targetPriceMin: demand.targetPriceMin,
        targetPriceMax: demand.targetPriceMax,
        festival: demand.festival,
        buyerName: demand.buyerName,
      };

      const existing = groups.get(key);
      if (existing) {
        existing.demands.push(entry);
        existing.totalQuantity += demand.quantity;
        existing.mine = existing.mine || matchesCraft(demand);
        existing.fresh = existing.fresh || freshIds.includes(demand.id);
      } else {
        groups.set(key, {
          id: key,
          lat: point.lat,
          lon: point.lon,
          location: demand.location || "",
          distanceKm: myLocationPoint ? distanceKm(myLocationPoint, point) : null,
          mine: matchesCraft(demand),
          fresh: freshIds.includes(demand.id),
          totalQuantity: demand.quantity,
          demands: [entry],
        });
      }
    }

    return Array.from(groups.values());
  }, [demands, myLocationPoint, matchesCraft, freshIds]);

  const unmapped = useMemo(
    () => demands.filter((d) => !locateCity(d.location)),
    [demands]
  );

  const hasFresh = freshIds.length > 0;

  const latestDemandAlert = notifications.find((n) => n.type === "DEMAND_ALERT") || null;
  const simulationDemand =
    insights?.demand.topDemands?.[0] ??
    demands.find((d) => matchesCraft(d)) ??
    null;

  const recommendation = insights?.recommendation;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <header className="px-4 py-4 bg-white shadow-sm sticky top-0 z-40 flex items-center gap-3">
        <Link
          href="/artisan/dashboard"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label={t("back_to_dashboard")}
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{t("market_insights")}</h1>
          <p className="text-xs text-gray-500 font-medium truncate">
            {t("market_insights_subtitle")}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <NotificationsBell onNotifications={setNotifications} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* The artisan's own pin is missing because their saved location is not a
            place we can resolve. Say so and offer the fix, rather than quietly
            centring on India and dropping no home pin. */}
        {!loadingInsights && insights && !myLocationPoint && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-wrap items-start gap-3">
            <MapPin size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-amber-900 text-sm">{t("location_not_set")}</h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {t("location_not_set_body")}
                {insights.profileLocation ? ` (${insights.profileLocation})` : ""}
              </p>
            </div>
            <Link
              href="/artisan/dashboard?edit=profile"
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              {t("complete_profile_cta")}
            </Link>
          </div>
        )}

        {/* ------------------------- Live demand map ------------------------- */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-gray-100">
          <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t("live_demand_map")}</h2>
              <p className="text-gray-500 text-sm">
                {t("demand_map_subtitle")}{" "}
                <strong className="text-primary">{craft}</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasFresh && (
                <div className="bg-[var(--color-mint)] text-primary text-xs font-bold px-3 py-1.5 rounded-full animate-bounce border border-[var(--color-sage)]">
                  {t("new_buyer_demand")}
                </div>
              )}
              <button
                onClick={fetchDemands}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label={t("refresh")}
              >
                <RefreshCw size={16} className={loadingDemands ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Map container.
              Real Leaflet markers placed by lat/lng. The previous version was an
              OSM export/embed iframe with absolutely-positioned overlay pins
              projected through a fixed bbox — the embed refits that bbox to its
              own 16:9 box, so it drew ~55° of longitude where the maths assumed
              29° and every pin sat hundreds of km east of its city. */}
          <DemandMap home={homeMarker} demands={demandMarkers} />

          {!loadingDemands && demandMarkers.length === 0 && (
            <p className="mt-3 text-sm font-medium text-gray-500 text-center">
              {t("no_open_demands")}
            </p>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 px-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
              <span className="w-3 h-3 rounded-full bg-[var(--color-stat-teal)]" /> {t("legend_your_craft")}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
              <span className="w-3 h-3 rounded-full bg-[var(--color-primary-light)]" /> {t("legend_other_craft")}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
              <span className="w-3 h-3 rounded-full bg-[var(--color-stat-orange)]" /> {t("legend_just_posted")}
            </div>
            <div className="ml-auto text-xs font-bold text-gray-500">
              {demands.length} {t("open_demands_count")}
            </div>
          </div>

          {unmapped.length > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                {t("not_on_map")}
              </p>
              <div className="flex flex-wrap gap-2">
                {unmapped.map((demand) => (
                  <span
                    key={demand.id}
                    className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-medium"
                  >
                    {demand.quantity} × {demand.craftType}
                    {demand.location ? ` · ${demand.location}` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ------------------------ AI recommendation ------------------------ */}
        <div className="space-y-6">
          <div className="bg-primary-dark text-white p-6 rounded-2xl shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <TrendingUp size={20} /> {t("ai_recommendation")}
            </h3>

            {loadingInsights && !recommendation ? (
              <div className="flex items-center gap-3 text-white/70 text-sm py-6">
                <Loader2 size={16} className="animate-spin" /> {t("reading_market_signals")}
              </div>
            ) : recommendation ? (
              <>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 px-2 py-1 rounded-full">
                    {recommendation.trigger}
                  </span>
                  {insights?.festival && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-1 rounded-full flex items-center gap-1">
                      <CalendarDays size={11} /> {insights.festival.name} · {insights.festival.daysAway}d
                    </span>
                  )}
                  <span className="text-[10px] font-medium text-white/50">
                    {recommendation.source === "gemini" ? t("source_ai") : t("source_rules")}
                  </span>
                </div>

                <p className="text-sm text-white/85 mb-6 leading-relaxed">{recommendation.headline}</p>

                <div className="bg-white/10 p-4 rounded-xl border border-white/20 mb-4">
                  <div className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
                    {t("suggested_action")}
                  </div>
                  <div className="text-sm font-bold">{recommendation.action}</div>
                </div>

                {(recommendation.priceMin || recommendation.priceMax) && (
                  <div className="bg-white/10 p-4 rounded-xl border border-white/20 mb-6 flex items-center justify-between gap-3">
                    <div className="text-xs font-bold text-white/60 uppercase tracking-wider">
                      {t("suggested_price_band")}
                    </div>
                    <div className="text-sm font-bold">
                      {rupees(recommendation.priceMin)} – {rupees(recommendation.priceMax)}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="text-2xl font-bold">{insights?.demand.matchingCount ?? 0}</div>
                    <div className="text-[11px] text-white/60 font-medium">{t("demands_for_your_craft")}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="text-2xl font-bold">{insights?.demand.totalQuantity ?? 0}</div>
                    <div className="text-[11px] text-white/60 font-medium">{t("units_wanted")}</div>
                  </div>
                </div>

                <Link
                  href="/artisan/market"
                  className="block w-full bg-white text-primary-dark text-center py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                >
                  {t("list_on_ondc")}
                </Link>
              </>
            ) : (
              <p className="text-sm text-white/70 py-4">{t("insights_unavailable")}</p>
            )}
          </div>

          {/* --------------------- SMS / WhatsApp auto-pilot --------------------- */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                {t("sms_auto_pilot")}
              </h3>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border",
                  insights?.hasMobileNumber
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                )}
              >
                {insights?.hasMobileNumber ? t("alerts_active") : t("alerts_inactive")}
              </span>
              {latestDemandAlert && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-[var(--color-mint)] text-primary border border-[var(--color-sage)]">
                  {t("latest_alert_ready")}
                </span>
              )}
            </div>

            <div className="bg-[var(--color-mint)] text-primary p-4 rounded-xl text-sm mb-4 border border-[var(--color-sage)]/50">
              <Info size={16} className="mb-2 inline-block mr-2" />
              <strong>{t("no_internet_no_problem")}</strong>
              <p className="mt-1 text-primary/80 text-xs leading-relaxed">
                {insights?.hasMobileNumber
                  ? t("auto_pilot_body_active")
                  : t("auto_pilot_body_inactive")}
              </p>
            </div>

            <WhatsAppSimulation
              craftType={insights?.craftType}
              demand={simulationDemand}
              alertMessage={latestDemandAlert?.message ?? null}
              channel={latestDemandAlert?.channel ?? (insights?.hasMobileNumber ? "WHATSAPP" : "IN_APP")}
              alertsActive={Boolean(insights?.hasMobileNumber)}
            />
          </div>

          {/* --------------------------- Demand list --------------------------- */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package size={16} /> {t("demands_for_your_craft")}
            </h3>

            {insights && insights.demand.topDemands.length > 0 ? (
              <div className="space-y-3">
                {[...insights.demand.topDemands].sort((a, b) => {
                  if (!myLocationPoint) return 0;
                  const ptA = locateCity(a.location);
                  const ptB = locateCity(b.location);
                  if (ptA && ptB) return distanceKm(myLocationPoint, ptA) - distanceKm(myLocationPoint, ptB);
                  if (ptA) return -1;
                  if (ptB) return 1;
                  return 0;
                }).map((demand) => {
                  const pt = locateCity(demand.location);
                  const dist = myLocationPoint && pt ? distanceKm(myLocationPoint, pt) : null;
                  return (
                    <div
                      key={demand.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-primary transition-colors"
                    >
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                        <h4 className="font-bold text-gray-900">
                          {demand.quantity} × {demand.craftType}
                        </h4>
                        <span className="text-sm font-bold text-primary">{priceLabel(demand)}</span>
                      </div>
                      <div className="text-xs text-gray-500 flex flex-wrap gap-3">
                        {demand.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {demand.location}
                            {dist !== null && <span className="text-gray-400">({dist < 50 ? t("near_you") : `${dist} km`})</span>}
                          </span>
                        )}
                        {demand.festival && (
                          <span className="flex items-center gap-1">
                            <CalendarDays size={12} /> {demand.festival}
                          </span>
                        )}
                        {demand.buyerName && <span>{demand.buyerName}</span>}
                      </div>
                      {demand.notes && (
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">{demand.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {t("no_matching_demands")}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
