import type { ConfigContext, ExpoConfig } from "expo/config";

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? "Memento Mori",
  slug: config.slug ?? "memento-mori",
  ios: {
    ...config.ios,
    config: { ...config.ios?.config, googleMapsApiKey },
  },
  android: {
    ...config.android,
    config: { ...config.android?.config, googleMaps: { apiKey: googleMapsApiKey } },
  },
});
