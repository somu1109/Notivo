import { useAppContext } from '../context/AppContext';
import { GlassWater, Play, Square, Droplets, ArrowUpRight } from 'lucide-react';

export default function WaterPage() {
  const { water } = useAppContext();
  const {
    isRunning,
    intervalMs,
    timeLeft,
    glasses,
    startWater,
    stopWater,
    addGlass,
    setGlassCount,
    handleIntervalChange
  } = water;

  const formatTime = (ms) => {
    if (!ms || ms < 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const intervals = [
    { label: '30m', value: 1800000 },
    { label: '45m', value: 2700000 },
    { label: '1h', value: 3600000 },
    { label: '2h', value: 7200000 }
  ];

  const toggleTimer = () => {
    if (isRunning) stopWater();
    else startWater();
  };

  // 12 glasses default as requested
  const targetGlasses = 12;
  const glassArray = Array.from({ length: Math.max(targetGlasses, glasses.count) });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '10px' }}>
      <div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 2.4vw, 2.1rem)', fontWeight: 300, letterSpacing: '-0.03em', color: 'var(--color-text-main)' }}>
          Water &amp; Hydration
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.86rem', marginTop: '2px' }}>
          Maintain peak cognitive performance with rhythmic hydration alerts.
        </p>
      </div>

      <div className="card" style={{ maxWidth: '540px', margin: '0 auto', width: '100%', padding: '16px 20px' }}>
        <div className="card-header-row" style={{ marginBottom: '6px' }}>
          <div className="card-title">
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--color-yellow-soft)',
              border: '1px solid var(--color-gray-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1C1C1E'
            }}>
              <Droplets size={14} />
            </div>
            <span style={{ fontSize: '1rem' }}>Hydration Tracker</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: isRunning ? 'var(--color-yellow)' : 'var(--color-neutral-bg)',
              color: isRunning ? '#1C1C1E' : 'var(--color-text-muted)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: isRunning ? '0 2px 8px rgba(255, 216, 77, 0.4)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span style={{ 
                width: 5, 
                height: 5, 
                borderRadius: '50%', 
                background: isRunning ? '#1C1C1E' : 'var(--color-text-muted)'
              }} />
              {isRunning ? 'Running' : 'Stopped'}
            </span>

            <div className="card-arrow-btn" style={{ width: '26px', height: '26px' }}>
              <ArrowUpRight size={13} />
            </div>
          </div>
        </div>
        
        {/* Compact countdown */}
        <div style={{ textAlign: 'center', margin: '4px 0 8px' }}>
          <div style={{ 
            fontSize: '0.72rem', 
            color: 'var(--color-text-muted)', 
            fontWeight: 500, 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em' 
          }}>
            Next Hydration Alert
          </div>
          <div className="tabular-nums" style={{ 
            fontSize: '2.4rem', 
            fontWeight: 300, 
            color: isRunning ? 'var(--color-text-main)' : 'var(--color-text-muted)', 
            lineHeight: 1,
            letterSpacing: '-0.02em',
            margin: '3px 0 5px',
            textShadow: isRunning ? '0 0 20px rgba(255, 216, 77, 0.25)' : 'none'
          }}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Segmented Frequency Control */}
        <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.76rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>
            Reminder Frequency:
          </label>
          <div className="segmented-control" style={{ padding: '2px' }}>
            {intervals.map(int => (
              <button 
                key={int.value}
                onClick={() => handleIntervalChange(int.value)}
                className={`segmented-btn ${intervalMs === int.value ? 'active' : ''}`}
                style={{ padding: '5px 8px', fontSize: '0.8rem' }}
              >
                {int.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start / Stop Timer Button */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button 
            onClick={toggleTimer} 
            className={`btn ${isRunning ? 'btn-outline' : 'btn-black'}`}
            style={{ 
              flex: 1, 
              height: '36px',
              fontSize: '0.84rem'
            }}
          >
            {isRunning ? (
              <><Square size={13} fill="currentColor" /> Stop Timer</>
            ) : (
              <><Play size={13} fill="currentColor" /> Start Timer</>
            )}
          </button>
        </div>

        <div className="dotted-divider" style={{ margin: '6px 0 10px' }}></div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--color-text-main)' }}>Today's Water Intake</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                <b style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>{glasses.count}</b> of {targetGlasses} glasses drunk ({Math.min(100, Math.round((glasses.count / targetGlasses) * 100))}%)
              </div>
            </div>
            
            <button 
              onClick={addGlass} 
              className="btn btn-black" 
              style={{ height: '32px', padding: '0 14px', fontSize: '0.78rem' }}
            >
              <GlassWater size={13} /> I drank water
            </button>
          </div>
          
          {/* 12 Animated Water Glass Tumblers (2 rows × 6 columns) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(6, 1fr)', 
            gap: '8px',
            justifyItems: 'center',
            marginTop: '6px'
          }}>
            {glassArray.map((_, i) => {
              const filled = i < glasses.count;
              return (
                <div 
                  key={i} 
                  onClick={() => {
                    if (setGlassCount) {
                      setGlassCount(filled && i === glasses.count - 1 ? i : i + 1);
                    } else {
                      addGlass();
                    }
                  }}
                  style={{ 
                    position: 'relative',
                    width: '44px', 
                    height: '52px', 
                    borderRadius: '5px 5px 13px 13px', 
                    border: '1.5px solid',
                    borderColor: filled ? 'rgba(255, 216, 77, 0.95)' : 'var(--color-gray-border)',
                    background: filled ? 'var(--color-yellow-soft)' : 'rgba(255, 255, 255, 0.45)',
                    backdropFilter: 'var(--glass-blur)',
                    WebkitBackdropFilter: 'var(--glass-blur)',
                    boxShadow: filled 
                      ? '0 4px 12px rgba(255, 216, 77, 0.32)' 
                      : '0 2px 6px rgba(0, 0, 0, 0.02)',
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: filled ? 'scale(1.02)' : 'scale(1)'
                  }}
                  title={`Glass ${i + 1} • Click to ${filled ? 'unfill' : 'fill'}`}
                >
                  {/* Top glass rim line */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'rgba(255, 255, 255, 0.75)',
                    zIndex: 3
                  }} />

                  {/* Subtle glass reflection on the left */}
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                    bottom: '2px',
                    width: '3px',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.05) 100%)',
                    borderRadius: '2px',
                    zIndex: 3,
                    pointerEvents: 'none'
                  }} />

                  {/* Animated liquid fill with wave and bubbles */}
                  {filled && (
                    <div style={{ 
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '82%',
                      background: 'linear-gradient(180deg, #FFE873 0%, #FFD84D 45%, #F5C518 100%)',
                      borderRadius: '0 0 11px 11px',
                      zIndex: 1,
                      overflow: 'hidden',
                      animation: 'popIn 0.3s cubic-bezier(0.34, 1.3, 0.64, 1)'
                    }}>
                      {/* Secondary wave layer */}
                      <svg 
                        viewBox="0 0 100 16" 
                        preserveAspectRatio="none" 
                        className="water-wave-sec" 
                        style={{ 
                          position: 'absolute', 
                          top: '-5px', 
                          left: 0, 
                          width: '200%', 
                          height: '8px', 
                          fill: 'rgba(255, 248, 222, 0.65)', 
                          zIndex: 1 
                        }}
                      >
                        <path d="M 0 8 Q 25 2, 50 8 T 100 8 T 150 8 T 200 8 V 16 H 0 Z" />
                      </svg>

                      {/* Primary wave layer */}
                      <svg 
                        viewBox="0 0 100 16" 
                        preserveAspectRatio="none" 
                        className="water-wave" 
                        style={{ 
                          position: 'absolute', 
                          top: '-6px', 
                          left: 0, 
                          width: '200%', 
                          height: '10px', 
                          fill: '#FFE873', 
                          zIndex: 2 
                        }}
                      >
                        <path d="M 0 6 Q 25 12, 50 6 T 100 6 T 150 6 T 200 6 V 16 H 0 Z" />
                      </svg>

                      {/* Floating ambient bubbles */}
                      <div className="water-bubble" style={{ width: '4px', height: '4px', left: '25%', bottom: '3px', animationDuration: '2.4s' }} />
                      <div className="water-bubble" style={{ width: '3px', height: '3px', left: '65%', bottom: '6px', animationDuration: '3.1s', animationDelay: '0.8s' }} />
                    </div>
                  )}

                  {/* Glass Number Label */}
                  <span style={{ 
                    position: 'relative', 
                    zIndex: 4, 
                    fontSize: '0.78rem', 
                    fontWeight: filled ? 600 : 400, 
                    color: filled ? '#1C1C1E' : 'var(--color-text-muted)',
                    lineHeight: 1
                  }}>
                    {i + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
