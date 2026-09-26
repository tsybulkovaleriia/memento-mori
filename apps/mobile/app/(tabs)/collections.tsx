import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCollectionsStore } from "@/lib/store";
import { colors } from "@/lib/theme";

export default function CollectionsScreen() {
  const insets = useSafeAreaInsets();
  const { collections, createCollection, deleteCollection } = useCollectionsStore();

  const handleCreate = () => {
    Alert.prompt(
      "New Collection",
      "Enter a name for your collection",
      (name) => { if (name?.trim()) createCollection(name.trim()); },
      "plain-text"
    );
  };

  const handleShare = async (id: string, name: string) => {
    await Share.share({
      message: `Check out my haunted places collection "${name}" on Memento Mori!`,
      url: `https://your-domain.com/c/${id}`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Collection",
      `Delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteCollection(id) },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Collections</Text>
        <TouchableOpacity style={styles.newBtn} onPress={handleCreate}>
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {collections.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={styles.emptyTitle}>No collections yet</Text>
            <Text style={styles.emptySubtitle}>
              Open a place and tap "Add to collection" to get started.
            </Text>
          </View>
        ) : (
          collections.map((col) => (
            <View key={col.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{col.name}</Text>
                  <Text style={styles.cardMeta}>
                    {col.items.length} place{col.items.length !== 1 ? "s" : ""}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(col.id, col.name)}>
                  <Text style={{ fontSize: 18, color: colors.borderStrong }}>🗑</Text>
                </TouchableOpacity>
              </View>

              {/* Preview chips */}
              {col.items.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 12 }}
                  contentContainerStyle={{ gap: 6 }}
                >
                  {col.items.slice(0, 4).map((item) => (
                    <View key={item.place.id} style={styles.placeChip}>
                      <Text style={styles.placeChipText} numberOfLines={1}>
                        {item.place.name}
                      </Text>
                    </View>
                  ))}
                  {col.items.length > 4 && (
                    <Text style={styles.moreText}>+{col.items.length - 4}</Text>
                  )}
                </ScrollView>
              )}

              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => handleShare(col.id, col.name)}
              >
                <Text style={styles.shareBtnText}>🔗 Share collection</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSubtle,
  },
  title: {
    fontSize: 22,
    color: colors.textPrimary,
    fontFamily: "Georgia",
  },
  newBtn: {
    backgroundColor: "#1A1228",
    borderWidth: 0.5,
    borderColor: colors.purpleDim,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  newBtnText: { color: "#A78BFA", fontSize: 13 },
  empty: { alignItems: "center", paddingVertical: 64 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, textAlign: "center", lineHeight: 18 },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: colors.borderSubtle,
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  cardName: { fontSize: 16, color: colors.textPrimary, fontFamily: "Georgia", marginBottom: 2 },
  cardMeta: { fontSize: 12, color: colors.textMuted },
  placeChip: {
    backgroundColor: colors.bgElevated,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: colors.borderDefault,
  },
  placeChipText: { fontSize: 11, color: colors.textSecondary, maxWidth: 120 },
  moreText: { fontSize: 11, color: colors.textMuted, alignSelf: "center" },
  shareBtn: {
    borderWidth: 0.5,
    borderColor: colors.purpleDim,
    backgroundColor: "#1A1228",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  shareBtnText: { color: "#A78BFA", fontSize: 13 },
});
