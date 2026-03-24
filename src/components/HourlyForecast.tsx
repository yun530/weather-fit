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
      className="flex gap-2 overflow-x-auto scroll-hide"
      style={{ background: '#3E8A24', padding: '10px 16px' }}
    >
      {hourly.map((h, i) => (
        <div key={i} className="item-slot" style={{ gap: '4px' }}>
          <span style={{ fontSize: '10px', color: '#C8EE88', fontFamily: 'DotGothic16', lineHeight: 1.4 }}>{h.time}</span>
          <span style={{ fontSize: '22px', lineHeight: 1.2 }}>{getSkyEmoji(h.sky, h.pty)}</span>
          <span className="pixel-num" style={{ fontSize: '10px', color: '#1A0A00', lineHeight: 1.4 }}>{Math.round(h.tmp)}°</span>
          <span style={{ fontSize: '10px', color: h.pop > 0 ? '#2A5AEE' : 'transparent', fontFamily: 'DotGothic16', lineHeight: 1.4 }}>
            {h.pop > 0 ? `${h.pop}%` : '·'}
          </span>
        </div>
      ))}
    </div>
  );
}
