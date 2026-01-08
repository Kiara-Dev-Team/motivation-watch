import React, { useState, useEffect } from 'react';

export default function MoonwatchApp() {
  const [time, setTime] = useState(new Date());
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [lapTimes, setLapTimes] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setStopwatchTime(prev => prev + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }).toUpperCase();
  };

  const formatStopwatch = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => setIsRunning(!isRunning);
  const handleReset = () => {
    if (!isRunning) {
      setStopwatchTime(0);
      setLapTimes([]);
    } else {
      setLapTimes(prev => [stopwatchTime, ...prev].slice(0, 5));
    }
  };

  const secondRotation = time.getSeconds() * 6;
  const minuteRotation = time.getMinutes() * 6 + time.getSeconds() * 0.1;
  const hourRotation = (time.getHours() % 12) * 30 + time.getMinutes() * 0.5;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />
      
      <div className="relative">
        {/* Brand header */}
        <div className="text-center mb-8">
          <p className="text-gray-500 text-xs tracking-widest mb-1">CHRONOGRAPH</p>
          <h1 className="text-white text-2xl tracking-wider" style={{ fontStyle: 'italic', fontWeight: 300 }}>
            Moonwatch
          </h1>
          <p className="text-gray-600 text-xs tracking-widest mt-1">PROFESSIONAL</p>
        </div>

        {/* Main watch face */}
        <div className="relative w-80 h-80 mx-auto">
          {/* Outer bezel ring */}
          <div className="absolute inset-0 rounded-full" style={{
            background: 'linear-gradient(145deg, #2a2a2a 0%, #0a0a0a 50%, #1a1a1a 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.05)'
          }} />
          
          {/* Tachymeter bezel */}
          <div className="absolute inset-2 rounded-full" style={{
            background: 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
            border: '1px solid #333'
          }}>
            {/* Tachymeter markings */}
            {[...Array(60)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-full"
                style={{ transform: `rotate(${i * 6}deg)` }}
              >
                <div 
                  className={`absolute left-1/2 -translate-x-1/2 ${i % 5 === 0 ? 'h-3 w-0.5 bg-gray-400' : 'h-1.5 w-px bg-gray-600'}`}
                  style={{ top: '4px' }}
                />
              </div>
            ))}
          </div>

          {/* Inner dial */}
          <div className="absolute inset-6 rounded-full" style={{
            background: 'linear-gradient(180deg, #0f0f0f 0%, #050505 100%)',
            boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.8)'
          }}>
            {/* Hour markers */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-full"
                style={{ transform: `rotate(${i * 30}deg)` }}
              >
                <div 
                  className="absolute left-1/2 -translate-x-1/2 w-1 h-4 rounded-sm"
                  style={{ 
                    top: '12px',
                    background: 'linear-gradient(180deg, #f5f5dc 0%, #c4b59d 100%)',
                    boxShadow: '0 0 4px rgba(245, 245, 220, 0.3)'
                  }}
                />
              </div>
            ))}

            {/* Sub-dials */}
            {/* Stopwatch minutes - top left */}
            <div className="absolute top-12 left-8 w-14 h-14 rounded-full" style={{
              background: 'linear-gradient(180deg, #0a0a0a 0%, #000 100%)',
              border: '1px solid #222'
            }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-400 text-xs font-light tracking-wider">
                  {Math.floor(stopwatchTime / 60000).toString().padStart(2, '0')}
                </span>
              </div>
              {[...Array(12)].map((_, i) => (
                <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${i * 30}deg)` }}>
                  <div className="absolute left-1/2 -translate-x-1/2 w-px h-1 bg-gray-600" style={{ top: '2px' }} />
                </div>
              ))}
            </div>

            {/* Running seconds - top right */}
            <div className="absolute top-12 right-8 w-14 h-14 rounded-full" style={{
              background: 'linear-gradient(180deg, #0a0a0a 0%, #000 100%)',
              border: '1px solid #222'
            }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-400 text-xs font-light">
                  {time.getSeconds().toString().padStart(2, '0')}
                </span>
              </div>
              <div 
                className="absolute w-0.5 h-5 bg-white origin-bottom left-1/2 -translate-x-1/2"
                style={{ 
                  top: '7px',
                  transform: `translateX(-50%) rotate(${secondRotation}deg)`,
                  transformOrigin: 'bottom center'
                }}
              />
            </div>

            {/* Stopwatch seconds - bottom */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full" style={{
              background: 'linear-gradient(180deg, #0a0a0a 0%, #000 100%)',
              border: '1px solid #222'
            }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-400 text-xs font-light">
                  {Math.floor((stopwatchTime % 60000) / 1000).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Center time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center -mt-2">
                <p className="text-gray-500 text-xs tracking-widest mb-1">Ω</p>
                <p className="text-white text-3xl font-light tracking-wider" style={{ fontFeatureSettings: '"tnum"' }}>
                  {formatTime(time)}
                </p>
                <p className="text-gray-500 text-xs tracking-widest mt-1">{formatDate(time)}</p>
              </div>
            </div>

            {/* Analog hands overlay */}
            <div className="absolute inset-0">
              {/* Hour hand */}
              <div 
                className="absolute left-1/2 top-1/2 w-1 h-16 -ml-0.5 origin-bottom"
                style={{ 
                  transform: `translateY(-100%) rotate(${hourRotation}deg)`,
                  background: 'linear-gradient(180deg, #f5f5dc 0%, #8b8b7a 100%)',
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)'
                }}
              />
              {/* Minute hand */}
              <div 
                className="absolute left-1/2 top-1/2 w-0.5 h-24 -ml-px origin-bottom"
                style={{ 
                  transform: `translateY(-100%) rotate(${minuteRotation}deg)`,
                  background: 'linear-gradient(180deg, #f5f5dc 0%, #8b8b7a 100%)'
                }}
              />
              {/* Center cap */}
              <div className="absolute left-1/2 top-1/2 w-3 h-3 -ml-1.5 -mt-1.5 rounded-full" style={{
                background: 'linear-gradient(145deg, #333 0%, #111 100%)',
                border: '1px solid #444'
              }} />
            </div>
          </div>
        </div>

        {/* Stopwatch display */}
        <div className="text-center mt-8 mb-6">
          <p className="text-gray-600 text-xs tracking-widest mb-2">CHRONOGRAPH</p>
          <p className="text-white text-4xl font-extralight tracking-wider" style={{ fontFeatureSettings: '"tnum"' }}>
            {formatStopwatch(stopwatchTime)}
          </p>
        </div>

        {/* Control buttons */}
        <div className="flex justify-center gap-8">
          <button
            onClick={handleReset}
            className="w-16 h-16 rounded-full transition-all duration-200 active:scale-95"
            style={{
              background: 'linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 100%)',
              border: '2px solid #333',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}
          >
            <span className="text-gray-400 text-xs tracking-wider">
              {isRunning ? 'LAP' : 'RESET'}
            </span>
          </button>
          
          <button
            onClick={handleStartStop}
            className="w-16 h-16 rounded-full transition-all duration-200 active:scale-95"
            style={{
              background: isRunning 
                ? 'linear-gradient(145deg, #2a1a1a 0%, #1a0a0a 100%)'
                : 'linear-gradient(145deg, #1a2a1a 0%, #0a1a0a 100%)',
              border: `2px solid ${isRunning ? '#4a3333' : '#334a33'}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}
          >
            <span className={`text-xs tracking-wider ${isRunning ? 'text-red-400' : 'text-green-400'}`}>
              {isRunning ? 'STOP' : 'START'}
            </span>
          </button>
        </div>

        {/* Lap times */}
        {lapTimes.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-xs tracking-widest mb-3">LAP TIMES</p>
            <div className="space-y-1">
              {lapTimes.map((lap, i) => (
                <p key={i} className="text-gray-500 text-sm font-light" style={{ fontFeatureSettings: '"tnum"' }}>
                  {formatStopwatch(lap)}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-gray-700 text-xs tracking-widest">SWISS MADE</p>
        </div>
      </div>
    </div>
  );
}