import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import MapView, { Marker, type MapViewProps } from "react-native-maps";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Place } from "@memento-mori/types";
import { SEED_PLACES } from "@/lib/seed-data";
import { CATEGORY_CONFIG, getSpookySkulls } from "@/lib/categories";
import { colors } from "@/lib/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0d0d15" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d0d15" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5a5a78" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#060612" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1e1e2e" }] },
];

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const CATEGORIES = [
    { key: "ALL", emoji: "🗺️", label: "All" },
    ...Object.entries(CATEGORY_CONFIG).map(([key, v]) => ({
      key,
      emoji: v.emoji,
      label: v.label,
    })),
  ];

  const filteredPlaces = SEED_PLACES.filter((p) => {
    const matchCat = activeCategory === "ALL" || p.category === activeCategory;
    const matchSearch =
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.country.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSelectPlace = useCallback((place: Place) => {
    setSelectedPlace(place);
    setSheetExpanded(false);
    mapRef.current?.animateToRegion(
      { latitude: place.lat, longitude: place.lng, latitudeDelta: 3, longitudeDelta: 3 },
      600
    );
  }, []);

  const handleRandom = () => {
    const pool = activeCategory === "ALL" ? SEED_PLACES : SEED_PLACES.filter((p) => p.category === activeCategory);
    handleSelectPlace(pool[Math.floor(Math.random() * pool.length)]);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        customMapStyle={MAP_STYLE}
        initialRegion={{
          latitude: 48.8566,
          longitude: 10.0,
          latitudeDelta: 40,
          longitudeDelta: 40,
        }}
        onPress={() => setSelectedPlace(null)}
      >
        {filteredPlaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            onPress={() => handleSelectPlace(place)}
          >
            <View
              style={[
                styles.marker,
                selectedPlace?.id === place.id && styles.markerActive,
              ]}
            >
              <Text style={styles.markerEmoji}>
                {CATEGORY_CONFIG[place.category].emoji}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Top bar */}
      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <Text style={styles.logo}>Memento Mori</Text>
        <TouchableOpacity style={styles.cursedBtn} onPress={handleRandom}>
          <Text style={styles.cursedBtnText}>☠️ Cursed</Text>
        </TouchableOpacity>
      </View>

      {/* Selected place card */}
      {selectedPlace && (
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewEmoji}>
              {CATEGORY_CONFIG[selectedPlace.category].emoji}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.previewCategory}>
                {CATEGORY_CONFIG[selectedPlace.category].label}
              </Text>
              <Text style={styles.previewName} numberOfLines={1}>
                {selectedPlace.name}
              </Text>
              <Text style={styles.previewLocation}>
                {selectedPlace.city ? `${selectedPlace.city}, ` : ""}
                {selectedPlace.country}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedPlace(null)}>
              <Text style={{ color: colors.textMuted, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.previewSkulls}>
            {getSpookySkulls(selectedPlace.spookyScore)}
          </Text>
          <Text style={styles.previewDesc} numberOfLines={2}>
            {selectedPlace.description}
          </Text>
          <TouchableOpacity
            style={styles.previewBtn}
            onPress={() => router.push(`/place/${selectedPlace.id}`)}
          >
            <Text style={styles.previewBtnText}>Read legend →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom sheet */}
      <View
        style={[
          styles.sheet,
          { height: sheetExpanded ? SCREEN_HEIGHT * 0.6 : 280 },
        ]}
      >
        {/* Handle */}
        <TouchableOpacity
          style={styles.sheetHandle}
          onPress={() => setSheetExpanded((e) => !e)}
        >
          <View style={styles.handleBar} />
        </TouchableOpacity>

        {/* Search */}
        <View style={styles.searchRow}>
          <Text style={{ color: colors.textMuted }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search places..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search !== "" && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={{ color: colors.textMuted }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chips}
          contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.chip,
                activeCategory === cat.key && styles.chipActive,
              ]}
              onPress={() => setActiveCategory(cat.key)}
            >
              <Text style={styles.chipText}>
                {cat.emoji} {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Places list */}
        <ScrollView style={{ flex: 1 }}>
          {filteredPlaces.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={[
                styles.listItem,
                selectedPlace?.id === place.id && styles.listItemActive,
              ]}
              onPress={() => handleSelectPlace(place)}
            >
              <Text style={styles.listEmoji}>
                {CATEGORY_CONFIG[place.category].emoji}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.listName} numberOfLines={1}>
                  {place.name}
                </Text>
                <Text style={styles.listLocation}>
                  {place.city ? `${place.city}, ` : ""}
                  {place.country}
                </Text>
              </View>
              <Text style={{ fontSize: 10 }}>{"💀".repeat(place.spookyScore)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  map: { flex: 1 },
  topBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    color: colors.textPrimary,
    fontSize: 17,
    fontFamily: "Georgia",
    backgroundColor: colors.bgSurface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: colors.borderDefault,
  },
  cursedBtn: {
    backgroundColor: colors.bgSurface,
    borderWidth: 0.5,
    borderColor: colors.borderDefault,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cursedBtnText: { color: colors.textSecondary, fontSize: 13 },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    alignItems: "center",
    justifyContent: "center",
  },
  markerActive: {
    backgroundColor: "#2A1A3E",
    borderColor: colors.purple,
    borderWidth: 2,
  },
  markerEmoji: { fontSize: 18 },
  previewCard: {
    position: "absolute",
    bottom: 296,
    left: 16,
    right: 16,
    backgroundColor: colors.bgSurface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    borderColor: colors.borderDefault,
  },
  previewHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  previewEmoji: { fontSize: 28 },
  previewCategory: { fontSize: 11, color: colors.purple, marginBottom: 2 },
  previewName: { fontSize: 15, color: colors.textPrimary, fontFamily: "Georgia" },
  previewLocation: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  previewSkulls: { fontSize: 12, letterSpacing: 2, marginBottom: 6 },
  previewDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 12 },
  previewBtn: {
    backgroundColor: "#1A1228",
    borderWidth: 0.5,
    borderColor: colors.purpleDim,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
  },
  previewBtnText: { color: "#A78BFA", fontSize: 13 },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 0.5,
    borderColor: colors.borderDefault,
    overflow: "hidden",
  },
  sheetHandle: { alignItems: "center", paddingVertical: 10 },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: colors.bgElevated,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: colors.borderDefault,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 13 },
  chips: { marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: colors.borderDefault,
    backgroundColor: "transparent",
  },
  chipActive: {
    backgroundColor: "#1A1228",
    borderColor: colors.purpleDim,
  },
  chipText: { color: colors.textSecondary, fontSize: 12 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSubtle,
    borderLeftWidth: 2,
    borderLeftColor: "transparent",
  },
  listItemActive: {
    backgroundColor: colors.bgElevated,
    borderLeftColor: colors.purpleDim,
  },
  listEmoji: { fontSize: 22 },
  listName: { fontSize: 13, color: colors.textPrimary, fontFamily: "Georgia" },
  listLocation: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
