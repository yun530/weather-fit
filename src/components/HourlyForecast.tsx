import { getSkyEmoji } from '../utils/outfitEngine';

export interface HourSlot {
  time: string;
  tmp: number;
  sky: number;
  pty: number;
  pop: number;
}

interface Props {
  hourly: HourSlot[];
}

export default function HourlyForecast({ hourly }: Props) {
  if (hourly.length === 0) return null;

  return (
    <div
      className="flex gap-4 overflow-x-auto scroll-hide px-6 py-4"
      style={{ background: 'white' }}
    >
      {hourly.map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0 min-w-[48px]">
          <span style={{ fontSize: '13px', color: '#888' }}>{h.time}</span>
          <span style={{ fontSize: '24px' }}>{getSkyEmoji(h.sky, h.pty)}</span>
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#333' }}>{Math.round(h.tmp)}°</span>
          <span style={{ fontSize: '11px', color: h.pop > 0 ? '#32A1FF' : 'transparent' }}>
            {h.pop > 0 ? `${h.pop}%` : '·'}
          </span>
        </div>
      ))}
    </div>
  );
}
