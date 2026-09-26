import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Share } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import { SEED_PLACES } from "@/lib/seed-data";
import { CATEGORY_CONFIG, getSpookySkulls } from "@/lib/categories";
import { colors } from "@/lib/theme";
import { useCollectionsStore } from "@/lib/store";

const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0d0d15" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5a5a78" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#060612" }] },
];

export default function PlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { collections, openDrawer } = useCollectionsStore();

  const place = SEED_PLACES.find((p) => p.id === id);
  if (!place) return null;

  const category = CATEGORY_CONFIG[place.category];
  const nearby = SEED_PLACES.filter((p) => p.id !== place.id)
    .map((p) => ({ p, d: Math.hypot(p.lat - place.lat, p.lng - place.lng) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map((r) => r.p);

  const inAnyCollection = collections.some((c) =>
    c.items.some((i) => i.place.id === place.id)
  );

  const handleShare = async () => {
    await Share.share({
      title: place.name,
      message: `${place.name} — ${place.description}`,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Nav */}
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.shareText}>🔗</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={[styles.badgeText, { color: category.color }]}>
              {category.emoji} {category.label}
            </Text>
          </View>
          <Text style={styles.title}>{place.name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.location}>
              📍 {place.city ? `${place.city}, ` : ""}
              {place.country}
            </Text>
            <Text style={styles.skulls}>{getSpookySkulls(place.spookyScore)}</Text>
          </View>
          <Text style={styles.description}>{place.description}</Text>
        </View>

        <View style={styles.content}>
          {/* Legend */}
          <Text style={styles.sectionTitle}>☽ The Legend</Text>
          <View style={styles.legendBlock}>
            <Text style={styles.legendText}>{place.legend}</Text>
          </View>

          {/* Mini map */}
          <Text style={styles.sectionTitle}>◎ Location</Text>
          <View style={styles.miniMap}>
            <MapView
              style={{ flex: 1 }}
              provider="google"
              customMapStyle={MAP_STYLE}
              initialRegion={{
                latitude: place.lat,
                longitude: place.lng,
                latitudeDelta: 4,
                longitudeDelta: 4,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={{ latitude: place.lat, longitude: place.lng }}>
                <Text style={{ fontSize: 24 }}>{category.emoji}</Text>
              </Marker>
            </MapView>
          </View>
          <View style={styles.coordsRow}>
            <View style={styles.coordItem}>
              <Text style={styles.coordLabel}>Latitude</Text>
              <Text style={styles.coordValue}>{place.lat.toFixed(4)}°</Text>
            </View>
            <View style={styles.coordItem}>
              <Text style={styles.coordLabel}>Longitude</Text>
              <Text style={styles.coordValue}>{place.lng.toFixed(4)}°</Text>
            </View>
            <View style={styles.coordItem}>
              <Text style={styles.coordLabel}>Country</Text>
              <Text style={styles.coordValue}>{place.country}</Text>
            </View>
          </View>

          {/* Add to collection */}
          <View style={styles.collectionCta}>
            <View>
              <Text style={styles.ctaTitle}>Save to collection</Text>
              <Text style={styles.ctaSubtitle}>Build your haunted road trip.</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={openDrawer}>
              <Text style={styles.addBtnText}>
                {inAnyCollection ? "✓ Saved" : "+ Add"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Nearby */}
          {nearby.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Nearby haunted places</Text>
              {nearby.map((p) => {
                const cat = CATEGORY_CONFIG[p.category];
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.nearbyItem}
                    onPress={() => router.push(`/place/${p.id}`)}
                  >
                    <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nearbyName}>{p.name}</Text>
                      <Text style={styles.nearbyLocation}>
                        {p.city ? `${p.city}, ` : ""}
                        {p.country}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 10 }}>{"💀".repeat(p.spookyScore)}</Text>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSubtle,
  },
  backBtn: {},
  backText: { fontSize: 13, color: colors.textMuted },
  shareText: { fontSize: 20 },
  hero: {
    padding: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.bgSurface,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.bgElevated,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: colors.borderDefault,
    marginBottom: 12,
  },
  badgeText: { fontSize: 12 },
  title: {
    fontSize: 28,
    color: colors.textPrimary,
    fontFamily: "Georgia",
    marginBottom: 10,
    lineHeight: 34,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" },
  location: { fontSize: 13, color: colors.textMuted },
  skulls: { fontSize: 12, letterSpacing: 2 },
  description: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  content: { padding: 20, gap: 8 },
  sectionTitle: {
    fontSize: 20,
    color: colors.textPrimary,
    fontFamily: "Georgia",
    marginTop: 16,
    marginBottom: 12,
  },
  legendBlock: {
    backgroundColor: colors.bgSurface,
    borderLeftWidth: 2,
    borderLeftColor: colors.purpleDim,
    borderRadius: 4,
    padding: 16,
    marginBottom: 8,
  },
  legendText: { fontSize: 14, color: "#C0C0D8", lineHeight: 22 },
  miniMap: {
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: colors.borderSubtle,
  },
  coordsRow: {
    flexDirection: "row",
    gap: 16,
    padding: 12,
    backgroundColor: colors.bgSurface,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: colors.borderSubtle,
    marginBottom: 8,
  },
  coordItem: { flex: 1 },
  coordLabel: { fontSize: 10, color: colors.textMuted, marginBottom: 2 },
  coordValue: { fontSize: 12, color: colors.textSecondary, fontFamily: "Courier" },
  collectionCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 16,
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.borderDefault,
    marginVertical: 8,
  },
  ctaTitle: { fontSize: 14, color: colors.textPrimary, fontWeight: "500", marginBottom: 2 },
  ctaSubtitle: { fontSize: 12, color: colors.textMuted },
  addBtn: {
    backgroundColor: "#1A1228",
    borderWidth: 0.5,
    borderColor: colors.purpleDim,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { color: "#A78BFA", fontSize: 13 },
  nearbyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: colors.bgSurface,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: colors.borderSubtle,
    marginBottom: 8,
  },
  nearbyName: { fontSize: 14, color: colors.textPrimary, fontFamily: "Georgia", marginBottom: 2 },
  nearbyLocation: { fontSize: 12, color: colors.textMuted },
});
