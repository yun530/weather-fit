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
    <div className="parchment" style={{ borderRadius: '2px', padding: '14px 16px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#5A3A10', fontFamily: 'DotGothic16' }}>내일 · {data.dayLabel}</div>
        <div style={{ fontSize: '12px', color: '#5A3A10', fontFamily: 'DotGothic16' }}>{getSkyDesc(data.sky, data.pty)}</div>
      </div>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: '40px' }}>{getSkyEmoji(data.sky, data.pty)}</span>
        <div className="text-right">
          <div className="pixel-num" style={{ fontSize: '20px', color: '#CC4400' }}>{data.tmpMax}°</div>
          <div className="pixel-num" style={{ fontSize: '14px', color: '#2244CC', marginTop: '2px' }}>{data.tmpMin}°</div>
          {data.pop > 0 && (
            <div style={{ fontSize: '10px', color: '#5A3A10', marginTop: '6px', fontFamily: 'DotGothic16' }}>
              ☔ {data.pop}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
