'use client';

import LevelCard from '@/components/LevelCard';
import DailyBonusCard from '@/components/DailyBonusCard';
import QuestsGrid from '@/components/QuestsGrid';
import LeaderboardWidget from '@/components/LeaderboardWidget';
import RewardsShop from '@/components/RewardsShop';

export default function GamificationTab() {
  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <LevelCard />
        <DailyBonusCard />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <QuestsGrid />
        <LeaderboardWidget />
      </div>

      <RewardsShop />
    </div>
  );
}
