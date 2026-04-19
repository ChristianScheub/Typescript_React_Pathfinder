import './HomeView.css';
import { BottomNav } from '@ui/home/BottomNav';
import type { ActiveTab } from '@ui/home/BottomNav';
import { useTranslation } from 'react-i18next';

export interface SDTData {
  autonomy: number;
  competence: number;
  relatedness: number;
}

export interface KastnerData {
  resources: number;
  demands: number;
  burnout_risk_level: 'Low' | 'Medium' | 'High';
  imbalance_warning: boolean;
}

export interface SeiwertData {
  work_finance: number;
  family_social: number;
  health_body: number;
  meaning_values: number;
}

export interface RyffData {
  purpose_in_life: number;
  environmental_mastery: number;
  personal_growth: number;
  positive_relations: number;
  self_acceptance: number;
  autonomy_ryff: number;
}

export interface HomeViewProps {
  activeTab?: ActiveTab;
  onTabChange?: (tab: ActiveTab) => void;
  sdt: SDTData;
  kastner: KastnerData;
  seiwert: SeiwertData;
  ryff: RyffData;
  topPaths: Array<{
    id: string;
    nameKey: string;
    subtitleKey: string;
    cssClass: string;
    score: number;
  }>;
  impulseItems: Array<{
    type: 'positive' | 'warning';
    text: string;
  }>;
  weeklyData: Array<{ day: string; value: number; isToday: boolean }>;
  sinnQuote: string;
  sinnIndex: number;
  resourcesStatus: { labelKey: string; colorClass: string };
}

function calcSinnIndex(ryff: RyffData): number {
  return Math.round(
    (ryff.purpose_in_life + ryff.environmental_mastery + ryff.personal_growth +
      ryff.positive_relations + ryff.self_acceptance + ryff.autonomy_ryff) / 6,
  );
}

function getResourcesStatus(k: KastnerData): { labelKey: string; colorClass: string } {
  if (k.burnout_risk_level === 'Low' && k.resources >= k.demands)
    return { labelKey: 'ui.optimum', colorClass: 'global-metric-value-teal' };
  if (k.burnout_risk_level === 'Low') return { labelKey: 'ui.good', colorClass: 'global-metric-value-green' };
  if (k.burnout_risk_level === 'Medium') return { labelKey: 'ui.medium', colorClass: 'global-metric-value-yellow' };
  return { labelKey: 'ui.critical', colorClass: 'global-metric-value-orange' };
}

function inferDrive(purposeInLife: number): 'freedom' | 'career' | 'community' {
  if (purposeInLife >= 85) return 'freedom';
  if (purposeInLife >= 80) return 'career';
  return 'community';
}

export function createHomeViewProps(
  sdt: SDTData,
  kastner: KastnerData,
  seiwert: SeiwertData,
  ryff: RyffData,
  t: (key: string, opts?: Record<string, unknown>) => string
): HomeViewProps {
  const sinnIndex = calcSinnIndex(ryff);
  const resourcesStatus = getResourcesStatus(kastner);

  const pathDefs = [
    { id: 'stille', nameKey: 'path.stille.name', subtitleKey: 'path.stille.subtitle', cssClass: 'path-card-stille', drive: 'freedom' as const },
    { id: 'wachstum', nameKey: 'path.wachstum.name', subtitleKey: 'path.wachstum.subtitle', cssClass: 'path-card-wachstum', drive: 'career' as const },
    { id: 'verbindung', nameKey: 'path.verbindung.name', subtitleKey: 'path.verbindung.subtitle', cssClass: 'path-card-verbindung', drive: 'community' as const },
  ];

  const sdtMap = {
    freedom: sdt.autonomy,
    career: sdt.competence,
    community: sdt.relatedness,
  };

  const topPaths = pathDefs
    .map((d) => ({
      ...d,
      score: d.drive === inferDrive(ryff.purpose_in_life) ? 100 : sdtMap[d.drive],
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  const impulseItems = buildImpulseItems(sdt, seiwert, t);

  const weeklyData = buildWeeklyData(kastner.resources);

  const SINN_QUOTES = [
    '"Der Weg ist die Bestimmung."',
    '"Wer ein Warum hat, erträgt fast jedes Wie."',
    '"Sinn ist nicht gefunden, er wird gelebt."',
    '"Wachstum beginnt dort, wo Komfort endet."',
  ];

  return {
    sdt,
    kastner,
    seiwert,
    ryff,
    topPaths,
    impulseItems,
    weeklyData,
    sinnQuote: SINN_QUOTES[sinnIndex % SINN_QUOTES.length],
    sinnIndex,
    resourcesStatus,
  };
}

function buildImpulseItems(
  sdt: SDTData,
  seiwert: SeiwertData,
  t: (key: string, opts?: Record<string, unknown>) => string
): HomeViewProps['impulseItems'] {
  const items: HomeViewProps['impulseItems'] = [];

  const sdtEntries = [
    { key: 'ui.autonomy', val: sdt.autonomy },
    { key: 'ui.competence', val: sdt.competence },
    { key: 'ui.relatedness', val: sdt.relatedness },
  ];
  const top = sdtEntries.reduce((a, b) => (a.val >= b.val ? a : b));
  
  items.push({
    type: 'positive',
    text: t('strongest_driver', { driver: t(top.key), value: top.val }),
  });

  const pillars = [
    { key: 'ui.work', val: seiwert.work_finance },
    { key: 'ui.social', val: seiwert.family_social },
    { key: 'ui.health', val: seiwert.health_body },
    { key: 'ui.meaning', val: seiwert.meaning_values },
  ];
  const weak = pillars.reduce((a, b) => (a.val <= b.val ? a : b));
  
  items.push({
    type: 'warning',
    text: t('pillar_warning', { pillar: t(weak.key) }),
  });

  return items.slice(0, 2);
}

function buildWeeklyData(resourcesValue: number) {
  const deltas = [-8, -3, 5, 0, -2, 3, -5];
  return ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'].map((day, i) => ({
    day,
    value: Math.min(100, Math.max(8, resourcesValue + deltas[i])),
    isToday: i === 3,
  }));
}

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
        className="sinn-gauge-circle"
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
  labelKey,
  value,
  colorClass,
}: {
  labelKey: string;
  value: number;
  colorClass: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={`pillar-card ${colorClass}`}>
      <span className="pillar-label">{t(labelKey)}</span>
      <span className="pillar-value">{value}%</span>
    </div>
  );
}

export function HomeView({
  activeTab = 'map',
  onTabChange,
  sdt,
  seiwert,
  topPaths,
  impulseItems,
  weeklyData,
  sinnQuote,
  sinnIndex,
  resourcesStatus,
}: HomeViewProps) {
  const { t } = useTranslation();

  const pathsData = topPaths.map((path) => ({
    ...path,
    name: t(path.nameKey),
    subtitle: t(path.subtitleKey),
  }));

  return (
    <div className="home-screen">
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
        <button className="home-header-gear" aria-label={t('ui.settings')}>
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

      <div className="home-content">
        <section className="home-card">
          <div className="card-section-label">{t('ui.global_status_label')}</div>
          <div className="global-score-row">
            <span className="global-score-number">{sdt.autonomy}</span>
            <span className="global-score-percent">%</span>
          </div>
          <div className="global-score-sublabel">{t('autonomy_score')}</div>
          <div className="global-metrics-grid">
            <div className="global-metric">
              <span className="global-metric-label">{t('ui.competence')}</span>
              <span className="global-metric-value global-metric-value-orange">
                {sdt.competence}%
              </span>
            </div>
            <div className="global-metric">
              <span className="global-metric-label">{t('ui.relatedness')}</span>
              <span className="global-metric-value global-metric-value-yellow">
                {sdt.relatedness}%
              </span>
            </div>
          </div>
          <div className="global-resources-row">
            <span className="global-metric-label">{t('resources')}</span>
            <span className={`global-metric-value ${resourcesStatus.colorClass}`}>
              {t(resourcesStatus.labelKey)}
            </span>
          </div>
        </section>

        <section className="home-card sinn-card">
          <div className="card-section-label">{t('ui.sinn_index_label')}</div>
          <div className="sinn-gauge-wrap">
            <CircularGauge value={sinnIndex} />
          </div>
          <p className="sinn-quote">{sinnQuote}</p>
        </section>

        <section className="home-card">
          <div className="card-section-label">{t('ui.seiwert_radar_label')}</div>
          <div className="pillars-grid">
            <PillarCard labelKey="ui.work" value={seiwert.work_finance} colorClass="pillar-card-color-orange" />
            <PillarCard labelKey="ui.social" value={seiwert.family_social} colorClass="pillar-card-color-yellow" />
            <PillarCard labelKey="ui.health" value={seiwert.health_body} colorClass="pillar-card-color-green" />
            <PillarCard labelKey="ui.meaning" value={seiwert.meaning_values} colorClass="pillar-card-color-teal" />
          </div>
        </section>

        {pathsData.map((path, i) => (
          <section key={path.id} className={`path-card ${path.cssClass}`}>
            <div className="path-card-overlay" />
            <div className="path-card-body">
              <h2 className="path-name">{path.name}</h2>
              <p className="path-subtitle">{path.subtitle}</p>
              <button className={`path-btn ${i === 0 ? 'path-btn-primary' : 'path-btn-secondary'}`}>
                {t('ui.choose')}
              </button>
            </div>
          </section>
        ))}

        <section className="home-card">
          <div className="impulse-header">
            <span className="impulse-bolt">⚡</span>
            <span className="impulse-title">{t('ui.impulse_title')}</span>
          </div>
          <ul className="impulse-list">
            {impulseItems.map((item, i) => (
              <li key={i} className="impulse-item">
                <span className={`impulse-dot impulse-dot-${item.type}`} />
                <span className="impulse-text">{item.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="home-card resources-card">
          <div className="card-section-label">{t('ui.resource_capacity_label')}</div>
          <div className="bar-chart">
            {weeklyData.map(({ day, value, isToday }) => (
              <div key={day} className="bar-col">
                <div className="bar-track">
                  <div
                    className={`bar-fill bar-fill-${value}${isToday ? ' bar-fill-today' : ''}`}
                  />
                </div>
                <div className={`bar-label${isToday ? ' bar-label-today' : ''}`}>
                  <span>{day}</span>
                  {isToday && <span className="bar-heute">({t('ui.today')})</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}