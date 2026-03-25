import leegongCharacter from '../assets/leegong_character.png';

export default function WeatherCharacter() {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative">
        <img 
          src={leegongCharacter} 
          alt="Weather Character" 
          style={{ 
            width: '200px', 
            height: 'auto',
            display: 'block',
            margin: '0 auto'
          }} 
        />
      </div>
    </div>
  );
}
