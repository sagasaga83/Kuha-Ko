import { useNow } from '../hooks/motion';

interface CountdownProps {
  /** ISO date, counted to midnight in Manila. */
  to: string;
  label: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** A ticking countdown in the label face: days, hours, minutes, seconds. */
export function Countdown({ to, label }: CountdownProps) {
  const now = useNow(1000);
  const target = new Date(`${to}T00:00:00+08:00`).getTime();
  const left = Math.max(0, target - now);
  if (left === 0) return <p className="countdown__done">We’re open. Come by.</p>;
  const s = Math.floor(left / 1000);
  const parts = [
    { v: Math.floor(s / 86400), u: 'days' },
    { v: pad(Math.floor((s % 86400) / 3600)), u: 'hrs' },
    { v: pad(Math.floor((s % 3600) / 60)), u: 'min' },
    { v: pad(s % 60), u: 'sec' },
  ];
  return (
    <div className="countdown" role="timer" aria-label={`${label}: ${parts[0].v} days`}>
      <p className="label">{label}</p>
      <div className="countdown__row" aria-hidden="true">
        {parts.map((p) => (
          <span key={p.u} className="countdown__part">
            <span className="countdown__num">{p.v}</span>
            <span className="countdown__unit">{p.u}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
