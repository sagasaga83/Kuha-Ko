import { useEffect, useState } from 'react';
import { formatPeso, KIND_LABELS, KINDS, type Kind, type Product } from '../../shared/catalog';
import { adminApi, guarded } from './api';
import { ProductEditor, blankProduct } from './ProductEditor';

function status(p: Product): string {
  if (!p.active) return 'Hidden';
  if (p.price === null) return 'No price yet';
  if (p.stock === 0) return 'Sold out';
  if (p.stock !== null) return `${p.stock} left`;
  return 'On sale';
}

export function ProductsPanel({ onSignedOut }: { onSignedOut: () => void }) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Product | 'new-thrift' | 'new-shirt' | 'new-coffee' | null>(null);

  const load = () =>
    guarded(() => adminApi.products(), onSignedOut)
      .then((r) => setProducts(r.products))
      .catch((e: Error) => setError(e.message));

  useEffect(() => {
    load(); // once, on open
  }, []);

  if (editing) {
    const initial = typeof editing === 'string' ? blankProduct(editing.slice(4) as Kind) : editing;
    return (
      <ProductEditor
        initial={initial}
        isNew={typeof editing === 'string'}
        onSignedOut={onSignedOut}
        onClose={(changed) => {
          setEditing(null);
          if (changed) load();
        }}
      />
    );
  }

  return (
    <>
      <div className="adm-actions">
        <button type="button" className="kk-button kk-button--primary" onClick={() => setEditing('new-thrift')}>
          Add a thrift piece
        </button>
        <button type="button" className="kk-button kk-button--secondary" onClick={() => setEditing('new-shirt')}>
          Add a shirt
        </button>
        <button type="button" className="kk-button kk-button--secondary" onClick={() => setEditing('new-coffee')}>
          Add a drink
        </button>
      </div>
      {error ? (
        <p className="adm-error" role="alert">
          {error}
        </p>
      ) : null}
      {products === null && !error ? <p className="adm-note">Loading products…</p> : null}
      {products
        ? KINDS.map((kind) => {
            const list = products.filter((p) => p.kind === kind);
            return (
              <section key={kind} className="adm-section">
                <h2 className="adm-h2">
                  {KIND_LABELS[kind]} <span className="adm-count">{list.length}</span>
                </h2>
                {list.length === 0 ? (
                  <p className="adm-note">
                    {kind === 'thrift' ? 'No thrift pieces yet. Add the ones you want to sell online.' : 'None yet.'}
                  </p>
                ) : (
                  <ul className="adm-list">
                    {list.map((p) => (
                      <li key={p.id}>
                        <button type="button" className="adm-row" onClick={() => setEditing(p)}>
                          {p.photoUrl ? <img src={p.photoUrl} alt="" className="adm-row__thumb" /> : <span className="adm-row__thumb" />}
                          <span className="adm-row__main">
                            <span className="adm-row__name">{p.name}</span>
                            <span className="adm-row__status" data-off={!p.active || p.stock === 0 || undefined}>
                              {status(p)}
                            </span>
                          </span>
                          <span className="adm-row__price">{p.price === null ? '—' : formatPeso(p.price)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })
        : null}
    </>
  );
}
