import { getSkyEmoji, getSkyDesc } from '../utils/outfitEngine';

export interface TomorrowData {
  tmpMin: number;
  tmpMax: number;
  sky: number;
  pty: number;
  pop: number;
  dayLabel: string;
}

interface Props {
  data: TomorrowData;
}

export default function TomorrowCard({ data }: Props) {
  return (
    <div style={{ background: '#F8F9FA', borderRadius: '24px', padding: '16px 20px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', color: '#111', fontWeight: 600 }}>내일 · {data.dayLabel}</div>
        <div style={{ fontSize: '13px', color: '#666' }}>{getSkyDesc(data.sky, data.pty)}</div>
      </div>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: '32px' }}>{getSkyEmoji(data.sky, data.pty)}</span>
        <div className="text-right">
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#333' }}>{data.tmpMax}°</div>
          <div style={{ fontSize: '14px', color: '#888', marginTop: '2px' }}>{data.tmpMin}°</div>
          {data.pop > 0 && (
            <div style={{ fontSize: '11px', color: '#32A1FF', marginTop: '6px', fontWeight: 500 }}>
              ☔ {data.pop}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
