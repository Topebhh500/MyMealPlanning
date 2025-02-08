import React, { useState, useEffect } from "react";
import { View, Text, Linking, FlatList, TouchableOpacity } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import styles from "../styles/NearbyStoresStyle";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Interfaces
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationData {
  coords: Coordinates;
}

interface StoreLocation {
  lat: number;
  lng: number;
}

interface StoreGeometry {
  location: StoreLocation;
}

interface Store {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: StoreGeometry;
  distance: string;
}

interface GooglePlacesResponse {
  results: Omit<Store, "distance">[];
  status: string;
}

interface RenderStoreItemProps {
  item: Store;
}

interface GeocodedAddress {
  street: string;
  city: string;
  region: string;
  country: string;
}

const NearbyStoresScreen: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    void fetchLocationAndStores();
  }, []);

  const fetchLocationAndStores = async (): Promise<void> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      const [geoAddress] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setAddress(formatAddress(geoAddress));

      await fetchNearbyStores(location.coords);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const formatAddress = (geoAddress: GeocodedAddress): string => {
    return `${geoAddress.street}, ${geoAddress.city}, ${geoAddress.region}, ${geoAddress.country}`;
  };

  const fetchNearbyStores = async (coords: Coordinates): Promise<void> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.latitude},${coords.longitude}&radius=1500&type=supermarket&key=${GOOGLE_API_KEY}`
      );
      const data: GooglePlacesResponse = await response.json();

      const storesWithDistances = data.results.map((store) => {
        const distance = calculateDistance(
          coords.latitude,
          coords.longitude,
          store.geometry.location.lat,
          store.geometry.location.lng
        );
        return { ...store, distance };
      });

      const sortedStores = storesWithDistances.sort(
        (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
      );
      setStores(sortedStores);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): string => {
    const toRad = (value: number): number => (value * Math.PI) / 180;

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance.toFixed(2); // Return distance with 2 decimal places
  };

  const openMaps = (latitude: number, longitude: number): void => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    void Linking.openURL(url);
  };

  const renderStoreItem = ({ item }: RenderStoreItemProps): JSX.Element => (
    <TouchableOpacity
      style={styles.storeItem}
      onPress={() =>
        openMaps(item.geometry.location.lat, item.geometry.location.lng)
      }
    >
      <Text style={styles.storeName}>
        {item.name} - ({item.distance} km)
      </Text>
      <Text style={styles.storeAddress}>{item.vicinity}</Text>
    </TouchableOpacity>
  );

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const initialRegion: Region = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <View style={styles.addressContainer}>
        <Text style={styles.addressText}>Location: {address}</Text>
      </View>

      <MapView style={styles.map} initialRegion={initialRegion}>
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="You are here"
          image={require("../assets/green-marker.png")}
        />

        {stores.map((store) => (
          <Marker
            key={store.place_id}
            coordinate={{
              latitude: store.geometry.location.lat,
              longitude: store.geometry.location.lng,
            }}
            title={store.name}
            onPress={() =>
              openMaps(store.geometry.location.lat, store.geometry.location.lng)
            }
          />
        ))}
      </MapView>

      <FlatList<Store>
        data={stores}
        keyExtractor={(item) => item.place_id}
        renderItem={renderStoreItem}
        style={styles.storeList}
      />
    </View>
  );
};

export default NearbyStoresScreen;
