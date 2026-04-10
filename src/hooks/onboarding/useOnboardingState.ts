import { useState } from 'react';
import type { ScoreboardData } from '@services/storage';

export interface OnboardingState {
  step: number;
  setStep: (s: number) => void;
  lifePhase: string;
  setLifePhase: (v: string) => void;
  relationshipStatus: string;
  setRelationshipStatus: (v: string) => void;
  workFinance: number;
  setWorkFinance: (v: number) => void;
  familySocial: number;
  setFamilySocial: (v: number) => void;
  healthBody: number;
  setHealthBody: (v: number) => void;
  meaningValues: number;
  setMeaningValues: (v: number) => void;
  radarTotal: number;
  autonomy: number;
  setAutonomy: (v: number) => void;
  competence: number;
  setCompetence: (v: number) => void;
  relatedness: number;
  setRelatedness: (v: number) => void;
  internalResources: number;
  setInternalResources: (v: number) => void;
  externalResources: number;
  setExternalResources: (v: number) => void;
  demands: number;
  setDemands: (v: number) => void;
  driver: string;
  setDriver: (v: string) => void;
  buildScoreboardData: () => ScoreboardData;
}

export function useOnboardingState(): OnboardingState {
  const [step, setStep] = useState(0);
  const [lifePhase, setLifePhase] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [workFinance, setWorkFinance] = useState(40);
  const [familySocial, setFamilySocial] = useState(30);
  const [healthBody, setHealthBody] = useState(20);
  const [meaningValues, setMeaningValues] = useState(10);
  const [autonomy, setAutonomy] = useState(50);
  const [competence, setCompetence] = useState(50);
  const [relatedness, setRelatedness] = useState(50);
  const [internalResources, setInternalResources] = useState(50);
  const [externalResources, setExternalResources] = useState(50);
  const [demands, setDemands] = useState(50);
  const [driver, setDriver] = useState('');

  const radarTotal = workFinance + familySocial + healthBody + meaningValues;

  const buildScoreboardData = (): ScoreboardData => {
    const avgResources = Math.round((internalResources + externalResources) / 2);
    const imbalanceWarning = demands > avgResources + 10;
    const burnoutRiskLevel =
      demands > 75 && avgResources < 40 ? 'High'
      : demands > 60 && avgResources < 55 ? 'Medium'
      : 'Low';
    const purposeInLife = driver === 'freedom' ? 85 : driver === 'career' ? 80 : 75;

    return {
      user_id: `usr_${Date.now()}`,
      timestamp: new Date().toISOString(),
      current_life_phase: lifePhase,
      relationship_status: relationshipStatus,
      last_event: 'onboarding_completed',
      kpi_dashboards: {
        '1_sdt_motivation': {
          description: 'Self-Determination Theory by Deci & Ryan',
          autonomy,
          competence,
          relatedness,
        },
        '2_kastner_balance': {
          description: 'Resource-Demand Balance by Kastner',
          demands,
          resources: avgResources,
          imbalance_warning: imbalanceWarning,
          burnout_risk_level: burnoutRiskLevel,
        },
        '3_seiwert_pillars': {
          description: '4-Pillar Time Balance Model by Seiwert',
          work_finance: workFinance,
          family_social: familySocial,
          health_body: healthBody,
          meaning_values: meaningValues,
        },
        '4_ryff_eudaimonia': {
          description: 'Eudaimonic Well-Being by Ryff',
          purpose_in_life: purposeInLife,
          environmental_mastery: externalResources,
          personal_growth: competence,
          positive_relations: Math.round((relatedness + familySocial) / 2),
          self_acceptance: autonomy,
          autonomy_ryff: autonomy,
        },
      },
    };
  };

  return {
    step, setStep,
    lifePhase, setLifePhase,
    relationshipStatus, setRelationshipStatus,
    workFinance, setWorkFinance,
    familySocial, setFamilySocial,
    healthBody, setHealthBody,
    meaningValues, setMeaningValues,
    radarTotal,
    autonomy, setAutonomy,
    competence, setCompetence,
    relatedness, setRelatedness,
    internalResources, setInternalResources,
    externalResources, setExternalResources,
    demands, setDemands,
    driver, setDriver,
    buildScoreboardData,
  };
}
