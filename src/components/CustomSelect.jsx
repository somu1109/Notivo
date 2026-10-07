import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({ value, options, onChange, style }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      <div 
        className="input-field" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer', 
          userSelect: 'none',
          paddingRight: '12px',
          ...(isOpen ? { borderColor: 'var(--brand)', boxShadow: '0 0 0 3px var(--brand-light)' } : {})
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : ''}</span>
        <ChevronDown 
          size={16} 
          color="var(--text-secondary)" 
          style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none', flexShrink: 0, marginLeft: '8px' }} 
        />
      </div>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-hover)',
          zIndex: 50,
          maxHeight: '250px',
          overflowY: 'auto'
        }}>
          {options.map((opt) => (
            <div 
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                background: value === opt.value ? 'var(--brand-light)' : 'transparent',
                color: value === opt.value ? 'var(--brand)' : 'var(--text-main)',
                fontSize: '0.95rem',
                transition: 'background 0.1s'
              }}
              onMouseEnter={(e) => {
                if (value !== opt.value) e.target.style.background = 'var(--bg-color)';
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value) e.target.style.background = 'transparent';
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
