import './HomeView.css';
import { storageService } from '@services/storage';
import type { ScoreboardData, KastnerBalance } from '@services/storage';
import { BottomNav } from '@ui/home/BottomNav';
import type { ActiveTab } from '@ui/home/BottomNav';
import { useState } from 'react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcSinnIndex(data: ScoreboardData): number {
  const r = data.kpi_dashboards['4_ryff_eudaimonia'];
  return Math.round(
    (r.purpose_in_life + r.environmental_mastery + r.personal_growth +
      r.positive_relations + r.self_acceptance + r.autonomy_ryff) / 6,
  );
}

function getResourcesStatus(k: KastnerBalance): { label: string; color: string } {
  if (k.burnout_risk_level === 'Low' && k.resources >= k.demands)
    return { label: 'Optimum', color: '#00d4aa' };
  if (k.burnout_risk_level === 'Low') return { label: 'Gut', color: '#22c55e' };
  if (k.burnout_risk_level === 'Medium') return { label: 'Mittel', color: '#eab308' };
  return { label: 'Kritisch', color: '#ef4444' };
}

function inferDrive(purposeInLife: number): 'freedom' | 'career' | 'community' {
  if (purposeInLife >= 85) return 'freedom';
  if (purposeInLife >= 80) return 'career';
  return 'community';
}

interface PathDef {
  id: string;
  name: string;
  subtitle: string;
  gradientStyle: React.CSSProperties;
  drive: 'freedom' | 'career' | 'community';
  score: number;
}

function buildPaths(data: ScoreboardData): PathDef[] {
  const sdt = data.kpi_dashboards['1_sdt_motivation'];
  const ryff = data.kpi_dashboards['4_ryff_eudaimonia'];
  const drive = inferDrive(ryff.purpose_in_life);

  const defs: Array<Omit<PathDef, 'score'>> = [
    {
      id: 'stille',
      name: 'Pfad der Stille',
      subtitle: 'Fokus auf Reflexion & Vitalität',
      gradientStyle: {
        background:
          'linear-gradient(160deg, #0d1a0d 0%, #0a1208 40%, #060e09 70%, #050d07 100%)',
      },
      drive: 'freedom',
    },
    {
      id: 'wachstum',
      name: 'Pfad des Wachstums',
      subtitle: 'Fokus auf Karriere & Sinn',
      gradientStyle: {
        background:
          'linear-gradient(160deg, #08091a 0%, #0a0a20 40%, #0d0a1e 70%, #080818 100%)',
      },
      drive: 'career',
    },
    {
      id: 'verbindung',
      name: 'Pfad der Verbindung',
      subtitle: 'Fokus auf Gemeinschaft & Familie',
      gradientStyle: {
        background:
          'linear-gradient(160deg, #1a0e08 0%, #1a120a 40%, #160e08 70%, #120b06 100%)',
      },
      drive: 'community',
    },
  ];

  const sdtMap: Record<string, number> = {
    freedom: sdt.autonomy,
    career: sdt.competence,
    community: sdt.relatedness,
  };

  return defs
    .map((d) => ({
      ...d,
      score: d.drive === drive ? 100 : sdtMap[d.drive],
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
}

interface ImpulsePart {
  text: string;
  highlight?: boolean;
}
interface ImpulseItem {
  type: 'positive' | 'warning';
  parts: ImpulsePart[];
}

function buildImpulse(data: ScoreboardData): ImpulseItem[] {
  const sdt = data.kpi_dashboards['1_sdt_motivation'];
  const kastner = data.kpi_dashboards['2_kastner_balance'];
  const seiwert = data.kpi_dashboards['3_seiwert_pillars'];

  const items: ImpulseItem[] = [];

  // Positive: strongest SDT driver
  const sdtEntries: Array<[string, number]> = [
    ['Autonomie', sdt.autonomy],
    ['Kompetenz', sdt.competence],
    ['Verbundenheit', sdt.relatedness],
  ];
  const [topLabel, topVal] = sdtEntries.reduce((a, b) => (a[1] >= b[1] ? a : b));
  items.push({
    type: 'positive',
    parts: [
      { text: 'Deine ' },
      { text: topLabel, highlight: true },
      { text: ' ist mit ' },
      { text: `${topVal}%`, highlight: true },
      { text: ' dein stärkster Antreiber.' },
    ],
  });

  // Warning: weakest Seiwert pillar
  const pillars: Array<[string, number]> = [
    ['Arbeit', seiwert.work_finance],
    ['Soziales', seiwert.family_social],
    ['Gesundheit', seiwert.health_body],
    ['Sinn', seiwert.meaning_values],
  ];
  const [weakName] = pillars.reduce((a, b) => (a[1] <= b[1] ? a : b));
  items.push({
    type: 'warning',
    parts: [
      { text: 'Achtung: Die Säule ' },
      { text: `„${weakName}"`, highlight: true },
      { text: ' benötigt heute Aufmerksamkeit.' },
    ],
  });

  if (kastner.imbalance_warning) {
    items.push({
      type: 'warning',
      parts: [{ text: 'Deine Ressourcen stehen unter Druck – Anforderungen überwiegen.' }],
    });
  }

  return items.slice(0, 2);
}

function buildWeeklyData(resourcesValue: number) {
  const deltas = [-8, -3, 5, 0, -2, 3, -5];
  return ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'].map((day, i) => ({
    day,
    isToday: i === 3,
    val: Math.min(100, Math.max(8, resourcesValue + deltas[i])),
  }));
}

const SINN_QUOTES = [
  '"Der Weg ist die Bestimmung."',
  '"Wer ein Warum hat, erträgt fast jedes Wie."',
  '"Sinn ist nicht gefunden, er wird gelebt."',
  '"Wachstum beginnt dort, wo Komfort endet."',
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function CircularGauge({ value }: { value: number }) {
  const size = 130;
  const sw = 9;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="sinn-svg"
    >
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="#1e2030" strokeWidth={sw}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="#00d4aa"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x={size / 2} y={size / 2 + 9}
        textAnchor="middle"
        fill="#f3f4f6"
        fontSize="26"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        {value}
      </text>
    </svg>
  );
}

function PillarCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="pillar-card" style={{ borderLeftColor: color }}>
      <span className="pillar-label">{label.toUpperCase()}</span>
      <span className="pillar-value">{value}%</span>
    </div>
  );
}

// ─── Main View ───────────────────────────────────────────────────────────────

export function HomeView() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const data = storageService.getScoreboard()!;

  const sdt = data.kpi_dashboards['1_sdt_motivation'];
  const kastner = data.kpi_dashboards['2_kastner_balance'];
  const seiwert = data.kpi_dashboards['3_seiwert_pillars'];

  const sinnIndex = calcSinnIndex(data);
  const resourcesStatus = getResourcesStatus(kastner);
  const topPaths = buildPaths(data);
  const impulse = buildImpulse(data);
  const weeklyData = buildWeeklyData(kastner.resources);
  const sinnQuote = SINN_QUOTES[sinnIndex % SINN_QUOTES.length];

  return (
    <div className="home-screen">
      {/* ── Header ── */}
      <header className="home-header">
        <div className="home-header-avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="#9ca3af" strokeWidth="1.5" />
            <path
              d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
              stroke="#9ca3af"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="home-header-title">ZenLife</span>
        <button className="home-header-gear" aria-label="Einstellungen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="1.5" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
              stroke="#9ca3af"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      </header>

      {/* ── Scrollable Content ── */}
      <div className="home-content">

        {/* Globaler Status */}
        <section className="home-card">
          <div className="card-section-label">GLOBALER STATUS</div>
          <div className="global-score-row">
            <span className="global-score-number">{sdt.autonomy}</span>
            <span className="global-score-percent">%</span>
          </div>
          <div className="global-score-sublabel">Autonomie-Score</div>
          <div className="global-metrics-grid">
            <div className="global-metric">
              <span className="global-metric-label">Kompetenz</span>
              <span className="global-metric-value" style={{ color: '#f97316' }}>
                {sdt.competence}%
              </span>
            </div>
            <div className="global-metric">
              <span className="global-metric-label">Verbundenheit</span>
              <span className="global-metric-value" style={{ color: '#eab308' }}>
                {sdt.relatedness}%
              </span>
            </div>
          </div>
          <div className="global-resources-row">
            <span className="global-metric-label">Ressourcen</span>
            <span
              className="global-metric-value"
              style={{ color: resourcesStatus.color }}
            >
              {resourcesStatus.label}
            </span>
          </div>
        </section>

        {/* Sinnhaftigkeits-Index */}
        <section className="home-card sinn-card">
          <div className="card-section-label">SINNHAFTIGKEITS-INDEX</div>
          <div className="sinn-gauge-wrap">
            <CircularGauge value={sinnIndex} />
          </div>
          <p className="sinn-quote">{sinnQuote}</p>
        </section>

        {/* 4-Säulen-Radar */}
        <section className="home-card">
          <div className="card-section-label">4-SÄULEN-RADAR (SEIWERT)</div>
          <div className="pillars-grid">
            <PillarCard label="Arbeit" value={seiwert.work_finance} color="#f97316" />
            <PillarCard label="Soziales" value={seiwert.family_social} color="#eab308" />
            <PillarCard label="Gesundheit" value={seiwert.health_body} color="#22c55e" />
            <PillarCard label="Sinn" value={seiwert.meaning_values} color="#00d4aa" />
          </div>
        </section>

        {/* Path Cards */}
        {topPaths.map((path, i) => (
          <section
            key={path.id}
            className="path-card"
            style={path.gradientStyle}
          >
            <div className="path-card-overlay" />
            <div className="path-card-body">
              <h2 className="path-name">{path.name}</h2>
              <p className="path-subtitle">{path.subtitle}</p>
              <button
                className={`path-btn ${i === 0 ? 'path-btn-primary' : 'path-btn-secondary'}`}
              >
                WÄHLEN
              </button>
            </div>
          </section>
        ))}

        {/* Impulse */}
        <section className="home-card">
          <div className="impulse-header">
            <span className="impulse-bolt">⚡</span>
            <span className="impulse-title">Impulse</span>
          </div>
          <ul className="impulse-list">
            {impulse.map((item, i) => (
              <li key={i} className="impulse-item">
                <span className={`impulse-dot impulse-dot-${item.type}`} />
                <span className="impulse-text">
                  {item.parts.map((part, j) =>
                    part.highlight ? (
                      <span
                        key={j}
                        className={`impulse-hi impulse-hi-${item.type}`}
                      >
                        {part.text}
                      </span>
                    ) : (
                      part.text
                    ),
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Ressourcen-Kapazität */}
        <section className="home-card resources-card">
          <div className="card-section-label">RESSOURCEN-KAPAZITÄT</div>
          <div className="bar-chart">
            {weeklyData.map(({ day, val, isToday }) => (
              <div key={day} className="bar-col">
                <div className="bar-track">
                  <div
                    className={`bar-fill${isToday ? ' bar-fill-today' : ''}`}
                    style={{ height: `${val}%` }}
                  />
                </div>
                <div className={`bar-label${isToday ? ' bar-label-today' : ''}`}>
                  <span>{day}</span>
                  {isToday && <span className="bar-heute">(HEUTE)</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
