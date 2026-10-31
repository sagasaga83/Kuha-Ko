import { HangTag, SubBrandLabel } from '@kuhako/ui';

const promises = [
  {
    title: 'One of each',
    body: 'Every piece on the rack is the only one. Once it’s gone, it’s gone.',
  },
  {
    title: 'Honest tags',
    body: 'Size and measurements on every tag, and any flaw shown in a close-up photo before you ask.',
  },
  {
    title: 'Kuha of the Week',
    body: 'One standout piece, posted every week. Show us yours with #KuhaKoFinds.',
  },
];

export function ThriftSection() {
  return (
    <section id="thrift" className="section thrift" aria-labelledby="thrift-title">
      <div className="container thrift__inner">
        <div className="thrift__copy">
          <SubBrandLabel shop="thrift" />
          <h2 id="thrift-title" className="section__title">
            Pre-loved, one of a kind
          </h2>
          <p className="section__lede">
            Behind the coffee bar: racks of hand-picked ukay finds, a fitting room and a vintage mirror. Grab a cup and
            take your time.
          </p>
          <ul className="thrift__promises">
            {promises.map((p) => (
              <li key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="thrift__tag" aria-hidden="true">
          <HangTag number="0142" size="M" note="denim jacket · one of one" />
        </div>
      </div>
    </section>
  );
}
