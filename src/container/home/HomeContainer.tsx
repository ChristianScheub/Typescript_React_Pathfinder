import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { storageService } from '@services/storage';
import { HomeView, createHomeViewProps } from '@views/home/HomeView';
import type { ActiveTab } from '@ui/home/BottomNav';

const HomeContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const { t } = useTranslation();
  
  const data = storageService.getScoreboard();
  
  if (!data) {
    return null;
  }

  const sdt = data.kpi_dashboards['1_sdt_motivation'] as { autonomy: number; competence: number; relatedness: number };
  const kastner = data.kpi_dashboards['2_kastner_balance'] as { resources: number; demands: number; burnout_risk_level: 'Low' | 'Medium' | 'High'; imbalance_warning: boolean };
  const seiwert = data.kpi_dashboards['3_seiwert_pillars'] as { work_finance: number; family_social: number; health_body: number; meaning_values: number };
  const ryff = data.kpi_dashboards['4_ryff_eudaimonia'] as { purpose_in_life: number; environmental_mastery: number; personal_growth: number; positive_relations: number; self_acceptance: number; autonomy_ryff: number };

  const props = createHomeViewProps(sdt, kastner, seiwert, ryff, t);

  return (
    <HomeView
      activeTab={activeTab}
      onTabChange={setActiveTab}
      sdt={props.sdt}
      kastner={props.kastner}
      seiwert={props.seiwert}
      ryff={props.ryff}
      topPaths={props.topPaths}
      impulseItems={props.impulseItems}
      weeklyData={props.weeklyData}
      sinnQuote={props.sinnQuote}
      sinnIndex={props.sinnIndex}
      resourcesStatus={props.resourcesStatus}
    />
  );
};

export default HomeContainer;