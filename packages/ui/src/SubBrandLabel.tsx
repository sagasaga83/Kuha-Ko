export interface SubBrandLabelProps {
  shop: 'coffee' | 'thrift';
}

/** Tells the two shops apart: Kuha Ko Coffee in rust, Kuha Ko Thrift in sage. */
export function SubBrandLabel({ shop }: SubBrandLabelProps) {
  return (
    <span className={`kk-subbrand kk-subbrand--${shop}`}>
      <span className="kk-subbrand__name">Kuha Ko</span>
      <span className="kk-subbrand__shop">{shop === 'coffee' ? 'Coffee' : 'Thrift'}</span>
    </span>
  );
}
