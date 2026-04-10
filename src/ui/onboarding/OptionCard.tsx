import './OptionCard.css';

interface OptionCardProps {
  icon: string;
  label: string;
  selected: boolean;
  variant: 'check' | 'radio';
  onClick: () => void;
}

export function OptionCard({ icon, label, selected, variant, onClick }: OptionCardProps) {
  return (
    <button
      className={`option-card ${selected ? 'option-card--selected' : ''}`}
      onClick={onClick}
    >
      <span className={`option-card__icon ${selected && variant === 'check' ? 'option-card__icon--active' : ''}`}>
        {icon}
      </span>
      <span className="option-card__label">{label}</span>
      {variant === 'check' && selected && <span className="option-card__check">✓</span>}
      {variant === 'radio' && (
        <span className={`option-card__radio ${selected ? 'option-card__radio--active' : ''}`} />
      )}
    </button>
  );
}
