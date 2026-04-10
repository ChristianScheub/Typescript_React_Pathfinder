import './SliderCard.css';

interface SliderCardProps {
  icon: string;
  label: string;
  sublabel: string;
  value: number;
  accentColor?: string;
  leftLabel?: string;
  rightLabel?: string;
  onChange: (v: number) => void;
}

export function SliderCard({ icon, label, sublabel, value, accentColor = '#00e5cc', leftLabel, rightLabel, onChange }: SliderCardProps) {
  return (
    <div className="slider-card">
      <div className="slider-card__header">
        <span className="slider-card__icon">{icon}</span>
        <div className="slider-card__info">
          <span className="slider-card__name">{label}</span>
          <span className="slider-card__sublabel">{sublabel}</span>
        </div>
        <span className="slider-card__value" style={{ ['--clr' as string]: accentColor }}>
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        className="slider-card__range"
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {(leftLabel ?? rightLabel) && (
        <div className="slider-card__labels">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}
