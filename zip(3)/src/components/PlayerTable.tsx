import React from 'react';
import { motion } from 'framer-motion';
import { Player, Tournament, Tier } from '../types';
import { cn } from '../lib/utils';

interface PlayerTableProps {
  players: Player[];
  tournaments?: Tournament[];
  tiers?: Tier[];
  sortBy: 'points' | 'elo';
  onPlayerClick: (player: Player) => void;
  showTier?: boolean;
  tierId?: string;
}

export const PlayerTable: React.FC<PlayerTableProps> = ({ players, tournaments = [], tiers = [], sortBy, onPlayerClick, showTier, tierId }) => {
  const sortedPlayers = [...players].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white/50">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-white/80 text-gray-600 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 w-16 text-center">#</th>
            <th className="px-4 py-3">Player</th>
            {showTier && <th className="px-4 py-3 text-center">Tier</th>}
            <th className="px-4 py-3 text-right">{sortBy === 'points' ? 'Points' : 'ELO'}</th>
          </tr>
        </thead>
        <motion.tbody layout>
          {sortedPlayers.map((player, index) => (
            <motion.tr
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              key={player.id}
              onClick={() => onPlayerClick(player)}
              className="border-b border-gray-200/50 hover:bg-gray-200/50 cursor-pointer transition-colors group"
            >
              <td className="px-4 py-3 text-center font-mono text-gray-500 group-hover:text-gray-700">
                {index + 1}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://mc-heads.net/avatar/${player.skinNickname || player.nickname}/32`}
                    alt={player.nickname}
                    className="w-8 h-8 rounded-sm pixelated bg-gray-200"
                    loading="lazy"
                  />
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-gray-900">{player.nickname}</span>
                    <div className="flex gap-1 mt-0.5">
                      {player.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded uppercase tracking-wider border border-gray-200" title="Badge">{player.badge}</span>
                      )}
                      {(!tierId || tierId === 'overall') && tournaments.map(t => {
                        const firstPlace = t.places[1] || (t.places as any)["1"];
                        const secondPlace = t.places[2] || (t.places as any)["2"];
                        const thirdPlace = t.places[3] || (t.places as any)["3"];

                        if (firstPlace === player.id && t.shortName) {
                          return <span key={t.id} className="text-[10px] font-bold px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded uppercase tracking-wider border border-yellow-200" title={`1st Place: ${t.name}`}>{t.shortName}</span>;
                        }
                        if (secondPlace === player.id && t.shortName) {
                          return <span key={t.id} className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-200 text-gray-800 rounded uppercase tracking-wider border border-gray-300" title={`2nd Place: ${t.name}`}>{t.shortName}</span>;
                        }
                        if (thirdPlace === player.id && t.shortName) {
                          return <span key={t.id} className="text-[10px] font-bold px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded uppercase tracking-wider border border-orange-200" title={`3rd Place: ${t.name}`}>{t.shortName}</span>;
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </td>
              {showTier && (
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-bold border min-w-[2rem]",
                      (tierId && player.tierScores ? player.tierScores[tierId] || player.tier : player.tier) === 'S' ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                      (tierId && player.tierScores ? player.tierScores[tierId] || player.tier : player.tier) === 'A' ? "bg-red-100 text-red-800 border-red-200" :
                      (tierId && player.tierScores ? player.tierScores[tierId] || player.tier : player.tier) === 'B' ? "bg-purple-100 text-purple-800 border-purple-200" :
                      (tierId && player.tierScores ? player.tierScores[tierId] || player.tier : player.tier) === 'C' ? "bg-blue-100 text-blue-800 border-blue-200" :
                      (tierId && player.tierScores ? player.tierScores[tierId] || player.tier : player.tier) === 'D' ? "bg-green-100 text-green-800 border-green-200" :
                      "bg-gray-100 text-gray-800 border-gray-200"
                    )}>
                      {tierId && player.tierScores ? player.tierScores[tierId] || player.tier : player.tier}
                    </span>
                    {(!tierId || tierId === 'overall') && player.tierScores && (
                      <div className="flex flex-wrap justify-center gap-1 mt-1 max-w-[100px]">
                        {Object.entries(player.tierScores).map(([kitId, rank]) => {
                          if (kitId === 'overall') return null;
                          const kit = tiers.find(t => t.id === kitId);
                          return (
                            <span key={kitId} className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-0.5" title={kit?.name || kitId}>
                              {kit?.icon || kitId.substring(0, 1)}:{rank}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </td>
              )}
              <td className="px-4 py-3 text-right font-mono font-medium text-gray-700">
                {player[sortBy]}
              </td>
            </motion.tr>
          ))}
          {sortedPlayers.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                No players found
              </td>
            </tr>
          )}
        </motion.tbody>
      </table>
    </div>
  );
};
