import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { PlayerTable } from '../components/PlayerTable';
import { PlayerModal } from '../components/PlayerModal';
import { Player } from '../types';

export const Home: React.FC = () => {
  const { data } = useData();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {data.settings.siteName}
        </h1>
        <p className="text-gray-600 text-lg">
          {data.settings.description}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Overall Rating</h2>
          <span className="text-sm text-gray-500">{data.players.length} players</span>
        </div>
        
        <PlayerTable 
          players={data.players} 
          tournaments={data.tournaments}
          tiers={data.tiers}
          sortBy="points" 
          onPlayerClick={setSelectedPlayer} 
          showTier={true}
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
