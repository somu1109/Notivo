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
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        width: '100%', 
        zIndex: isOpen ? 100 : 'auto', 
        ...style 
      }}
    >
      <div 
        className="input-field" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer', 
          userSelect: 'none',
          padding: '8px 16px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--card-bg, rgba(255, 255, 255, 0.9))',
          borderColor: isOpen ? 'var(--color-yellow)' : 'var(--color-gray-border)',
          boxShadow: isOpen ? '0 0 0 3px rgba(255, 216, 77, 0.35)' : 'none'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{selectedOption ? selectedOption.label : ''}</span>
        <ChevronDown 
          size={15} 
          color="var(--color-text-muted)" 
          style={{ 
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)', 
            transform: isOpen ? 'rotate(180deg)' : 'none', 
            flexShrink: 0, 
            marginLeft: '6px' 
          }} 
        />
      </div>
      
      {isOpen && (
        <div 
          className="custom-select-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            minWidth: '135px',
            borderRadius: '16px',
            zIndex: 1000,
            maxHeight: '240px',
            overflowY: 'auto',
            padding: '4px'
          }}
        >
          {options.map((opt) => (
            <div 
              key={opt.value}
              className="custom-select-item"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '12px',
                cursor: 'pointer',
                background: value === opt.value ? 'var(--color-yellow-soft)' : 'transparent',
                fontSize: '0.88rem',
                fontWeight: value === opt.value ? 500 : 400,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (value !== opt.value) e.currentTarget.style.background = 'var(--color-neutral-bg)';
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value) e.currentTarget.style.background = 'transparent';
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
