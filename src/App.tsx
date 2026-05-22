import React, { useState, useMemo } from 'react';
import { ShieldCheck, Calendar, Activity, Sparkles } from 'lucide-react';
import rawProperties from './properties.json';
import { Property, DashboardStats, CityChartData } from './types';
import { KPICards } from './components/KPICards';
import { CitySelector } from './components/CitySelector';
import { DashboardCharts } from './components/DashboardCharts';
import { ChatAssistant } from './components/ChatAssistant';

// Cast the raw properties JSON to Property[]
const properties = rawProperties as Property[];

const citiesList = [
  'Delhi',
  'Mumbai',
  'Pune',
  'Bengaluru',
  'Chennai',
  'Hyderabad',
  'Ahmedabad',
  'Kolkata',
  'Jaipur',
  'Lucknow'
];

function App() {
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');

  // 1. Filtered subset for KPI cards and specific details
  const filteredProperties = useMemo(() => {
    if (selectedCity === 'All Cities') {
      return properties;
    }
    return properties.filter((p) => p.tenant.toLowerCase() === selectedCity.toLowerCase());
  }, [selectedCity]);

  // 2. Compute KPI stats dynamically
  const stats = useMemo<DashboardStats>(() => {
    const totalRegistered = filteredProperties.length;
    const totalApproved = filteredProperties.filter((p) => p.status === 'Approved').length;
    const totalRejected = filteredProperties.filter((p) => p.status === 'Rejected').length;
    const totalPending = filteredProperties.filter((p) => p.status === 'Pending').length;
    const totalCollection = filteredProperties.reduce((acc, p) => acc + p.collection_inr, 0);

    return {
      totalRegistered,
      totalApproved,
      totalRejected,
      totalPending,
      totalCollection
    };
  }, [filteredProperties]);

  // 3. Compute 10-City Side-by-Side Chart Data (always global or highlighted)
  const chartData = useMemo<CityChartData[]>(() => {
    return citiesList.map((city) => {
      const cityProps = properties.filter((p) => p.tenant.toLowerCase() === city.toLowerCase());
      return {
        city,
        collection: cityProps.reduce((acc, p) => acc + p.collection_inr, 0),
        approved: cityProps.filter((p) => p.status === 'Approved').length,
        rejected: cityProps.filter((p) => p.status === 'Rejected').length,
        pending: cityProps.filter((p) => p.status === 'Pending').length,
        total: cityProps.length
      };
    });
  }, []);

  // Format today's date elegantly
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date());
  }, []);

  return (
    <div style={styles.appContainer}>
      {/* Top Header Navigation */}
      <header style={styles.header} className="glass-panel">
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <ShieldCheck size={24} color="#060913" />
          </div>
          <div>
            <h1 style={styles.logoText}>UPYOG</h1>
            <span style={styles.logoSubtext}>National Urban Digital Mission</span>
          </div>
        </div>

        <div style={styles.metaSection}>
          <div style={styles.metaBadge}>
            <Activity size={14} color="var(--success)" />
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>System Live</span>
          </div>
          <div style={styles.dateContainer}>
            <Calendar size={14} color="var(--text-secondary)" />
            <span style={styles.dateText}>{formattedDate}</span>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <main style={styles.main}>
        {/* Title & Filter Row */}
        <section style={styles.filterSection}>
          <div>
            <h2 style={styles.sectionTitle}>Property Tax Analytics</h2>
            <p style={styles.sectionSubtitle}>
              Multi-tenant municipal property data index for NUDM platform assessments.
            </p>
          </div>
          <CitySelector
            selectedCity={selectedCity}
            onChange={setSelectedCity}
            cities={citiesList}
          />
        </section>

        {/* Reactive KPI Cards */}
        <KPICards stats={stats} />

        {/* Split Grid for Charts & Chat Assistant */}
        <div style={styles.dashboardGrid}>
          {/* Charts Column */}
          <div style={styles.chartsCol}>
            <DashboardCharts data={chartData} />
          </div>

          {/* Chat Assistant Column */}
          <div style={styles.chatCol}>
            <div style={styles.chatHeaderWrapper}>
              <h3 style={styles.chatColTitle}>
                <Sparkles size={18} color="var(--primary)" />
                Semantic Knowledge Engine
              </h3>
              <p style={styles.chatColDesc}>
                Inquire about complex breakdowns, ratios, registrations, and collections using the smart local AI assistant or Google Gemini.
              </p>
            </div>
            <ChatAssistant properties={properties} />
          </div>
        </div>
      </main>

      {/* Dashboard Footer */}
      <footer style={styles.footer}>
        <p>UPYOG Multi-Tenant Property Tax Analytics Dashboard • Built for NUDM Intern Assessment</p>
        <p style={{ marginTop: '4px', color: 'var(--text-muted)' }}>
          Powered by React, TypeScript, Recharts, and Google Gemini AI
        </p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    maxWidth: '1600px',
    margin: '0 auto',
    width: '100%'
  },
  header: {
    padding: '16px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 15px var(--primary-glow)'
  },
  logoText: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '0.05em',
    lineHeight: 1
  },
  logoSubtext: {
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  metaSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  metaBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.8rem'
  },
  dateContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  dateText: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-secondary)'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  filterSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '28px'
  },
  sectionTitle: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em'
  },
  sectionSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginTop: '4px',
    fontWeight: 500
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '3fr 2fr',
    gap: '28px',
    alignItems: 'start',
    width: '100%',
    marginBottom: '32px'
  },
  chartsCol: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  chatCol: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '16px'
  },
  chatHeaderWrapper: {
    padding: '0 4px'
  },
  chatColTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px'
  },
  chatColDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.4
  },
  footer: {
    padding: '24px 0 12px 0',
    borderTop: '1px solid var(--border-color)',
    textAlign: 'center',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: 500
  }
};

export default App;
