import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { PlayerTable } from '../components/PlayerTable';
import { PlayerModal } from '../components/PlayerModal';
import { Player } from '../types';
import { cn } from '../lib/utils';

export const Tiers: React.FC = () => {
  const { data } = useData();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [activeTierId, setActiveTierId] = useState<string>('overall');

  if (!data) return null;

  const filteredPlayers = useMemo(() => {
    if (activeTierId === 'overall') return data.players;
    return data.players.filter(p => p.tierScores && p.tierScores[activeTierId]);
  }, [data.players, activeTierId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Tiers
        </h1>
        <p className="text-gray-600 text-lg">
          Player rankings by specific categories.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {data.tiers.map(tier => (
          <button
            key={tier.id}
            onClick={() => setActiveTierId(tier.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
              activeTierId === tier.id 
                ? "bg-gray-900 text-white" 
                : "bg-white text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-gray-200"
            )}
          >
            {tier.icon && <span>{tier.icon}</span>}
            {tier.name}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <PlayerTable 
          players={filteredPlayers} 
          tournaments={data.tournaments}
          tiers={data.tiers}
          sortBy="points" 
          onPlayerClick={setSelectedPlayer} 
          showTier={true}
          tierId={activeTierId}
        />
      </div>

      <PlayerModal 
        player={selectedPlayer} 
        tournaments={data.tournaments}
        onClose={() => setSelectedPlayer(null)} 
      />
    </div>
  );
};
