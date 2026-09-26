import type { Place } from "@memento-mori/types";
import { SEED_PLACES } from "./seed-data";

export function getPlaceById(id: string): Place | undefined {
  return SEED_PLACES.find((p) => p.id === id);
}

export function getNearbyPlaces(place: Place, limit = 3): Place[] {
  return SEED_PLACES.filter((p) => p.id !== place.id)
    .map((p) => ({
      place: p,
      distance: Math.sqrt(
        Math.pow(p.lat - place.lat, 2) + Math.pow(p.lng - place.lng, 2)
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((r) => r.place);
}
