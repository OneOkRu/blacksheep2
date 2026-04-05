import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Player, Tournament } from '../types';
import { X } from 'lucide-react';

interface PlayerModalProps {
  player: Player | null;
  tournaments?: Tournament[];
  onClose: () => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({ player, tournaments = [], onClose }) => {
  if (!player) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-50/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img
                src={`https://mc-heads.net/avatar/${player.skinNickname || player.nickname}/64`}
                alt={player.nickname}
                className="w-16 h-16 rounded-lg pixelated bg-gray-200 shadow-inner"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                  {player.nickname}
                  {player.badge && <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-700 rounded uppercase tracking-wider border border-gray-200">{player.badge}</span>}
                  {tournaments.map(t => {
                    if (t.places[1] === player.id && t.shortName) {
                      return <span key={t.id} className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-800 rounded uppercase tracking-wider border border-yellow-200" title={`1st Place: ${t.name}`}>{t.shortName}</span>;
                    }
                    if (t.places[2] === player.id && t.shortName) {
                      return <span key={t.id} className="text-xs font-bold px-2 py-1 bg-gray-200 text-gray-800 rounded uppercase tracking-wider border border-gray-300" title={`2nd Place: ${t.name}`}>{t.shortName}</span>;
                    }
                    if (t.places[3] === player.id && t.shortName) {
                      return <span key={t.id} className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-800 rounded uppercase tracking-wider border border-orange-200" title={`3rd Place: ${t.name}`}>{t.shortName}</span>;
                    }
                    return null;
                  })}
                </h2>
                <div className="flex gap-3 mt-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Points: <strong className="text-gray-900">{player.points}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    ELO: <strong className="text-gray-900">{player.elo}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Tier: <strong className="text-gray-900">{player.tier}</strong>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Rating Evolution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={player.history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#111827' }}
                    itemStyle={{ color: '#10b981' }}
                    labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="points" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="elo" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
