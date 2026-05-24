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
  Cell,
  PieChart,
  Pie
} from 'recharts';
import type { CityChartData, Property } from '../types';

interface DashboardChartsProps {
  data: CityChartData[];
  selectedCity: string;
  filteredProperties: Property[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    fill?: string;
    payload?: {
      city?: string;
    };
  }>;
  label?: string;
}

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    payload?: {
      percentage?: string;
    };
  }>;
}

// 1. Format currency helper (e.g. ₹2.4L or ₹85k)
const formatCurrency = (value: number) => {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  return `₹${(value / 1000).toFixed(0)}k`;
};

// 2. Format detailed full currency (e.g. ₹2,40,000)
const formatFullCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

// Color system for the Property Type distribution donut chart
const PROPERTY_TYPE_COLORS: Record<string, string> = {
  Residential: 'var(--primary)',      // Cyan
  Commercial: 'var(--secondary)',     // Indigo
  Industrial: '#8b5cf6',             // Violet/Purple
  Agricultural: 'var(--success)',     // Emerald
  'Mixed Use': 'var(--warning)'       // Amber
};

// 3. Custom premium tooltip for comparative bar charts (glassmorphism look)
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={styles.tooltipContainer} className="glass-panel">
        <p style={styles.tooltipLabel}>{label} Municipality</p>
        <div style={styles.tooltipDivider}></div>
        {payload.map((pld, index: number) => (
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

// 4. Custom premium tooltip for Property Type donut chart
const CustomPieTooltip: React.FC<CustomPieTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    return (
      <div style={styles.tooltipContainer} className="glass-panel">
        <p style={{ ...styles.tooltipLabel, color: dataPoint.color }}>{dataPoint.name}</p>
        <div style={styles.tooltipDivider}></div>
        <p style={styles.tooltipValue}>
          Properties: <span style={styles.tooltipValBold}>{dataPoint.value}</span>
        </p>
        <p style={styles.tooltipValue}>
          Share: <span style={styles.tooltipValBold}>{dataPoint.payload?.percentage}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  data,
  selectedCity,
  filteredProperties
}) => {

  // Dynamic Property Type distribution calculation for the selected city or global combined platform
  const propertyTypeData = React.useMemo(() => {
    const types = ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed Use'];
    const counts = types.reduce((acc, t) => {
      acc[t] = 0;
      return acc;
    }, {} as Record<string, number>);

    filteredProperties.forEach((p) => {
      if (counts[p.property_type] !== undefined) {
        counts[p.property_type]++;
      }
    });

    return types.map((type) => ({
      name: type,
      value: counts[type],
      percentage: filteredProperties.length ? ((counts[type] / filteredProperties.length) * 100).toFixed(1) : '0.0'
    }));
  }, [filteredProperties]);

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
                interval={0}
                tick={{ fill: 'var(--text-secondary)', fontSize: 9, fontWeight: 500 }}
                angle={-35}
                textAnchor="end"
                dx={-6}
                dy={4}
                height={60}
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
                radius={[4, 4, 0, 0]}
                barSize={18}
              >
                {data.map((entry, index) => {
                  // Interactive selection styling: highlight active city and dim the rest
                  const isSelected = selectedCity === 'All Cities' || entry.city.toLowerCase() === selectedCity.toLowerCase();
                  const opacity = isSelected ? 1 : 0.35;
                  const stroke = selectedCity !== 'All Cities' && entry.city.toLowerCase() === selectedCity.toLowerCase() ? 'var(--primary)' : 'transparent';
                  const strokeWidth = stroke !== 'transparent' ? 1.5 : 0;
                  
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#collectionGradient-${index % 2})`}
                      opacity={opacity}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                    />
                  );
                })}
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
              barGap={3}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis 
                dataKey="city" 
                interval={0}
                tick={{ fill: 'var(--text-secondary)', fontSize: 9, fontWeight: 500 }}
                angle={-35}
                textAnchor="end"
                dx={-6}
                dy={4}
                height={60}
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
              
              <Bar dataKey="approved" name="Approved" fill="var(--success)" radius={[3, 3, 0, 0]} barSize={8}>
                {data.map((entry, index) => {
                  const isSelected = selectedCity === 'All Cities' || entry.city.toLowerCase() === selectedCity.toLowerCase();
                  return <Cell key={`cell-${index}`} opacity={isSelected ? 1 : 0.35} />;
                })}
              </Bar>
              <Bar dataKey="pending" name="Pending" fill="var(--warning)" radius={[3, 3, 0, 0]} barSize={8}>
                {data.map((entry, index) => {
                  const isSelected = selectedCity === 'All Cities' || entry.city.toLowerCase() === selectedCity.toLowerCase();
                  return <Cell key={`cell-${index}`} opacity={isSelected ? 1 : 0.35} />;
                })}
              </Bar>
              <Bar dataKey="rejected" name="Rejected" fill="var(--danger)" radius={[3, 3, 0, 0]} barSize={8}>
                {data.map((entry, index) => {
                  const isSelected = selectedCity === 'All Cities' || entry.city.toLowerCase() === selectedCity.toLowerCase();
                  return <Cell key={`cell-${index}`} opacity={isSelected ? 1 : 0.35} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Property Type Distribution Donut Chart (Dynamic Selection - Task 2 Enhancement) */}
      <div style={{ ...styles.chartCard, gridColumn: 'span 2' }} className="glass-panel">
        <div style={styles.chartHeader}>
          <h4 style={styles.chartTitle}>
            Property Type Distribution — {selectedCity === 'All Cities' ? 'All India Combined' : `${selectedCity} Municipality`}
          </h4>
          <p style={styles.chartSubtitle}>Dynamic ratio analysis of registered property categories</p>
        </div>
        <div style={styles.donutContentWrapper}>
          <div style={styles.donutChartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={propertyTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={800}
                >
                  {propertyTypeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={PROPERTY_TYPE_COLORS[entry.name] || 'var(--text-muted)'} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={styles.donutCenterLabel}>
              <span style={styles.donutCenterNum}>{filteredProperties.length}</span>
              <span style={styles.donutCenterText}>Properties</span>
            </div>
          </div>
          
          <div style={styles.donutLegendGrid}>
            {propertyTypeData.map((type, idx) => {
              const color = PROPERTY_TYPE_COLORS[type.name] || 'var(--text-muted)';
              return (
                <div key={idx} style={styles.legendCard} className="glass-panel">
                  <div style={styles.legendHeader}>
                    <span style={{ ...styles.legendDot, backgroundColor: color }} />
                    <span style={styles.legendName}>{type.name}</span>
                  </div>
                  <div style={styles.legendValues}>
                    <span style={styles.legendCount}>{type.value} records</span>
                    <span style={{ ...styles.legendPercent, color }}>{type.percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
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
    height: '350px',
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
    gap: '12px',
    color: 'var(--text-secondary)'
  },
  tooltipValBold: {
    fontWeight: 700,
    color: 'var(--text-primary)'
  },
  donutContentWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '24px',
    padding: '12px 0'
  },
  donutChartWrapper: {
    width: '220px',
    height: '220px',
    position: 'relative'
  },
  donutCenterLabel: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none'
  },
  donutCenterNum: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    lineHeight: 1
  },
  donutCenterText: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '2px'
  },
  donutLegendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
    flex: 1,
    maxWidth: '560px',
    width: '100%'
  },
  legendCard: {
    padding: '12px 14px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '10px'
  },
  legendHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px'
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block'
  },
  legendName: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--text-primary)'
  },
  legendValues: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline'
  },
  legendCount: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    fontWeight: 500
  },
  legendPercent: {
    fontSize: '0.82rem',
    fontWeight: 800
  }
};
