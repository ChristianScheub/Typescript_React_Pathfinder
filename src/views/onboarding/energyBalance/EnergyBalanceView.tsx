import './EnergyBalanceView.css';
import { ObHeader } from '@ui/onboarding/ObHeader';
import { SliderCard } from '@ui/onboarding/SliderCard';
import { ObNavBar } from '@ui/onboarding/ObNavBar';

const SLIDERS = [
  { key: 'internalResources' as const, label: 'Interne Ressourcen', sublabel: 'Zeit & Energie-Batterie', icon: '🔋', leftLabel: 'ERSCHÖPFT', rightLabel: 'VITAL', color: '#00e5cc' },
  { key: 'externalResources' as const, label: 'Externe Ressourcen', sublabel: 'Geld & Helfer-Netzwerk', icon: '👥', leftLabel: 'ISOLIERT', rightLabel: 'UNTERSTÜTZT', color: '#00e5cc' },
  { key: 'demands' as const, label: 'Belastungsseite', sublabel: 'Stress & Verpflichtungen', icon: '⚠️', leftLabel: 'LEICHT', rightLabel: 'ÜBERLASTET', color: '#f59e0b' },
];

interface EnergyBalanceViewProps {
  internalResources: number;
  externalResources: number;
  demands: number;
  onInternalResourcesChange: (v: number) => void;
  onExternalResourcesChange: (v: number) => void;
  onDemandsChange: (v: number) => void;
  onBack: () => void;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

export function EnergyBalanceView({
  internalResources, externalResources, demands,
  onInternalResourcesChange, onExternalResourcesChange, onDemandsChange,
  onBack, onNext, currentStep, totalSteps,
}: EnergyBalanceViewProps) {
  const avgResources = (internalResources + externalResources) / 2;
  const tiltDeg = ((demands - avgResources) / 100) * 18;
  const values = [internalResources, externalResources, demands];
  const handlers = [onInternalResourcesChange, onExternalResourcesChange, onDemandsChange];

  return (
    <div className="ew-screen">
      <ObHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepVariant="dots"
      />

      <div className="ew-content">
        <h1 className="ew-title">Energie-Wippe</h1>
        <p className="ew-subtitle">Ihre Belastung vs. Ihre Ressourcen.</p>

        <div className="ew-seesaw-wrap">
          <svg width="320" height="160" viewBox="0 0 320 160">
            <g transform={`rotate(${tiltDeg}, 160, 110)`}>
              <defs>
                <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#a3e635" />
                  <stop offset="100%" stopColor="#00e5cc" />
                </linearGradient>
              </defs>
              <rect x="20" y="106" width="280" height="8" rx="4" fill="url(#barGrad)" />
              <rect x="55" y="70" width="80" height="36" rx="8" fill="#2a1a05" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="95" y="83" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold">BELASTUNG</text>
              <text x="95" y="97" textAnchor="middle" fill="#f59e0b" fontSize="9">⚡</text>
              <rect x="185" y="70" width="80" height="36" rx="8" fill="#0a2a2a" stroke="#00e5cc" strokeWidth="1.5" />
              <text x="225" y="83" textAnchor="middle" fill="#00e5cc" fontSize="8" fontWeight="bold">RESSOURCEN</text>
              <text x="225" y="97" textAnchor="middle" fill="#00e5cc" fontSize="9">⚡</text>
            </g>
            <polygon points="145,114 175,114 160,140" fill="#3a3d48" />
            <rect x="152" y="138" width="16" height="12" rx="2" fill="#3a3d48" />
            <circle cx="160" cy="113" r="6" fill="#00e5cc" />
          </svg>
        </div>

        <div className="ew-slider-list">
          {SLIDERS.map((s, idx) => (
            <SliderCard
              key={s.key}
              icon={s.icon}
              label={s.label}
              sublabel={s.sublabel}
              value={values[idx]}
              accentColor={s.color}
              leftLabel={s.leftLabel}
              rightLabel={s.rightLabel}
              onChange={handlers[idx]}
            />
          ))}
        </div>
      </div>

      <ObNavBar
        onBack={onBack}
        onNext={onNext}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />
    </div>
  );
}
