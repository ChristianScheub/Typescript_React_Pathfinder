import './ObHeader.css';

interface ObHeaderProps {
  title?: string;
  currentStep: number;
  totalSteps: number;
  stepVariant?: 'label' | 'bars' | 'dots' | 'progress';
}

export function ObHeader({ title = 'Onboarding', currentStep, totalSteps, stepVariant = 'label' }: ObHeaderProps) {
  return (
    <div className="ob-header">
      <span className="ob-header__title">{title}</span>
      <div className="ob-header__step">
        {stepVariant === 'bars' && (
          <div className="ob-step-bars">
            {Array.from({ length: totalSteps }, (_, i) => (
              <span key={i} className={`ob-step-bar ${i + 1 <= currentStep ? 'ob-step-bar--active' : ''}`} />
            ))}
          </div>
        )}
        {stepVariant === 'dots' && (
          <div className="ob-step-dots">
            {Array.from({ length: totalSteps }, (_, i) => (
              <span key={i} className={`ob-step-dot ${i + 1 <= currentStep ? 'ob-step-dot--active' : ''}`} />
            ))}
          </div>
        )}
        {stepVariant === 'progress' && (
          <div className="ob-step-progress">
            <div
              className="ob-step-progress__fill"
              style={{ ['--pct' as string]: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        )}
        <span className="ob-header__step-label">{currentStep}/{totalSteps}</span>
      </div>
    </div>
  );
}
