import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';

interface CitySelectorProps {
  selectedCity: string;
  onChange: (city: string) => void;
  cities: string[];
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  selectedCity,
  onChange,
  cities
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.labelContainer}>
        <Filter size={16} color="var(--primary)" />
        <span style={styles.label}>Tenant Municipality Filter</span>
      </div>
      <div style={styles.selectWrapper}>
        <select
          value={selectedCity}
          onChange={(e) => onChange(e.target.value)}
          className="glass-panel"
          style={styles.select}
        >
          <option value="All Cities">All Indian Cities (Combined Platform)</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city} Municipality
            </option>
          ))}
        </select>
        <div style={styles.chevron}>
          <ChevronDown size={18} color="var(--text-secondary)" />
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
    maxWidth: '380px'
  },
  labelContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  selectWrapper: {
    position: 'relative',
    width: '100%'
  },
  select: {
    width: '100%',
    padding: '12px 40px 12px 16px',
    fontSize: '0.92rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    background: 'rgba(13, 20, 38, 0.75)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    transition: 'all 0.2s ease'
  },
  chevron: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center'
  }
};
