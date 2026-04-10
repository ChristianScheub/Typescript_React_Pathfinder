import './InnerTanksView.css';
import { ObHeader } from '@ui/onboarding/ObHeader';
import { ObNavBar } from '@ui/onboarding/ObNavBar';

const TANKS = [
  {
    key: 'autonomy' as const,
    label: 'Autonomie',
    sublabel: '(Selbstbestimmung)',
    description: 'Das Gefühl, Urheber des eigenen Handelns zu sein.',
    gradientClass: 'tank--cyan',
    icon: '⊞',
  },
  {
    key: 'competence' as const,
    label: 'Kompetenz',
    sublabel: '(Wirksamkeit)',
    description: 'Sich fähig fühlen, Aufgaben erfolgreich zu meistern.',
    gradientClass: 'tank--green',
    icon: '⚡',
  },
  {
    key: 'relatedness' as const,
    label: 'Verbundenheit',
    sublabel: '(Soziale Tiefe)',
    description: 'Das Gefühl, anderen nahe zu sein und dazu zu gehören.',
    gradientClass: 'tank--orange',
    icon: '👥',
  },
];

interface InnerTanksViewProps {
  autonomy: number;
  competence: number;
  relatedness: number;
  onAutonomyChange: (v: number) => void;
  onCompetenceChange: (v: number) => void;
  onRelatednessChange: (v: number) => void;
  onBack: () => void;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

export function InnerTanksView({
  autonomy, competence, relatedness,
  onAutonomyChange, onCompetenceChange, onRelatednessChange,
  onBack, onNext, currentStep, totalSteps,
}: InnerTanksViewProps) {
  const values = [autonomy, competence, relatedness];
  const handlers = [onAutonomyChange, onCompetenceChange, onRelatednessChange];

  return (
    <div className="it-screen">
      <ObHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepVariant="label"
      />

      <div className="it-content">
        <h1 className="it-title">Deine inneren Tanks</h1>
        <p className="it-subtitle">
          Wie gut sind deine Grundbedürfnisse aktuell gefüllt? Nimm dir einen Moment Zeit für deine Selbsteinschätzung.
        </p>

        {TANKS.map((tank, idx) => (
          <div key={tank.key} className="it-tank-section">
            <div
              className={`it-tank ${tank.gradientClass}`}
              style={{ ['--fill' as string]: `${values[idx]}%` }}
            >
              <div className="it-tank-fill" />
              <div className="it-tank-info">
                <span className="it-tank-icon">{tank.icon}</span>
                <span className="it-tank-pct">{values[idx]}%</span>
              </div>
            </div>
            <div className="it-tank-label-row">
              <span className="it-tank-name">{tank.label}</span>
              <span className="it-tank-sublabel">{tank.sublabel}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={values[idx]}
              className="ob-range"
              onChange={(e) => handlers[idx](Number(e.target.value))}
            />
            <p className="it-tank-desc">{tank.description}</p>
          </div>
        ))}
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
