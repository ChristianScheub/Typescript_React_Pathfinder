import './DriveView.css';
import { ObHeader } from '@ui/onboarding/ObHeader';
import { ObNavBar } from '@ui/onboarding/ObNavBar';

const DRIVERS = [
  {
    id: 'freedom',
    icon: '🧭',
    title: 'Freiheit & Unabhängigkeit',
    description: 'Fokus auf Autonomie. Dein Kapital dient als Werkzeug für zeitliche und örtliche Souveränität.',
    color: '#00e5cc',
  },
  {
    id: 'career',
    icon: '🏆',
    title: 'Karriere & Meisterschaft',
    description: 'Fokus auf Kompetenz. Wachstum durch Leistung und die kontinuierliche Verfeinerung deiner Fähigkeiten.',
    color: '#f59e0b',
  },
  {
    id: 'community',
    icon: '👨‍👩‍👧',
    title: 'Gemeinschaft & Familie',
    description: 'Fokus auf Verbundenheit. Wohlstand als Basis für Sicherheit und gemeinsame Erlebnisse mit deinen Liebsten.',
    color: '#22c55e',
  },
];

interface DriveViewProps {
  selectedDriver: string;
  onDriverSelect: (id: string) => void;
  onBack: () => void;
  onFinish: () => void;
  currentStep: number;
  totalSteps: number;
}

export function DriveView({ selectedDriver, onDriverSelect, onBack, onFinish, currentStep, totalSteps }: DriveViewProps) {
  return (
    <div className="av-screen">
      <ObHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepVariant="progress"
      />

      <div className="av-content">
        <p className="av-eyebrow">Was treibt dich an?</p>
        <p className="av-subtitle">
          Dein wichtigster Treiber bestimmt deine eudaimonische Erfolgs-Metrik.
        </p>

        <div className="av-driver-list">
          {DRIVERS.map((d) => (
            <button
              key={d.id}
              className={`av-driver-card ${selectedDriver === d.id ? 'av-driver-card--selected' : ''}`}
              style={{ ['--accent' as string]: d.color }}
              onClick={() => onDriverSelect(d.id)}
            >
              <span className="av-driver-icon" style={{ ['--accent' as string]: d.color }}>{d.icon}</span>
              <h3 className="av-driver-title">{d.title}</h3>
              <p className="av-driver-desc">{d.description}</p>
              {selectedDriver === d.id
                ? <span className="av-driver-selected">Ausgewählt ✓</span>
                : <span className="av-driver-pick">WÄHLEN</span>
              }
            </button>
          ))}
        </div>

        <div className="av-info-box">
          <span className="av-info-icon">ℹ</span>
          <p className="av-info-text">
            <strong>Der eudaimonische Faktor</strong> — Im Gegensatz zu hedonischem Glück basiert Eudaimonia auf persönlichem Wachstum und Sinnhaftigkeit. Deine Wahl beeinflusst, wie unser Algorithmus &quot;Erfolg&quot; für dich gewichtet.
          </p>
        </div>
      </div>

      <ObNavBar
        onBack={onBack}
        onNext={onFinish}
        currentStep={currentStep}
        totalSteps={totalSteps}
        disabled={!selectedDriver}
        isLastStep
      />
    </div>
  );
}
