import type { Place } from "@memento-mori/types";
import { SEED_PLACES } from "./seed-data";

export type Transport = "car" | "train" | "plane";
export type Budget = "budget" | "mid" | "splurge";
export type CountryScope = "1" | "2-3" | "4+";

export interface RouteFilters {
  days: number;
  transport: Transport;
  countryScope: CountryScope;
  budget: Budget;
  categories: string[]; // empty = all
  startingCountry?: string;
}

export interface RouteStop {
  place: Place;
  day: number;
  distanceFromPrev: number; // km
  travelTimeFromPrev: number; // minutes
}

export interface RouteDay {
  day: number;
  stops: RouteStop[];
  totalDistance: number; // km
  countries: string[];
}

export interface GeneratedRoute {
  days: RouteDay[];
  totalPlaces: number;
  totalCountries: string[];
  totalDistance: number;
  filters: RouteFilters;
}

// ── Haversine distance (km) ──────────────────────────────────────────────────
function haversine(a: Place, b: Place): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

// ── Travel time estimate (minutes) ──────────────────────────────────────────
function travelTime(km: number, transport: Transport): number {
  if (transport === "car") return Math.round((km / 90) * 60);
  if (transport === "train") return Math.round((km / 120) * 60 + 30); // +30 boarding
  return Math.round((km / 800) * 60 + 90); // +90 airport
}

// ── Max km per day by transport ──────────────────────────────────────────────
const MAX_KM_PER_DAY: Record<Transport, number> = {
  car: 500,
  train: 300,
  plane: 4000,
};

// ── Max places per day ───────────────────────────────────────────────────────
const PLACES_PER_DAY: Record<Transport, number> = {
  car: 3,
  train: 2,
  plane: 2,
};

// ── Max countries by scope ───────────────────────────────────────────────────
const MAX_COUNTRIES: Record<CountryScope, number> = {
  "1": 1,
  "2-3": 3,
  "4+": 8,
};

// ── Filter candidate places ──────────────────────────────────────────────────
function filterCandidates(filters: RouteFilters): Place[] {
  let places = [...SEED_PLACES];

  // Category filter
  if (filters.categories.length > 0) {
    places = places.filter((p) => filters.categories.includes(p.category));
  }

  // Budget: splurge prefers high spookyScore
  if (filters.budget === "splurge") {
    places = places.filter((p) => p.spookyScore >= 4);
  }

  // Train: prefer places with a city (more accessible)
  if (filters.transport === "train") {
    const withCity = places.filter((p) => p.city);
    if (withCity.length >= filters.days * PLACES_PER_DAY.train) {
      places = withCity;
    }
  }

  // Starting country filter — start from same country
  if (filters.startingCountry) {
    const sameCountry = places.filter(
      (p) => p.country.toLowerCase() === filters.startingCountry!.toLowerCase()
    );
    if (sameCountry.length >= 2) {
      // boost: put starting country places first
      places = [
        ...sameCountry,
        ...places.filter(
          (p) => p.country.toLowerCase() !== filters.startingCountry!.toLowerCase()
        ),
      ];
    }
  }

  return places;
}

// ── Greedy nearest-neighbour route builder ───────────────────────────────────
export function buildRoute(filters: RouteFilters): GeneratedRoute {
  const candidates = filterCandidates(filters);
  const maxCountries = MAX_COUNTRIES[filters.countryScope];
  const maxKmDay = MAX_KM_PER_DAY[filters.transport];
  const placesPerDay = PLACES_PER_DAY[filters.transport];
  const totalPlacesNeeded = filters.days * placesPerDay;

  const visited = new Set<string>();
  const days: RouteDay[] = [];
  const usedCountries = new Set<string>();

  // Pick starting place
  let current: Place =
    filters.startingCountry
      ? candidates.find(
          (p) => p.country.toLowerCase() === filters.startingCountry!.toLowerCase()
        ) ?? candidates[0]
      : candidates[Math.floor(Math.random() * Math.min(10, candidates.length))];

  for (let day = 1; day <= filters.days; day++) {
    const dayStops: RouteStop[] = [];
    let dayDistance = 0;

    for (let slot = 0; slot < placesPerDay; slot++) {
      if (visited.size >= totalPlacesNeeded) break;

      // Find nearest unvisited place within constraints
      const nearest = candidates
        .filter((p) => {
          if (visited.has(p.id)) return false;
          if (p.id === current.id) return false;
          const km = haversine(current, p);
          if (km > maxKmDay) return false;
          // Country scope check
          if (
            !usedCountries.has(p.country) &&
            usedCountries.size >= maxCountries
          )
            return false;
          return true;
        })
        .sort((a, b) => haversine(current, a) - haversine(current, b))[0];

      if (!nearest) {
        // Relax distance constraint if no nearby candidates
        const relaxed = candidates
          .filter((p) => {
            if (visited.has(p.id)) return false;
            if (p.id === current.id) return false;
            if (
              !usedCountries.has(p.country) &&
              usedCountries.size >= maxCountries
            )
              return false;
            return true;
          })
          .sort((a, b) => haversine(current, a) - haversine(current, b))[0];

        if (!relaxed) break;

        const km = haversine(current, relaxed);
        dayDistance += km;
        visited.add(relaxed.id);
        usedCountries.add(relaxed.country);
        dayStops.push({
          place: relaxed,
          day,
          distanceFromPrev: Math.round(km),
          travelTimeFromPrev: travelTime(km, filters.transport),
        });
        current = relaxed;
      } else {
        const km = haversine(current, nearest);
        dayDistance += km;
        visited.add(nearest.id);
        usedCountries.add(nearest.country);
        dayStops.push({
          place: nearest,
          day,
          distanceFromPrev: Math.round(km),
          travelTimeFromPrev: travelTime(km, filters.transport),
        });
        current = nearest;
      }
    }

    if (dayStops.length > 0) {
      days.push({
        day,
        stops: dayStops,
        totalDistance: Math.round(dayDistance),
        countries: [...new Set(dayStops.map((s) => s.place.country))],
      });
    }
  }

  const allStops = days.flatMap((d) => d.stops);

  return {
    days,
    totalPlaces: allStops.length,
    totalCountries: [...new Set(allStops.map((s) => s.place.country))],
    totalDistance: Math.round(
      days.reduce((sum, d) => sum + d.totalDistance, 0)
    ),
    filters,
  };
}

// ── All unique countries in seed data ────────────────────────────────────────
export const ALL_COUNTRIES = [
  ...new Set(SEED_PLACES.map((p) => p.country)),
].sort();
