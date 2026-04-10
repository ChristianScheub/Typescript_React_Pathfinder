import './HardFactsView.css';
import { ObHeader } from '@ui/onboarding/ObHeader';
import { OptionCard } from '@ui/onboarding/OptionCard';
import { ObNavBar } from '@ui/onboarding/ObNavBar';

const LIFE_PHASES = [
  { id: 'education', label: 'Ausbildung/Studium', icon: '🎓' },
  { id: 'employed', label: 'Angestellt', icon: '💼' },
  { id: 'self-employed', label: 'Selbstständig', icon: '🚀' },
  { id: 'job-seeking', label: 'Arbeitssuchend', icon: '🔍' },
  { id: 'parental-leave', label: 'Elternzeit', icon: '👨‍👩‍👧' },
];

const RELATIONSHIP_OPTIONS = [
  { id: 'single', label: 'Single', icon: '👤' },
  { id: 'relationship', label: 'Partnerschaft', icon: '❤️' },
  { id: 'with-children', label: 'mit Kindern', icon: '👨‍👩‍👧‍👦' },
];

interface HardFactsViewProps {
  lifePhase: string;
  relationshipStatus: string;
  onLifePhaseChange: (value: string) => void;
  onRelationshipChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

export function HardFactsView({
  lifePhase,
  relationshipStatus,
  onLifePhaseChange,
  onRelationshipChange,
  onBack,
  onNext,
  currentStep,
  totalSteps,
}: HardFactsViewProps) {
  return (
    <div className="hf-screen">
      <ObHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepVariant="label"
      />

      <div className="hf-content">
        <h1 className="hf-title">Harte Fakten</h1>
        <p className="hf-subtitle">
          Wir gestalten deine finanzielle Zukunft. Beginn mit dem Fundament deiner Situation.
        </p>

        <div className="ob-section-label">IN WELCHER LEBENSPHASE BEFINDEST DU DICH GERADE?</div>
        <div className="hf-option-list">
          {LIFE_PHASES.map((phase) => (
            <OptionCard
              key={phase.id}
              icon={phase.icon}
              label={phase.label}
              selected={lifePhase === phase.id}
              variant="check"
              onClick={() => onLifePhaseChange(phase.id)}
            />
          ))}
        </div>

        <div className="ob-section-label">WIE SIEHT DEIN AKTUELLES UMFELD AUS?</div>
        <div className="hf-option-list">
          {RELATIONSHIP_OPTIONS.map((option) => (
            <OptionCard
              key={option.id}
              icon={option.icon}
              label={option.label}
              selected={relationshipStatus === option.id}
              variant="radio"
              onClick={() => onRelationshipChange(option.id)}
            />
          ))}
        </div>
      </div>

      <ObNavBar
        onBack={onBack}
        onNext={onNext}
        currentStep={currentStep}
        totalSteps={totalSteps}
        disabled={!lifePhase || !relationshipStatus}
      />
    </div>
  );
}
