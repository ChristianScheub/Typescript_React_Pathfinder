export interface IStorageService {
  getScoreboard(): ScoreboardData | null;
  saveScoreboard(data: ScoreboardData): void;
  hasCompletedOnboarding(): boolean;
}

export interface ScoreboardData {
  user_id: string;
  timestamp: string;
  current_life_phase: string;
  relationship_status: string;
  last_event: string;
  kpi_dashboards: KpiDashboards;
}

export interface KpiDashboards {
  '1_sdt_motivation': SdtMotivation;
  '2_kastner_balance': KastnerBalance;
  '3_seiwert_pillars': SeiwertPillars;
  '4_ryff_eudaimonia': RyffEudaimonia;
}

export interface SdtMotivation {
  description: string;
  autonomy: number;
  competence: number;
  relatedness: number;
}

export interface KastnerBalance {
  description: string;
  demands: number;
  resources: number;
  imbalance_warning: boolean;
  burnout_risk_level: string;
}

export interface SeiwertPillars {
  description: string;
  work_finance: number;
  family_social: number;
  health_body: number;
  meaning_values: number;
}

export interface RyffEudaimonia {
  description: string;
  purpose_in_life: number;
  environmental_mastery: number;
  personal_growth: number;
  positive_relations: number;
  self_acceptance: number;
  autonomy_ryff: number;
}
