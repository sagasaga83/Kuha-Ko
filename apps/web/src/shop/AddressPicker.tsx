// Where to deliver: search for the place (Google), then drag the pin to the exact
// spot. Without a Maps key: type the address and use the phone's location for the pin.
import { useEffect, useRef, useState } from 'react';
import { ILOILO, loadMaps, mapId, mapsKey, toLatLng } from './maps';

export interface Pin {
  lat: number;
  lng: number;
}

export function AddressPicker({
  address,
  onAddress,
  pin,
  onPin,
}: {
  address: string;
  onAddress: (text: string) => void;
  pin: Pin | null;
  onPin: (pin: Pin) => void;
}) {
  const [mapsState, setMapsState] = useState<'off' | 'loading' | 'ready' | 'failed'>(mapsKey ? 'loading' : 'off');
  const searchBox = useRef<HTMLDivElement>(null);
  const mapBox = useRef<HTMLDivElement>(null);
  const marker = useRef<any>(null);
  const map = useRef<any>(null);
  const onPinRef = useRef(onPin);
  const onAddressRef = useRef(onAddress);
  onPinRef.current = onPin;
  onAddressRef.current = onAddress;

  useEffect(() => {
    if (!mapsKey) return;
    let cancelled = false;
    (async () => {
      try {
        const g = await loadMaps();
        const [{ Map }, { AdvancedMarkerElement }, { PlaceAutocompleteElement }] = await Promise.all([
          g.importLibrary('maps'),
          g.importLibrary('marker'),
          g.importLibrary('places'),
        ]);
        if (cancelled || !mapBox.current || !searchBox.current) return;
        const start = pin ?? ILOILO;
        map.current = new Map(mapBox.current, {
          center: start,
          zoom: pin ? 17 : 13,
          mapId,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
        });
        marker.current = new AdvancedMarkerElement({ map: map.current, position: pin ?? null, gmpDraggable: true, title: 'Delivery spot' });
        marker.current.addEventListener('gmp-dragend', () => {
          const p = toLatLng(marker.current.position);
          if (p) onPinRef.current(p);
        });
        // Tapping the map moves the pin there too.
        map.current.addListener('click', (e: any) => {
          const p = toLatLng(e.latLng);
          if (!p) return;
          marker.current.position = p;
          onPinRef.current(p);
        });

        const search = new PlaceAutocompleteElement({
          includedRegionCodes: ['ph'],
          locationBias: { center: ILOILO, radius: 20000 },
        });
        search.setAttribute('placeholder', 'Search: street, building or barangay');
        searchBox.current.replaceChildren(search);
        search.addEventListener('gmp-select', async ({ placePrediction }: any) => {
          const place = placePrediction.toPlace();
          await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
          const p = toLatLng(place.location);
          if (!p) return;
          marker.current.position = p;
          map.current.setCenter(p);
          map.current.setZoom(17);
          const name = place.displayName && !place.formattedAddress?.startsWith(place.displayName) ? `${place.displayName}, ` : '';
          onAddressRef.current(`${name}${place.formattedAddress ?? ''}`);
          onPinRef.current(p);
        });
        setMapsState('ready');
      } catch (err) {
        console.error(err);
        if (!cancelled) setMapsState('failed');
      }
    })();
    return () => {
      cancelled = true;
    };
    // Set up once; the pin is kept in sync through the marker itself.
  }, []);

  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocError('This browser can’t share its location.');
      return;
    }
    setLocating(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (marker.current) {
          marker.current.position = p;
          map.current?.setCenter(p);
          map.current?.setZoom(17);
        }
        onPin(p);
      },
      () => {
        setLocating(false);
        setLocError('We couldn’t get your location. Check that location is allowed for this site.');
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const withMap = mapsState === 'loading' || mapsState === 'ready';

  return (
    <div className="shop-address">
      {withMap ? (
        <>
          <div className="shop-address__search" ref={searchBox}>
            {mapsState === 'loading' ? <p className="shop-note">Loading the map…</p> : null}
          </div>
          <div className="shop-address__map" ref={mapBox} aria-label="Map: drag the pin to your door" />
          <p className="shop-note">Search for your place, then drag the pin (or tap the map) to your exact door.</p>
        </>
      ) : null}
      <button type="button" className="shop-link" onClick={useMyLocation} disabled={locating}>
        {locating ? 'Finding you…' : 'Use my current location'}
      </button>
      {!withMap && pin ? <p className="shop-note">Pin set at your current location.</p> : null}
      {locError ? <p className="shop-error">{locError}</p> : null}
      <label className="shop-field">
        <span>Address</span>
        <textarea
          rows={2}
          value={address}
          onChange={(e) => onAddress(e.target.value)}
          placeholder="House or unit no., street, barangay"
          autoComplete="street-address"
          maxLength={300}
        />
      </label>
      {!withMap && !pin ? <p className="shop-note">Tap “Use my current location” at your door so the rider can find you.</p> : null}
    </div>
  );
}
