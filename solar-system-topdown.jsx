import { useState, useEffect, useMemo } from 'react';

const planets = [
  { name: 'Mercury', color: '#b5b5b5', size: 2.4, distance: 58, speed: 4.15, moons: 0, dayLength: '59 days', year: '88 days' },
  { name: 'Venus', color: '#e6c87a', size: 6, distance: 108, speed: 1.62, moons: 0, dayLength: '243 days', year: '225 days' },
  { name: 'Earth', color: '#6b93d6', size: 6.4, distance: 150, speed: 1, moons: 1, dayLength: '24 hours', year: '365 days' },
  { name: 'Mars', color: '#c1440e', size: 3.4, distance: 228, speed: 0.53, moons: 2, dayLength: '24.6 hours', year: '687 days' },
  { name: 'Jupiter', color: '#d8ca9d', size: 35, distance: 778, speed: 0.084, moons: 95, dayLength: '10 hours', year: '12 years' },
  { name: 'Saturn', color: '#f4d59e', size: 29, distance: 1427, speed: 0.034, moons: 146, hasRings: true, dayLength: '10.7 hours', year: '29 years' },
  { name: 'Uranus', color: '#d1e7e7', size: 13, distance: 2871, speed: 0.012, moons: 28, dayLength: '17 hours', year: '84 years' },
  { name: 'Neptune', color: '#5b5ddf', size: 12, distance: 4497, speed: 0.006, moons: 16, dayLength: '16 hours', year: '165 years' },
];

// Scale distance logarithmically for better visualization
const scaleDistance = (d) => 35 + Math.pow(d, 0.45) * 3.5;

export default function SolarSystemTopDown() {
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [showAsteroidBelt, setShowAsteroidBelt] = useState(true);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setTime(t => t + 0.008 * speed);
    }, 16);
    return () => clearInterval(interval);
  }, [isPaused, speed]);

  // Generate asteroid belt
  const asteroids = useMemo(() => 
    [...Array(200)].map((_, i) => ({
      angle: (i / 200) * Math.PI * 2 + Math.random() * 0.3,
      distance: scaleDistance(400) + (Math.random() - 0.5) * 30,
      size: Math.random() * 1.5 + 0.5,
      speed: 0.15 + Math.random() * 0.1,
      opacity: Math.random() * 0.5 + 0.3
    })), []
  );

  // Generate stars
  const stars = useMemo(() => 
    [...Array(400)].map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.2 + 0.3,
      opacity: Math.random() * 0.6 + 0.2
    })), []
  );

  const viewBox = useMemo(() => {
    const size = 500 / zoom;
    return `-${size} -${size} ${size * 2} ${size * 2}`;
  }, [zoom]);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Star background */}
      <svg className="absolute inset-0 w-full h-full">
        {stars.map((star, i) => (
          <circle
            key={i}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.size}
            fill="white"
            opacity={star.opacity}
          />
        ))}
      </svg>

      {/* Main Solar System - Top Down View */}
      <svg viewBox={viewBox} className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Sun gradients */}
          <radialGradient id="sunCore">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fff5d4" />
            <stop offset="60%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#ff8c00" />
          </radialGradient>
          
          <radialGradient id="sunGlow">
            <stop offset="0%" stopColor="#ffd700" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#ff6600" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="sunCorona">
            <stop offset="0%" stopColor="#ffcc00" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ff6600" stopOpacity="0" />
          </radialGradient>

          {/* Planet gradients for 3D effect */}
          {planets.map(planet => (
            <radialGradient key={`grad-${planet.name}`} id={`planet-${planet.name}`} cx="35%" cy="35%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="30%" stopColor={planet.color} />
              <stop offset="100%" stopColor={planet.color} style={{ filter: 'brightness(0.6)' }} />
            </radialGradient>
          ))}

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Strong glow for sun */}
          <filter id="sunFilter" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur1" />
            <feGaussianBlur stdDeviation="6" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Orbit paths */}
        {showOrbits && planets.map((planet) => {
          const orbitRadius = scaleDistance(planet.distance);
          const isSelected = selectedPlanet?.name === planet.name;
          
          return (
            <circle
              key={`orbit-${planet.name}`}
              cx="0"
              cy="0"
              r={orbitRadius}
              fill="none"
              stroke={isSelected ? planet.color : "rgba(255,255,255,0.12)"}
              strokeWidth={isSelected ? 1.5 : 0.5}
              strokeDasharray={isSelected ? "none" : "4,6"}
            />
          );
        })}

        {/* Asteroid belt */}
        {showAsteroidBelt && asteroids.map((asteroid, i) => {
          const angle = asteroid.angle + time * asteroid.speed;
          const x = Math.cos(angle) * asteroid.distance;
          const y = Math.sin(angle) * asteroid.distance;
          
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={asteroid.size}
              fill="#8b7355"
              opacity={asteroid.opacity}
            />
          );
        })}

        {/* Sun */}
        <g>
          {/* Outer corona */}
          <circle cx="0" cy="0" r="45" fill="url(#sunCorona)" />
          
          {/* Middle glow */}
          <circle cx="0" cy="0" r="30" fill="url(#sunGlow)" />
          
          {/* Sun surface */}
          <circle cx="0" cy="0" r="18" fill="url(#sunCore)" filter="url(#sunFilter)" />
        </g>

        {/* Planets */}
        {planets.map((planet) => {
          const orbitRadius = scaleDistance(planet.distance);
          const angle = time * planet.speed * 0.3;
          const x = Math.cos(angle) * orbitRadius;
          const y = Math.sin(angle) * orbitRadius;
          const isSelected = selectedPlanet?.name === planet.name;
          const displaySize = Math.max(planet.size * 0.35, 3) * (isSelected ? 1.2 : 1);

          return (
            <g
              key={planet.name}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedPlanet(isSelected ? null : planet)}
            >
              {/* Selection indicator */}
              {isSelected && (
                <circle
                  cx={x}
                  cy={y}
                  r={displaySize + 8}
                  fill="none"
                  stroke={planet.color}
                  strokeWidth="1"
                  opacity="0.6"
                  strokeDasharray="3,3"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from={`0 ${x} ${y}`}
                    to={`360 ${x} ${y}`}
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Saturn's rings - top down view shows as circle */}
              {planet.hasRings && (
                <>
                  <circle
                    cx={x}
                    cy={y}
                    r={displaySize * 2.2}
                    fill="none"
                    stroke="#c9b896"
                    strokeWidth={displaySize * 0.5}
                    opacity="0.3"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={displaySize * 1.7}
                    fill="none"
                    stroke="#d4c4a8"
                    strokeWidth={displaySize * 0.3}
                    opacity="0.4"
                  />
                </>
              )}

              {/* Planet shadow (opposite side from sun) */}
              <circle
                cx={x}
                cy={y}
                r={displaySize}
                fill={planet.color}
                filter={isSelected ? "url(#glow)" : undefined}
              />

              {/* Planet highlight */}
              <circle
                cx={x - displaySize * 0.3}
                cy={y - displaySize * 0.3}
                r={displaySize * 0.35}
                fill="white"
                opacity="0.25"
              />

              {/* Earth's moon */}
              {planet.name === 'Earth' && (
                <circle
                  cx={x + Math.cos(time * 13) * (displaySize + 6)}
                  cy={y + Math.sin(time * 13) * (displaySize + 6)}
                  r={1.5}
                  fill="#c0c0c0"
                />
              )}

              {/* Label */}
              {showLabels && (
                <text
                  x={x}
                  y={y - displaySize - 6}
                  fill="white"
                  fontSize="8"
                  textAnchor="middle"
                  opacity={isSelected ? 1 : 0.7}
                  fontFamily="system-ui, sans-serif"
                >
                  {planet.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-md rounded-xl p-5 text-white border border-gray-700/50 w-64">
        <h1 className="text-xl font-semibold mb-1">Solar System</h1>
        <p className="text-gray-400 text-xs mb-4">Top-down view (90° above ecliptic)</p>
        
        <div className="space-y-4">
          {/* Play/Pause and Speed */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              {isPaused ? '▶' : '⏸'}
            </button>
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">Speed: {speed.toFixed(1)}×</label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>

          {/* Zoom */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">Zoom: {zoom.toFixed(1)}×</label>
            <input
              type="range"
              min="0.3"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowOrbits(!showOrbits)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                showOrbits ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300'
              }`}
            >
              Orbits
            </button>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                showLabels ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300'
              }`}
            >
              Labels
            </button>
            <button
              onClick={() => setShowAsteroidBelt(!showAsteroidBelt)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                showAsteroidBelt ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300'
              }`}
            >
              Asteroids
            </button>
          </div>
        </div>
      </div>

      {/* Planet Info Panel */}
      {selectedPlanet && (
        <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-md rounded-xl p-5 text-white border border-gray-700/50 w-72">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full"
                style={{ 
                  backgroundColor: selectedPlanet.color,
                  boxShadow: `0 0 20px ${selectedPlanet.color}40`
                }}
              />
              <div>
                <h2 className="text-lg font-semibold">{selectedPlanet.name}</h2>
                <p className="text-gray-400 text-xs">
                  {selectedPlanet.hasRings ? 'Gas Giant • Ringed' : selectedPlanet.size > 10 ? 'Gas Giant' : 'Rocky Planet'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedPlanet(null)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Distance from Sun</div>
              <div className="font-medium">{selectedPlanet.distance.toLocaleString()} M km</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Known Moons</div>
              <div className="font-medium">{selectedPlanet.moons}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Day Length</div>
              <div className="font-medium">{selectedPlanet.dayLength}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Year Length</div>
              <div className="font-medium">{selectedPlanet.year}</div>
            </div>
          </div>

          {selectedPlanet.hasRings && (
            <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 text-xs text-yellow-200">
              ◈ Features prominent ring system made of ice and rock
            </div>
          )}
        </div>
      )}

      {/* Planet Quick Select */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-md rounded-full px-4 py-3 border border-gray-700/50">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-lg mr-2">☀</span>
          {planets.map((planet) => {
            const isSelected = selectedPlanet?.name === planet.name;
            return (
              <button
                key={planet.name}
                onClick={() => setSelectedPlanet(isSelected ? null : planet)}
                className={`w-6 h-6 rounded-full transition-all hover:scale-125 ${
                  isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                }`}
                style={{ backgroundColor: planet.color }}
                title={planet.name}
              />
            );
          })}
        </div>
      </div>

      {/* Scale indicator */}
      <div className="absolute bottom-4 right-4 text-gray-500 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-16 h-px bg-gray-500" />
          <span>~1 AU (scaled)</span>
        </div>
      </div>
    </div>
  );
}
