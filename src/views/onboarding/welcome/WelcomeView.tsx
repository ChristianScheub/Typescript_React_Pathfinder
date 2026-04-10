import './WelcomeView.css';

interface WelcomeViewProps {
  onStart: () => void;
}

export function WelcomeView({ onStart }: WelcomeViewProps) {
  return (
    <div className="welcome-screen">
      <div className="welcome-top">
        <div className="welcome-logo-rings">
          <div className="welcome-ring welcome-ring--outer" />
          <div className="welcome-ring welcome-ring--middle" />
          <div className="welcome-ring welcome-ring--inner">
            <span className="welcome-compass-icon">🧭</span>
          </div>
        </div>
        <h1 className="welcome-title">Pathfinder</h1>
        <p className="welcome-subtitle">
          Deine Reise zu finanzieller und emotionaler Freiheit beginnt hier.
        </p>
      </div>

      <div className="welcome-bottom">
        <div className="welcome-actions">
          <button className="welcome-cta-btn" onClick={onStart}>
            Deine Reise starten →
          </button>
          <div className="welcome-progress-dots">
            <span className="ob-dot ob-dot--active" />
            <span className="ob-dot" />
            <span className="ob-dot" />
          </div>
        </div>
        <div className="welcome-badge">
          <span className="welcome-badge-icon">🛡</span>
          <span className="welcome-badge-text">VOLLSTÄNDIG OFFLINE &amp; VERSCHLÜSSELT</span>
        </div>
      </div>
    </div>
  );
}
