import React from 'react';
import { Building2, CheckCircle, XCircle, Coins } from 'lucide-react';
import { DashboardStats } from '../types';

interface KPICardsProps {
  stats: DashboardStats;
}

export const KPICards: React.FC<KPICardsProps> = ({ stats }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const cards = [
    {
      title: 'Total Registered',
      value: stats.totalRegistered.toLocaleString('en-IN'),
      icon: Building2,
      color: 'var(--secondary)',
      glow: 'var(--secondary-glow)',
      desc: 'Overall properties registered'
    },
    {
      title: 'Approved',
      value: stats.totalApproved.toLocaleString('en-IN'),
      icon: CheckCircle,
      color: 'var(--success)',
      glow: 'var(--success-glow)',
      desc: 'Tax verified & active properties'
    },
    {
      title: 'Rejected',
      value: stats.totalRejected.toLocaleString('en-IN'),
      icon: XCircle,
      color: 'var(--danger)',
      glow: 'var(--danger-glow)',
      desc: 'Rejected applications'
    },
    {
      title: 'Total Collection',
      value: formatCurrency(stats.totalCollection),
      icon: Coins,
      color: 'var(--primary)',
      glow: 'var(--primary-glow)',
      desc: 'Aggregate tax collection in INR',
      isGlowBorder: true
    }
  ];

  return (
    <div style={styles.container}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`glass-panel ${card.isGlowBorder ? 'pulse-border' : ''}`}
            style={{
              ...styles.card,
              borderLeft: `4px solid ${card.color}`
            }}
          >
            <div style={styles.cardHeader}>
              <div>
                <span style={styles.cardTitle}>{card.title}</span>
                <h3 style={styles.cardValue}>{card.value}</h3>
              </div>
              <div
                style={{
                  ...styles.iconContainer,
                  background: card.glow,
                  color: card.color
                }}
              >
                <Icon size={22} />
              </div>
            </div>
            <p style={styles.cardDesc}>{card.desc}</p>
          </div>
        );
      })}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    width: '100%',
    marginBottom: '28px'
  },
  card: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '140px',
    position: 'relative',
    overflow: 'hidden'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: '12px'
  },
  cardTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  cardValue: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginTop: '6px',
    letterSpacing: '-0.02em'
  },
  iconContainer: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  cardDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontWeight: 500
  }
};
