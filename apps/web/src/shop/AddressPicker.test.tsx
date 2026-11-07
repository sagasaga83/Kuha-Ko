import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';

// A stand-in for Google Maps: just enough to see where the pin is drawn.
const markers: { position: unknown }[] = [];
vi.mock('./maps', () => {
  class FakeMap {
    addListener() {}
    setCenter() {}
    setZoom() {}
  }
  class FakeMarker {
    position: unknown;
    constructor(opts: { position: unknown }) {
      this.position = opts.position;
      markers.push(this);
    }
    addEventListener() {}
  }
  class FakeSearch extends HTMLElement {
    constructor() {
      super();
    }
  }
  customElements.define('fake-place-search', FakeSearch);
  return {
    ILOILO: { lat: 10.7202, lng: 122.5621 },
    mapsKey: 'test-key',
    mapId: 'DEMO_MAP_ID',
    toLatLng: (p: { lat: number; lng: number } | null) => p,
    loadMaps: async () => ({
      importLibrary: async (name: string) =>
        name === 'maps'
          ? { Map: FakeMap }
          : name === 'marker'
            ? { AdvancedMarkerElement: FakeMarker }
            : { PlaceAutocompleteElement: FakeSearch },
    }),
  };
});

const { AddressPicker } = await import('./AddressPicker');

afterEach(() => {
  cleanup();
  markers.length = 0;
});

describe('the delivery map', () => {
  it('moves the pin when the spot is set from outside the map (an account’s saved pin)', async () => {
    const props = { address: '', onAddress: () => {}, onPin: () => {} };
    const { rerender } = render(<AddressPicker {...props} pin={null} />);
    await act(async () => {}); // the map loads
    expect(markers).toHaveLength(1);
    expect(markers[0].position).toBeNull();

    // Checkout fills in the signed-in customer's saved pin after the map is up.
    rerender(<AddressPicker {...props} pin={{ lat: 10.7, lng: 122.55 }} />);
    expect(markers[0].position).toEqual({ lat: 10.7, lng: 122.55 });
  });
});
