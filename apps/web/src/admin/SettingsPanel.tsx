import { useEffect, useState, type FormEvent } from 'react';
import { formatPeso, KIND_LABELS, KINDS, parsePeso, type Settings } from '../../shared/catalog';
import { settingsSchema } from '../../shared/schema';
import { deliveryFee } from '../../shared/delivery';
import { adminApi, guarded } from './api';

interface Draft {
  ordering: Settings['ordering'];
  origin: string;
  radiusKm: string;
  baseFee: string;
  baseKm: string;
  perKm: string;
}

const toDraft = (s: Settings): Draft => ({
  ordering: s.ordering,
  origin: s.delivery.origin ? `${s.delivery.origin.lat}, ${s.delivery.origin.lng}` : '',
  radiusKm: String(s.delivery.radiusKm),
  baseFee: String(s.delivery.baseFee / 100),
  baseKm: String(s.delivery.baseKm),
  perKm: String(s.delivery.perKm / 100),
});

/** "10.6969, 122.5644" (copied from Google Maps) → { lat, lng }. */
export function parseLatLng(text: string): { lat: number; lng: number } | null | 'bad' {
  if (!text.trim()) return null;
  const m = text.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return 'bad';
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : 'bad';
}

function fromDraft(d: Draft): Settings | string {
  const origin = parseLatLng(d.origin);
  if (origin === 'bad') return 'Shop location: paste it as two numbers, like 10.6969, 122.5644.';
  const baseFee = parsePeso(d.baseFee);
  const perKm = parsePeso(d.perKm);
  if (baseFee === null || Number.isNaN(baseFee)) return 'Base fee: type an amount like 49.';
  if (perKm === null || Number.isNaN(perKm)) return 'Per km: type an amount like 10.';
  const parsed = settingsSchema.safeParse({
    ordering: d.ordering,
    delivery: { origin, radiusKm: Number(d.radiusKm), baseFee, baseKm: Number(d.baseKm), perKm },
  });
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return `${i.path.at(-1) === 'radiusKm' ? 'Delivery area' : i.path.at(-1) === 'baseKm' ? 'Base distance' : 'Settings'}: ${i.message}`;
  }
  return parsed.data;
}

export function SettingsPanel({ onSignedOut }: { onSignedOut: () => void }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    guarded(() => adminApi.settings(), onSignedOut)
      .then((r) => setDraft(toDraft(r.settings)))
      .catch((e: Error) => setError(e.message));
    // Load once when the panel opens.
  }, []);

  if (!draft) return error ? <p className="adm-error">{error}</p> : <p className="adm-note">Loading settings…</p>;

  const set = (patch: Partial<Draft>) => {
    setSaved(false);
    setDraft({ ...draft, ...patch });
  };
  const preview = fromDraft(draft);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (typeof preview === 'string') {
      setError(preview);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const r = await guarded(() => adminApi.saveSettings(preview), onSignedOut);
      setDraft(toDraft(r.settings));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="adm-card" onSubmit={save} noValidate>
      <section className="adm-section">
        <h2 className="adm-h2">Taking orders</h2>
        <p className="adm-note">Turn each on when you’re ready to deliver it. Items also need a price before they can be ordered.</p>
        {KINDS.map((k) => (
          <label key={k} className="adm-check">
            <input
              type="checkbox"
              checked={draft.ordering[k]}
              onChange={(e) => set({ ordering: { ...draft.ordering, [k]: e.target.checked } })}
            />
            <span>{KIND_LABELS[k]}</span>
          </label>
        ))}
      </section>

      <section className="adm-section">
        <h2 className="adm-h2">Delivery</h2>
        <label className="adm-field">
          <span>Shop location (where deliveries start)</span>
          <input
            placeholder="Not set: delivery is off"
            value={draft.origin}
            onChange={(e) => set({ origin: e.target.value })}
            inputMode="decimal"
          />
          <small>In Google Maps, long-press the shop, then copy the two numbers it shows, like 10.6969, 122.5644.</small>
        </label>
        <div className="adm-grid">
          <label className="adm-field">
            <span>Delivery area (km by road)</span>
            <input inputMode="decimal" value={draft.radiusKm} onChange={(e) => set({ radiusKm: e.target.value })} />
          </label>
          <label className="adm-field">
            <span>Base fee (₱)</span>
            <input inputMode="decimal" value={draft.baseFee} onChange={(e) => set({ baseFee: e.target.value })} />
          </label>
          <label className="adm-field">
            <span>Base fee covers the first (km)</span>
            <input inputMode="decimal" value={draft.baseKm} onChange={(e) => set({ baseKm: e.target.value })} />
          </label>
          <label className="adm-field">
            <span>Then per km (₱)</span>
            <input inputMode="decimal" value={draft.perKm} onChange={(e) => set({ perKm: e.target.value })} />
          </label>
        </div>
        {typeof preview !== 'string' ? (
          <table className="adm-table">
            <caption className="adm-note">What customers pay for delivery</caption>
            <thead>
              <tr>
                <th scope="col">Distance</th>
                <th scope="col">Fee</th>
              </tr>
            </thead>
            <tbody>
              {[1, 3, 5, 8, 12].map((km) => {
                const fee = deliveryFee(km * 1000, preview.delivery);
                return (
                  <tr key={km}>
                    <td>{km} km</td>
                    <td>{fee === null ? 'Outside the area' : formatPeso(fee)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}
      </section>

      {error ? (
        <p className="adm-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="adm-actions adm-actions--end">
        {saved ? <span className="adm-saved">Saved</span> : null}
        <button type="submit" className="kk-button kk-button--primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </form>
  );
}
