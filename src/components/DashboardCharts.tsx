import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { CityChartData } from '../types';

interface DashboardChartsProps {
  data: CityChartData[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ data }) => {
  // Format currency for Y axis and tooltips
  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${(value / 1000).toFixed(0)}k`;
  };

  const formatFullCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Custom premium tooltip for glassmorphism look
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.tooltipContainer} className="glass-panel">
          <p style={styles.tooltipLabel}>{label} Municipality</p>
          <div style={styles.tooltipDivider}></div>
          {payload.map((pld: any, index: number) => (
            <p key={index} style={{ ...styles.tooltipValue, color: pld.color || pld.fill }}>
              {pld.name}: <span style={styles.tooltipValBold}>
                {pld.name.includes('Collection') ? formatFullCurrency(pld.value) : pld.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.container}>
      {/* Chart 1: Total Collections per City */}
      <div style={styles.chartCard} className="glass-panel">
        <div style={styles.chartHeader}>
          <h4 style={styles.chartTitle}>Tax Collection By Tenant Municipality</h4>
          <p style={styles.chartSubtitle}>Side-by-side comparison of annual collection in INR</p>
        </div>
        <div style={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis 
                dataKey="city" 
                tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
              <Bar 
                dataKey="collection" 
                name="Total Collection"
                radius={[6, 6, 0, 0]}
              >
                {data.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#collectionGradient-${index % 2})`}
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="collectionGradient-0" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--secondary)" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="collectionGradient-1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--secondary)" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Property Approval Status Breakdown (Grouped Bar Chart - Bonus) */}
      <div style={styles.chartCard} className="glass-panel">
        <div style={styles.chartHeader}>
          <h4 style={styles.chartTitle}>Property Verification Status</h4>
          <p style={styles.chartSubtitle}>Comparison of Approved, Rejected, and Pending applications</p>
        </div>
        <div style={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis 
                dataKey="city" 
                tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
              <Legend 
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}
              />
              <Bar dataKey="approved" name="Approved" fill="var(--success)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="var(--warning)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="rejected" name="Rejected" fill="var(--danger)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
    gap: '24px',
    width: '100%',
    marginBottom: '28px'
  },
  chartCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  chartHeader: {
    marginBottom: '20px'
  },
  chartTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em'
  },
  chartSubtitle: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginTop: '4px'
  },
  chartWrapper: {
    width: '100%',
    height: '320px',
    position: 'relative'
  },
  tooltipContainer: {
    padding: '12px 16px',
    border: '1px solid var(--border-color)',
    background: 'rgba(6, 9, 19, 0.95)',
    borderRadius: '10px',
    minWidth: '180px'
  },
  tooltipLabel: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0
  },
  tooltipDivider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '8px 0'
  },
  tooltipValue: {
    fontSize: '0.78rem',
    fontWeight: 500,
    margin: '4px 0',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px'
  },
  tooltipValBold: {
    fontWeight: 700,
    color: 'var(--text-primary)'
  }
};
