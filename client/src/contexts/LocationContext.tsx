// client/src/contexts/LocationContext.tsx — Multi-location context for dealer portals
// Provides location switcher state for dealer_owner role.
// null currentLocationId = "All Locations" (no filter — backward compatible)

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export interface Location {
  id: string;
  dealershipId: string;
  name: string;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  managerUserId: string | null;
  isMain: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LocationContextValue {
  locations: Location[];
  currentLocationId: string | null; // null = All Locations
  currentLocation: Location | null;
  setCurrentLocation: (locationId: string | null) => void;
  isMultiLocation: boolean; // true when dealer has 2+ active locations
  isLoading: boolean;
  refetchLocations: () => void;
}

const LocationContext = createContext<LocationContextValue>({
  locations: [],
  currentLocationId: null,
  currentLocation: null,
  setCurrentLocation: () => {},
  isMultiLocation: false,
  isLoading: false,
  refetchLocations: () => {},
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const dealershipId = user?.dealershipId as string | undefined;

  const storageKey = dealershipId ? `ds360-location-${dealershipId}` : null;

  const [currentLocationId, setCurrentLocationIdState] = useState<string | null>(() => {
    if (!storageKey) return null;
    try {
      return sessionStorage.getItem(storageKey) || null;
    } catch {
      return null;
    }
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dealership-locations', dealershipId],
    queryFn: () =>
      apiFetch<{ locations: Location[] }>(`/api/dealerships/${dealershipId}/locations`),
    enabled: !!dealershipId && ['dealer_owner', 'dealer_staff', 'service_manager', 'shop_manager', 'parts_dept', 'financial_manager'].includes(user?.role || ''),
    staleTime: 5 * 60 * 1000,
  });

  const locations = data?.locations ?? [];
  const isMultiLocation = locations.length >= 2;

  // If single location, always null (no switcher needed)
  useEffect(() => {
    if (!isMultiLocation && currentLocationId !== null) {
      setCurrentLocationIdState(null);
      if (storageKey) {
        try { sessionStorage.removeItem(storageKey); } catch {}
      }
    }
  }, [isMultiLocation, currentLocationId, storageKey]);

  const setCurrentLocation = useCallback((locationId: string | null) => {
    setCurrentLocationIdState(locationId);
    if (storageKey) {
      try {
        if (locationId) {
          sessionStorage.setItem(storageKey, locationId);
        } else {
          sessionStorage.removeItem(storageKey);
        }
      } catch {}
    }
  }, [storageKey]);

  const currentLocation = locations.find((l) => l.id === currentLocationId) ?? null;

  return (
    <LocationContext.Provider
      value={{
        locations,
        currentLocationId,
        currentLocation,
        setCurrentLocation,
        isMultiLocation,
        isLoading,
        refetchLocations: refetch,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext(): LocationContextValue {
  return useContext(LocationContext);
}
