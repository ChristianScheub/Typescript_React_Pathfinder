import './ObNavBar.css';

interface ObNavBarProps {
  onBack: () => void;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
  disabled?: boolean;
  isLastStep?: boolean;
}

export function ObNavBar({ onBack, onNext, currentStep, totalSteps, disabled = false, isLastStep = false }: ObNavBarProps) {
  return (
    <div className="ob-navbar">
      <button className="ob-navbar__back" onClick={onBack}>← Zurück</button>
      <div className="ob-navbar__dots">
        {Array.from({ length: totalSteps }, (_, i) => (
          <span key={i} className={`ob-navbar__dot ${i + 1 === currentStep ? 'ob-navbar__dot--active' : ''}`} />
        ))}
      </div>
      <button className="ob-navbar__next" onClick={onNext} disabled={disabled}>
        <span className="ob-navbar__next-arrow">→</span>
        <span className="ob-navbar__next-label">{isLastStep ? 'STARTEN' : 'WEITER'}</span>
      </button>
    </div>
  );
}
