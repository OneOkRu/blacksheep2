import React from 'react';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';
import { Trophy, Medal } from 'lucide-react';

export const Tournaments: React.FC = () => {
  const { data } = useData();

  if (!data) return null;

  const getPlayer = (id: string) => {
    return data.players.find(p => p.id === id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Tournaments
        </h1>
        <p className="text-gray-600 text-lg">
          Recent tournaments and their winners.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.tournaments.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white/50 rounded-xl border border-gray-200">
            No tournaments found.
          </div>
        ) : (
          data.tournaments.map((tournament) => (
            <div key={tournament.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {tournament.name}
                    {tournament.shortName && <span className="ml-2 text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded uppercase tracking-wider border border-gray-200 align-middle">{tournament.shortName}</span>}
                  </h3>
                  <p className="text-sm text-gray-500">{format(new Date(tournament.date), 'MMMM d, yyyy')}</p>
                </div>
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              
              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-100 border border-yellow-200">
                  <span className="font-bold text-yellow-600 w-6 text-center">1st</span>
                  <img src={`https://mc-heads.net/avatar/${getPlayer(tournament.places[1])?.skinNickname || getPlayer(tournament.places[1])?.nickname || 'Unknown'}/24`} alt="" className="w-6 h-6 rounded-sm pixelated" />
                  <span className="font-medium text-gray-900">{getPlayer(tournament.places[1])?.nickname || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-100 border border-gray-200">
                  <span className="font-bold text-gray-600 w-6 text-center">2nd</span>
                  <img src={`https://mc-heads.net/avatar/${getPlayer(tournament.places[2])?.skinNickname || getPlayer(tournament.places[2])?.nickname || 'Unknown'}/24`} alt="" className="w-6 h-6 rounded-sm pixelated" />
                  <span className="font-medium text-gray-900">{getPlayer(tournament.places[2])?.nickname || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-orange-100 border border-orange-200">
                  <span className="font-bold text-orange-600 w-6 text-center">3rd</span>
                  <img src={`https://mc-heads.net/avatar/${getPlayer(tournament.places[3])?.skinNickname || getPlayer(tournament.places[3])?.nickname || 'Unknown'}/24`} alt="" className="w-6 h-6 rounded-sm pixelated" />
                  <span className="font-medium text-gray-900">{getPlayer(tournament.places[3])?.nickname || 'Unknown'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
