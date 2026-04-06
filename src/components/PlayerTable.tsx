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
    <div className="w-full overflow-x-auto rounded-xl border border-brand-border bg-brand-card shadow-2xl">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-text-muted border-b border-brand-border">
          <tr>
            <th className="px-3 sm:px-6 py-3 sm:py-5 w-16 sm:w-24 text-center">Rank</th>
            <th className="px-3 sm:px-6 py-3 sm:py-5">Warrior</th>
            <th className="px-3 sm:px-6 py-3 sm:py-5 text-center">Main Tier</th>
            <th className="px-3 sm:px-6 py-3 sm:py-5 text-center hidden sm:table-cell">Sub-Tiers</th>
            <th className="px-3 sm:px-6 py-3 sm:py-5 text-right">Rating</th>
          </tr>
        </thead>
        <motion.tbody layout>
          {sortedPlayers.map((player, index) => {
            const mainTier = tierId && player.tierScores ? player.tierScores[tierId] || player.tier : player.tier;
            
            return (
              <motion.tr
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                key={player.id}
                onClick={() => onPlayerClick(player)}
                className="border-b border-brand-border/50 hover:bg-white/[0.02] cursor-pointer transition-colors group"
              >
                <td className="px-3 sm:px-6 py-4 sm:py-8 text-center">
                  <span className="text-xl sm:text-2xl font-black italic text-white/90 tracking-tighter">
                    #{index + 1}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-4 sm:py-8">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={`https://mc-heads.net/avatar/${player.skinNickname || player.nickname}/48`}
                        alt={player.nickname}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl pixelated bg-brand-bg shadow-lg border border-brand-border object-cover"
                        loading="lazy"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-brand-card border-2 border-brand-bg flex items-center justify-center">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-text-muted/50"></div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-0.5 sm:gap-1 min-w-0">
                      <span className="text-base sm:text-xl font-bold text-white tracking-tight leading-none truncate w-full">{player.nickname}</span>
                      <div className="flex flex-wrap gap-1">
                        {player.badge && (
                          <span className="text-[7px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 uppercase tracking-widest whitespace-nowrap">
                            {player.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4 sm:py-8 text-center">
                  <span className={cn(
                    "text-2xl sm:text-4xl font-black italic tracking-tighter",
                    mainTier === 'S' ? "text-tier-s" :
                    mainTier === 'A' ? "text-tier-a" :
                    mainTier === 'B' ? "text-tier-b" :
                    mainTier === 'C' ? "text-tier-c" :
                    mainTier === 'D' ? "text-tier-d" :
                    "text-white/50"
                  )}>
                    {mainTier}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-4 sm:py-8 hidden sm:table-cell">
                  <div className="flex justify-center gap-4">
                    {player.tierScores && Object.entries(player.tierScores).slice(0, 3).map(([kitId, rank]) => {
                      if (kitId === 'overall') return null;
                      const kit = tiers.find(t => t.id === kitId);
                      return (
                        <div key={kitId} className="flex flex-col items-center gap-0.5">
                          <span className={cn(
                            "text-lg font-black italic leading-none",
                            rank === 'S' ? "text-tier-s" :
                            rank === 'A' ? "text-tier-a" :
                            rank === 'B' ? "text-tier-b" :
                            rank === 'C' ? "text-tier-c" :
                            rank === 'D' ? "text-tier-d" :
                            "text-white/50"
                          )}>
                            {rank}
                          </span>
                          <span className="text-[8px] font-bold text-brand-text-muted uppercase tracking-tighter">
                            {kit?.name?.substring(0, 3) || kitId.substring(0, 3)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4 sm:py-8 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-xl sm:text-2xl font-black text-white tracking-tighter leading-none">
                      {player[sortBy]}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[7px] sm:text-[9px] font-bold text-brand-text-muted uppercase tracking-widest">ELO</span>
                    </div>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </motion.tbody>
      </table>
    </div>
  );
};
