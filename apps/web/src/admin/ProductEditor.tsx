import { useState, type FormEvent } from 'react';
import {
  formatPeso,
  KIND_LABELS,
  parsePeso,
  slugify,
  type Kind,
  type OptionGroup,
  type Product,
  type ProductInput,
} from '../../shared/catalog';
import { productInputSchema } from '../../shared/schema';
import { menu } from '../data/menu';
import { adminApi, ApiError, guarded, uploadPhoto } from './api';

export function blankProduct(kind: Kind): Product {
  return {
    id: '',
    kind,
    category: kind === 'coffee' ? menu[0].id : kind === 'shirt' ? 'shirts' : 'thrift',
    name: '',
    description: '',
    detail: '',
    photoUrl: null,
    price: null,
    options:
      kind === 'shirt'
        ? [
            { id: 'colour', label: 'Colour', multi: false, values: [{ id: 'black', label: 'Black', delta: 0 }] },
            {
              id: 'size',
              label: 'Size',
              multi: false,
              values: ['S', 'M', 'L', 'XL'].map((s) => ({ id: s.toLowerCase(), label: s, delta: 0 })),
            },
          ]
        : kind === 'coffee'
          ? [
              {
                id: 'temperature',
                label: 'Hot or iced',
                multi: false,
                values: [
                  { id: 'hot', label: 'Hot', delta: 0 },
                  { id: 'iced', label: 'Iced', delta: 0 },
                ],
              },
            ]
          : [],
    stock: kind === 'thrift' ? 1 : null,
    active: true,
    featured: false,
    sort: 0,
  };
}

// Form state keeps money and numbers as typed text until saving.
interface ValueDraft {
  id: string;
  label: string;
  delta: string;
}
interface GroupDraft {
  id: string;
  label: string;
  multi: boolean;
  values: ValueDraft[];
}

const pesoText = (c: number | null) => (c === null ? '' : String(c / 100));
const toDraft = (g: OptionGroup): GroupDraft => ({
  ...g,
  values: g.values.map((v) => ({ ...v, delta: v.delta ? pesoText(v.delta) : '' })),
});

/** Unique ids from labels: "Oat milk" → "oat-milk", a repeat → "oat-milk-2". */
function withIds<T extends { id: string; label: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.map((item) => {
    const base = item.id || slugify(item.label).slice(0, 36) || 'option';
    let id = base;
    for (let n = 2; seen.has(id); n++) id = `${base}-${n}`;
    seen.add(id);
    return { ...item, id };
  });
}

const DETAIL_LABEL: Record<Kind, string> = {
  coffee: 'Drink style (shown under the name, e.g. Latte)',
  shirt: 'Detail (optional, e.g. Heavyweight cotton)',
  thrift: 'Size and measurements (e.g. M · chest 52 cm · length 70 cm)',
};

export function ProductEditor({
  initial,
  isNew,
  onClose,
  onSignedOut,
}: {
  initial: Product;
  isNew: boolean;
  onClose: (changed: boolean) => void;
  onSignedOut: () => void;
}) {
  const [p, setP] = useState(initial);
  const [price, setPrice] = useState(pesoText(initial.price));
  const [stock, setStock] = useState(initial.stock === null ? '' : String(initial.stock));
  const [groups, setGroups] = useState<GroupDraft[]>(initial.options.map(toDraft));
  const [busy, setBusy] = useState<'' | 'save' | 'photo' | 'delete'>('');
  const [error, setError] = useState('');

  const set = <K extends keyof Product>(key: K, value: Product[K]) => setP((cur) => ({ ...cur, [key]: value }));
  const setGroup = (gi: number, g: Partial<GroupDraft>) =>
    setGroups((gs) => gs.map((x, i) => (i === gi ? { ...x, ...g } : x)));
  const setValue = (gi: number, vi: number, v: Partial<ValueDraft>) =>
    setGroups((gs) =>
      gs.map((x, i) => (i === gi ? { ...x, values: x.values.map((y, j) => (j === vi ? { ...y, ...v } : y)) } : x)),
    );

  const build = (): ProductInput | string => {
    const priceC = parsePeso(price);
    if (Number.isNaN(priceC)) return 'Price: type an amount like 120 or 120.50, or leave it empty.';
    const stockN = stock.trim() === '' ? null : Number(stock);
    if (stockN !== null && (!Number.isInteger(stockN) || stockN < 0)) return 'Stock: a whole number, or empty for no limit.';
    const options: OptionGroup[] = [];
    for (const g of withIds(groups.filter((g) => g.label.trim() || g.values.some((v) => v.label.trim())))) {
      const values = [];
      for (const v of withIds(g.values.filter((v) => v.label.trim()))) {
        const d = parsePeso(v.delta);
        if (Number.isNaN(d)) return `${g.label || 'Option'} → ${v.label}: type an amount like 20, or leave it empty.`;
        values.push({ id: v.id, label: v.label.trim(), delta: d ?? 0 });
      }
      if (!g.label.trim()) return 'Every option group needs a name, e.g. Size.';
      if (values.length === 0) return `${g.label}: add at least one choice, or remove the group.`;
      options.push({ id: g.id, label: g.label.trim(), multi: g.multi, values });
    }
    const input = { ...p, id: isNew ? undefined : p.id, price: priceC, stock: stockN, options };
    const parsed = productInputSchema.safeParse(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return `${issue.path.join(' → ') || 'Product'}: ${issue.message}`;
    }
    return parsed.data;
  };

  const save = async (e?: FormEvent, override?: Partial<Product>) => {
    e?.preventDefault();
    const input = build();
    if (typeof input === 'string') {
      setError(input);
      return;
    }
    setBusy('save');
    setError('');
    try {
      const body = { ...input, ...override };
      await guarded(() => (isNew ? adminApi.createProduct(body) : adminApi.updateProduct(p.id, body)), onSignedOut);
      onClose(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
      setBusy('');
    }
  };

  const pickPhoto = async (file: File | undefined) => {
    if (!file) return;
    setBusy('photo');
    setError('');
    try {
      set('photoUrl', await uploadPhoto(file));
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? `Photo: ${err.message}` : 'Photo upload failed.');
    } finally {
      setBusy('');
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete “${p.name}” for good? To take it off the site for now, untick “Show on the site” instead.`)) return;
    setBusy('delete');
    try {
      await guarded(() => adminApi.deleteProduct(p.id), onSignedOut);
      onClose(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete.');
      setBusy('');
    }
  };

  return (
    <form className="adm-card adm-editor" onSubmit={save} noValidate>
      <div className="adm-editor__head">
        <button type="button" className="adm-link" onClick={() => onClose(false)}>
          ← Products
        </button>
        <h1 className="adm-h1">{isNew ? `New ${KIND_LABELS[p.kind].toLowerCase().replace(/s$/, '')}` : p.name}</h1>
      </div>

      <div className="adm-photo">
        {p.photoUrl ? <img src={p.photoUrl} alt="" /> : <span className="adm-photo__empty">No photo</span>}
        <div className="adm-photo__actions">
          <label className="kk-button kk-button--secondary adm-file">
            {busy === 'photo' ? 'Uploading…' : p.photoUrl ? 'Change photo' : 'Add photo'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => pickPhoto(e.target.files?.[0])}
              disabled={busy !== ''}
            />
          </label>
          {p.photoUrl ? (
            <button type="button" className="adm-link" onClick={() => set('photoUrl', null)}>
              Remove photo
            </button>
          ) : null}
        </div>
      </div>

      <label className="adm-field">
        <span>Name</span>
        <input value={p.name} onChange={(e) => set('name', e.target.value)} required maxLength={80} />
      </label>
      {p.kind === 'coffee' ? (
        <label className="adm-field">
          <span>Menu group</span>
          <select value={p.category} onChange={(e) => set('category', e.target.value)}>
            {menu.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="adm-field">
        <span>{DETAIL_LABEL[p.kind]}</span>
        <input value={p.detail} onChange={(e) => set('detail', e.target.value)} maxLength={200} />
      </label>
      <label className="adm-field">
        <span>Description{p.kind === 'thrift' ? ' (condition, and any flaw)' : ''}</span>
        <textarea value={p.description} onChange={(e) => set('description', e.target.value)} rows={3} maxLength={500} />
      </label>

      <div className="adm-grid">
        <label className="adm-field">
          <span>Price (₱){p.kind === 'coffee' ? ', hot' : ''}</span>
          <input inputMode="decimal" placeholder="Not set" value={price} onChange={(e) => setPrice(e.target.value)} />
          <small>{price.trim() === '' ? 'Empty shows “Price at opening” and can’t be ordered.' : null}</small>
        </label>
        <label className="adm-field">
          <span>Stock</span>
          <input inputMode="numeric" placeholder="No limit" value={stock} onChange={(e) => setStock(e.target.value)} />
          <small>{p.kind === 'thrift' ? 'One of one: 1, or 0 once sold.' : 'Empty for no limit.'}</small>
        </label>
      </div>

      <label className="adm-check">
        <input type="checkbox" checked={p.active} onChange={(e) => set('active', e.target.checked)} />
        <span>Show on the site</span>
      </label>
      {p.kind === 'coffee' ? (
        <label className="adm-check">
          <input type="checkbox" checked={p.featured} onChange={(e) => set('featured', e.target.checked)} />
          <span>House drink</span>
        </label>
      ) : null}

      <fieldset className="adm-options">
        <legend className="adm-h2">Options</legend>
        <p className="adm-note">
          Choices the customer picks when ordering. The amount is added to the price; leave it empty for no extra charge.
        </p>
        {groups.map((g, gi) => (
          <div key={gi} className="adm-group">
            <div className="adm-group__head">
              <input
                aria-label="Option group name"
                placeholder="Group name, e.g. Size"
                value={g.label}
                onChange={(e) => setGroup(gi, { label: e.target.value })}
              />
              <button type="button" className="adm-link" onClick={() => setGroups((gs) => gs.filter((_, i) => i !== gi))}>
                Remove group
              </button>
            </div>
            <label className="adm-check">
              <input type="checkbox" checked={g.multi} onChange={(e) => setGroup(gi, { multi: e.target.checked })} />
              <span>Customers can pick more than one (like add-ons)</span>
            </label>
            {g.values.map((v, vi) => (
              <div key={vi} className="adm-value">
                <input
                  aria-label="Choice"
                  placeholder="Choice, e.g. Large"
                  value={v.label}
                  onChange={(e) => setValue(gi, vi, { label: e.target.value })}
                />
                <input
                  aria-label={`Extra charge for ${v.label || 'this choice'} (₱)`}
                  inputMode="decimal"
                  placeholder="+₱0"
                  value={v.delta}
                  onChange={(e) => setValue(gi, vi, { delta: e.target.value })}
                />
                <button
                  type="button"
                  className="adm-link"
                  aria-label={`Remove ${v.label || 'choice'}`}
                  onClick={() => setGroup(gi, { values: g.values.filter((_, j) => j !== vi) })}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="adm-link"
              onClick={() => setGroup(gi, { values: [...g.values, { id: '', label: '', delta: '' }] })}
            >
              + Add a choice
            </button>
          </div>
        ))}
        <button
          type="button"
          className="adm-link"
          onClick={() => setGroups((gs) => [...gs, { id: '', label: '', multi: false, values: [{ id: '', label: '', delta: '' }] }])}
        >
          + Add an option group
        </button>
      </fieldset>

      {error ? (
        <p className="adm-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="adm-actions adm-actions--end">
        {!isNew ? (
          <button type="button" className="adm-link adm-link--danger" onClick={remove} disabled={busy !== ''}>
            Delete
          </button>
        ) : null}
        {!isNew && p.kind === 'thrift' && p.stock !== 0 ? (
          <button
            type="button"
            className="kk-button kk-button--secondary"
            disabled={busy !== ''}
            onClick={() => save(undefined, { stock: 0 })}
          >
            Mark as sold
          </button>
        ) : null}
        <button type="submit" className="kk-button kk-button--primary" disabled={busy !== ''}>
          {busy === 'save' ? 'Saving…' : 'Save'}
        </button>
      </div>
      {p.price !== null || price ? (
        <p className="adm-note">
          {(() => {
            const c = parsePeso(price);
            return c !== null && !Number.isNaN(c) ? `Customers see ${formatPeso(c)}.` : null;
          })()}
        </p>
      ) : null}
    </form>
  );
}
