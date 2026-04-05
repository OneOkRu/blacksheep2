import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { PlayerTable } from '../components/PlayerTable';
import { PlayerModal } from '../components/PlayerModal';
import { Player } from '../types';

export const Elo: React.FC = () => {
  const { data } = useData();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          ELO Rating
        </h1>
        <p className="text-gray-600 text-lg">
          Rankings based on the Elo rating system.
        </p>
      </div>

      <div className="space-y-4">
        <PlayerTable 
          players={data.players} 
          tournaments={data.tournaments}
          tiers={data.tiers}
          sortBy="elo" 
          onPlayerClick={setSelectedPlayer} 
          showTier={false}
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
