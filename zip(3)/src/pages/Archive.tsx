import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { PlayerTable } from '../components/PlayerTable';
import { PlayerModal } from '../components/PlayerModal';
import { Player } from '../types';
import { format } from 'date-fns';

export const Archive: React.FC = () => {
  const { data } = useData();
  const archives = data?.archives || [];
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedArchiveId, setSelectedArchiveId] = useState<string>('');

  useEffect(() => {
    if (!selectedArchiveId && archives.length > 0) {
      setSelectedArchiveId(archives[0].id);
    }
  }, [archives, selectedArchiveId]);

  const activeArchive = archives.find(a => a.id === selectedArchiveId);
  const playersToDisplay = activeArchive ? activeArchive.data : [];

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Archive
        </h1>
        <p className="text-gray-600 text-lg">
          Historical snapshots of the rating.
        </p>
      </div>

      {archives.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white/50 rounded-xl border border-gray-200">
          No archives available.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Select Season/Snapshot:</label>
            <select
              value={selectedArchiveId}
              onChange={(e) => setSelectedArchiveId(e.target.value)}
              className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block p-2.5"
            >
              <option value="" disabled>Choose a snapshot</option>
              {archives.map(archive => (
                <option key={archive.id} value={archive.id}>
                  {archive.name || format(new Date(archive.date), 'MMMM d, yyyy')}
                </option>
              ))}
            </select>
          </div>

          {activeArchive && (
            <div className="space-y-4 mt-8">
              <PlayerTable 
                players={playersToDisplay} 
                tournaments={data.tournaments}
                tiers={data.tiers}
                sortBy="points" 
                onPlayerClick={setSelectedPlayer} 
                showTier={true}
              />
            </div>
          )}
        </>
      )}

      <PlayerModal 
        player={selectedPlayer} 
        tournaments={data.tournaments}
        onClose={() => setSelectedPlayer(null)} 
      />
    </div>
  );
};
