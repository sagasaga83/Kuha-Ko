export interface MenuItemProps {
  /** The drink's menu name, in sentence case: "Thrift-y Americano". */
  name: string;
  /** What it is, plainly: "Americano". Shown in the label style. */
  kind: string;
  description: string;
  /** Hot price as shown ("₱120"). Leave out until prices are set. */
  hot?: string;
  iced?: string;
  /** Marks the house drink with a HOUSE eyebrow. */
  house?: boolean;
  /** Paper panel on linen, or the dark menu board. */
  tone?: 'paper' | 'board';
}

/** One drink on the Kuha Ko Coffee menu. */
export function MenuItem({ name, kind, description, hot, iced, house, tone = 'paper' }: MenuItemProps) {
  const hasPrice = Boolean(hot || iced);
  return (
    <article className={`kk-menuitem kk-menuitem--${tone}`}>
      <h3 className="kk-menuitem__name">{name}</h3>
      <div className="kk-menuitem__meta">
        <p className="kk-menuitem__kind">
          {kind}
          {house ? ' · House' : ''}
        </p>
        <p className="kk-menuitem__price">
          {hasPrice ? (
            <>
              {hot ? <span>Hot {hot}</span> : null}
              {hot && iced ? ' · ' : null}
              {iced ? <span>Iced {iced}</span> : null}
            </>
          ) : (
            'Price at opening'
          )}
        </p>
      </div>
      <p className="kk-menuitem__desc">{description}</p>
    </article>
  );
}
