import './EnergyRadarView.css';
import { ObHeader } from '@ui/onboarding/ObHeader';
import { SliderCard } from '@ui/onboarding/SliderCard';
import { ObNavBar } from '@ui/onboarding/ObNavBar';

const PILLARS = [
  { key: 'workFinance' as const, label: 'Arbeit & Finanzen', sublabel: 'PRIORITÄT HOCH', icon: '🏛️', color: '#00e5cc' },
  { key: 'familySocial' as const, label: 'Familie & Soziales', sublabel: 'BEZIEHUNGEN', icon: '👨‍👩‍👧', color: '#f59e0b' },
  { key: 'healthBody' as const, label: 'Körper & Gesundheit', sublabel: 'VITALITÄT', icon: '⚡', color: '#22c55e' },
  { key: 'meaningValues' as const, label: 'Sinn & Werte', sublabel: 'ERFÜLLUNG', icon: '🧘', color: '#9ca3af' },
];

function radarPoints(wf: number, fs: number, hb: number, mv: number): string {
  const cx = 120, cy = 120, maxR = 90;
  return [
    `${cx},${cy - (wf / 100) * maxR}`,
    `${cx + (fs / 100) * maxR},${cy}`,
    `${cx},${cy + (hb / 100) * maxR}`,
    `${cx - (mv / 100) * maxR},${cy}`,
  ].join(' ');
}

interface EnergyRadarViewProps {
  workFinance: number;
  familySocial: number;
  healthBody: number;
  meaningValues: number;
  total: number;
  onWorkFinanceChange: (v: number) => void;
  onFamilySocialChange: (v: number) => void;
  onHealthBodyChange: (v: number) => void;
  onMeaningValuesChange: (v: number) => void;
  onBack: () => void;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

export function EnergyRadarView({
  workFinance, familySocial, healthBody, meaningValues, total,
  onWorkFinanceChange, onFamilySocialChange, onHealthBodyChange, onMeaningValuesChange,
  onBack, onNext, currentStep, totalSteps,
}: EnergyRadarViewProps) {
  const points = radarPoints(workFinance, familySocial, healthBody, meaningValues);
  const values = [workFinance, familySocial, healthBody, meaningValues];
  const handlers = [onWorkFinanceChange, onFamilySocialChange, onHealthBodyChange, onMeaningValuesChange];

  return (
    <div className="er-screen">
      <ObHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepVariant="bars"
      />

      <div className="er-content">
        <h1 className="er-title">Energie-Radar</h1>
        <p className="er-subtitle">Verteile 100% deiner Zeit und Energie auf deine Lebensbereiche.</p>

        <div className="er-radar-wrap">
          <svg width="240" height="240" viewBox="0 0 240 240">
            {[20, 40, 60, 80].map((r) => (
              <polygon
                key={r}
                points={`120,${120 - r} ${120 + r},120 120,${120 + r} ${120 - r},120`}
                fill="none"
                stroke="#2a2d38"
                strokeWidth="1"
              />
            ))}
            <line x1="120" y1="30" x2="120" y2="210" stroke="#2a2d38" strokeWidth="1" />
            <line x1="30" y1="120" x2="210" y2="120" stroke="#2a2d38" strokeWidth="1" />
            <polygon points={points} fill="rgba(0,229,204,0.15)" stroke="#00e5cc" strokeWidth="2" />
            <text x="120" y="18" textAnchor="middle" fill="#9ca3af" fontSize="11">{workFinance}%</text>
            <text x="228" y="124" textAnchor="start" fill="#9ca3af" fontSize="11">{familySocial}%</text>
            <text x="120" y="228" textAnchor="middle" fill="#9ca3af" fontSize="11">{healthBody}%</text>
            <text x="12" y="124" textAnchor="start" fill="#9ca3af" fontSize="11">{meaningValues}%</text>
          </svg>
        </div>

        <div className="er-slider-list">
          {PILLARS.map((pillar, idx) => (
            <SliderCard
              key={pillar.key}
              icon={pillar.icon}
              label={pillar.label}
              sublabel={pillar.sublabel}
              value={values[idx]}
              accentColor={pillar.color}
              onChange={handlers[idx]}
            />
          ))}
        </div>

        <div className={`er-total ${total === 100 ? 'er-total--ok' : 'er-total--warn'}`}>
          <span>{total === 100 ? '✓' : '⚠'}</span>
          <span>Gesamtverteilung: {total}%</span>
        </div>
      </div>

      <ObNavBar
        onBack={onBack}
        onNext={onNext}
        currentStep={currentStep}
        totalSteps={totalSteps}
        disabled={total !== 100}
      />
    </div>
  );
}
