/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { RatingData, Player, Tournament, Tier, Match, ArchiveSnapshot } from '../types';
import { Button } from '../components/ui/button';
import { Download, Upload, Save, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

export const Admin: React.FC = () => {
  const { data, updateData } = useData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'players' | 'matches' | 'tournaments' | 'tiers' | 'archives' | 'settings'>('players');
  const [localData, setLocalData] = useState<RatingData | null>(null);
  const [livePreview, setLivePreview] = useState(false);

  // Load from session draft or context
  useEffect(() => {
    if (data && !localData) {
      const sessionDraft = localStorage.getItem('admin_session_draft');
      if (sessionDraft) {
        try {
          setLocalData(JSON.parse(sessionDraft));
        } catch (e) {
          setLocalData(JSON.parse(JSON.stringify(data)));
        }
      } else {
        setLocalData(JSON.parse(JSON.stringify(data)));
      }
    }
  }, [data, localData]);

  // Auto-save to session draft and optional live preview
  useEffect(() => {
    if (localData) {
      localStorage.setItem('admin_session_draft', JSON.stringify(localData));
      if (livePreview) {
        updateData(localData);
      }
    }
  }, [localData, livePreview, updateData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd check against an env variable.
    // For this demo, we'll accept 'Lazer' or whatever is in NEXT_PUBLIC_ADMIN_PASSWORD
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'Lazer';
    if (password === envPassword) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleExport = () => {
    if (!localData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "rating.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        setLocalData(importedData);
        updateData(importedData);
        alert('Data imported successfully!');
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    if (localData) {
      updateData(localData);
      localStorage.removeItem('admin_session_draft'); // Clear session draft after permanent save
      alert('Changes applied to preview! To make them permanent in the codebase, use "Export" and replace rating.json.');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to discard all unsaved changes and reset to server data?')) {
      localStorage.removeItem('admin_session_draft');
      setLocalData(JSON.parse(JSON.stringify(data)));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl border border-gray-200 w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 text-sm">Enter password to access</p>
          </div>
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <Button type="submit" className="w-full">Login</Button>
        </form>
      </div>
    );
  }

  if (!localData) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage players, tournaments, and settings.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
            <label className="text-xs font-bold text-gray-600 uppercase cursor-pointer select-none" htmlFor="live-preview">Live Preview</label>
            <input 
              id="live-preview"
              type="checkbox" 
              checked={livePreview} 
              onChange={e => setLivePreview(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
            />
          </div>
          <p className="text-xs text-amber-600 font-medium animate-pulse">Don't forget to Save Changes →</p>
          <label className="cursor-pointer">
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
              <Upload className="w-4 h-4" /> Import
            </div>
          </label>
          <Button onClick={handleReset} variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
            Reset
          </Button>
          <Button onClick={handleSave} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-none">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export JSON
          </Button>
        </div>
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto">
        {['players', 'matches', 'tournaments', 'tiers', 'archives', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2",
              activeTab === tab 
                ? "border-gray-900 text-gray-900" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white/50 border border-gray-200 rounded-xl p-6">
        {activeTab === 'players' && <PlayersAdmin data={localData} setData={setLocalData} />}
        {activeTab === 'matches' && <MatchesAdmin data={localData} setData={setLocalData} />}
        {activeTab === 'tournaments' && <TournamentsAdmin data={localData} setData={setLocalData} />}
        {activeTab === 'tiers' && <TiersAdmin data={localData} setData={setLocalData} />}
        {activeTab === 'archives' && <ArchivesAdmin data={localData} setData={setLocalData} />}
        {activeTab === 'settings' && <SettingsAdmin data={localData} setData={setLocalData} />}
      </div>
    </div>
  );
};

// --- Sub-components for Admin Tabs ---

const MatchesAdmin: React.FC<{ data: RatingData, setData: (d: RatingData) => void }> = ({ data, setData }) => {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [winner, setWinner] = useState<string>('');
  const [matchTier, setMatchTier] = useState<string>('overall');

  const handleRecordMatch = () => {
    if (!p1 || !p2 || !winner) return alert('Select players and winner');
    if (p1 === p2) return alert('Players must be different');

    const player1 = data.players.find(p => p.id === p1);
    const player2 = data.players.find(p => p.id === p2);
    if (!player1 || !player2) return;

    const K = 32;
    const p1Elo = matchTier === 'overall' ? player1.elo : (player1.eloScores?.[matchTier] || 1000);
    const p2Elo = matchTier === 'overall' ? player2.elo : (player2.eloScores?.[matchTier] || 1000);

    const r1 = Math.pow(10, p1Elo / 400);
    const r2 = Math.pow(10, p2Elo / 400);
    const e1 = r1 / (r1 + r2);
    const e2 = r2 / (r1 + r2);

    let s1 = 0, s2 = 0;
    if (winner === 'draw') { s1 = 0.5; s2 = 0.5; }
    else if (winner === p1) { s1 = 1; s2 = 0; }
    else { s1 = 0; s2 = 1; }

    const change1 = Math.round(K * (s1 - e1));
    const change2 = Math.round(K * (s2 - e2));

    const newMatch: Match = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      tierId: matchTier === 'overall' ? undefined : matchTier,
      player1Id: p1,
      player2Id: p2,
      winnerId: winner === 'draw' ? null : winner,
      eloChange1: change1,
      eloChange2: change2
    };

    const today = new Date().toISOString().split('T')[0];

    const updatedPlayers = data.players.map(p => {
      if (p.id === p1) {
        const newElo = matchTier === 'overall' ? p.elo + change1 : p.elo;
        const newEloScores = { ...(p.eloScores || {}) };
        if (matchTier !== 'overall') {
          newEloScores[matchTier] = (newEloScores[matchTier] || 1000) + change1;
        }
        return {
          ...p,
          elo: newElo,
          eloScores: newEloScores,
          history: [...p.history, { date: today, points: p.points, elo: newElo, position: 0 }]
        };
      }
      if (p.id === p2) {
        const newElo = matchTier === 'overall' ? p.elo + change2 : p.elo;
        const newEloScores = { ...(p.eloScores || {}) };
        if (matchTier !== 'overall') {
          newEloScores[matchTier] = (newEloScores[matchTier] || 1000) + change2;
        }
        return {
          ...p,
          elo: newElo,
          eloScores: newEloScores,
          history: [...p.history, { date: today, points: p.points, elo: newElo, position: 0 }]
        };
      }
      return p;
    });

    setData({
      ...data,
      players: updatedPlayers,
      matches: [newMatch, ...(data.matches || [])]
    });

    setP1('');
    setP2('');
    setWinner('');
    alert('Match recorded and ELO updated!');
  };

  const handleDeleteMatch = (matchId: string) => {
    if (confirm('Delete match? This will NOT revert ELO automatically.')) {
      setData({
        ...data,
        matches: (data.matches || []).filter(m => m.id !== matchId)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
        <h3 className="font-medium">Record New Match</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tier / Category</label>
            <select className="bg-white border border-gray-200 rounded px-3 py-2" value={matchTier} onChange={e => setMatchTier(e.target.value)}>
              <option value="overall">Overall</option>
              {data.tiers.filter(t => t.id !== 'overall').map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Player 1</label>
            <select className="bg-white border border-gray-200 rounded px-3 py-2" value={p1} onChange={e => setP1(e.target.value)}>
              <option value="">Select...</option>
              {data.players.map(p => {
                const elo = matchTier === 'overall' ? p.elo : (p.eloScores?.[matchTier] || 1000);
                return <option key={p.id} value={p.id}>{p.nickname} ({elo})</option>;
              })}
            </select>
          </div>
          <div className="text-gray-500 pb-2">VS</div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Player 2</label>
            <select className="bg-white border border-gray-200 rounded px-3 py-2" value={p2} onChange={e => setP2(e.target.value)}>
              <option value="">Select...</option>
              {data.players.map(p => {
                const elo = matchTier === 'overall' ? p.elo : (p.eloScores?.[matchTier] || 1000);
                return <option key={p.id} value={p.id}>{p.nickname} ({elo})</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Result</label>
            <select className="bg-white border border-gray-200 rounded px-3 py-2" value={winner} onChange={e => setWinner(e.target.value)}>
              <option value="">Select Winner...</option>
              {p1 && <option value={p1}>Player 1 Wins</option>}
              {p2 && <option value={p2}>Player 2 Wins</option>}
              <option value="draw">Draw</option>
            </select>
          </div>
          <Button onClick={handleRecordMatch}>Record & Update ELO</Button>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Recent Matches</h3>
        <div className="space-y-2">
          {(data.matches || []).map(m => {
            const p1Name = data.players.find(p => p.id === m.player1Id)?.nickname || 'Unknown';
            const p2Name = data.players.find(p => p.id === m.player2Id)?.nickname || 'Unknown';
            const winnerName = m.winnerId ? (data.players.find(p => p.id === m.winnerId)?.nickname || 'Unknown') : 'Draw';
            const tierName = m.tierId ? (data.tiers.find(t => t.id === m.tierId)?.name || m.tierId) : 'Overall';
            return (
              <div key={m.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-gray-50 p-3 rounded border border-gray-200 text-sm gap-2">
                <div>
                  <span className="text-gray-600 mr-3">{new Date(m.date).toLocaleDateString()}</span>
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs mr-3">{tierName}</span>
                  <span className="font-medium">{p1Name} <span className={m.eloChange1 > 0 ? 'text-emerald-500' : 'text-red-500'}>({m.eloChange1 > 0 ? '+' : ''}{m.eloChange1})</span></span>
                  <span className="text-gray-400 mx-2">vs</span>
                  <span className="font-medium">{p2Name} <span className={m.eloChange2 > 0 ? 'text-emerald-500' : 'text-red-500'}>({m.eloChange2 > 0 ? '+' : ''}{m.eloChange2})</span></span>
                  <span className="ml-4 text-gray-500">Winner: <span className="text-gray-700">{winnerName}</span></span>
                </div>
                <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/10 self-end sm:self-auto" onClick={() => handleDeleteMatch(m.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            );
          })}
          {!(data.matches?.length) && <div className="text-gray-500 text-sm">No matches recorded yet.</div>}
        </div>
      </div>
    </div>
  );
};

const PlayersAdmin: React.FC<{ data: RatingData, setData: (d: RatingData) => void }> = ({ data, setData }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Player>>({});

  const handleAdd = () => {
    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      nickname: 'NewPlayer',
      skinNickname: '',
      points: 0,
      tournamentPoints: 0,
      elo: 1000,
      badge: '',
      tier: 'C',
      tierScores: {},
      history: []
    };
    setData({ ...data, players: [...data.players, newPlayer] });
    setEditingId(newPlayer.id);
    setEditForm(newPlayer);
  };

  const handleSave = () => {
    if (!editingId) return;
    
    let calculatedPoints = editForm.tournamentPoints || data.players.find(p => p.id === editingId)?.tournamentPoints || 0;
    if (editForm.tierScores) {
      Object.values(editForm.tierScores).forEach(t => {
        calculatedPoints += data.settings.tierValues?.[t as string] || 0;
      });
    }

    setData({
      ...data,
      players: data.players.map(p => p.id === editingId ? { ...p, ...editForm, points: calculatedPoints } as Player : p)
    });
    setEditingId(null);
  };

  const handleRecalculate = () => {
    if (confirm('Recalculate all players points based on their tiers and tournament points?')) {
      const updatedPlayers = data.players.map(p => {
        let pts = p.tournamentPoints || 0;
        if (p.tierScores) {
          Object.values(p.tierScores).forEach(t => {
            pts += data.settings.tierValues?.[t as string] || 0;
          });
        }
        return { ...p, points: pts };
      });
      setData({ ...data, players: updatedPlayers });
      alert('Points recalculated successfully!');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) {
      setData({ ...data, players: data.players.filter(p => p.id !== id) });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Players</h2>
        <div className="flex gap-2">
          <Button onClick={handleRecalculate} size="sm" variant="outline" className="gap-2">Recalculate Points</Button>
          <Button onClick={handleAdd} size="sm" className="gap-2"><Plus className="w-4 h-4"/> Add Player</Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-white text-gray-600">
            <tr>
              <th className="px-4 py-3">Nickname / Skin</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Tourney Pts</th>
              <th className="px-4 py-3">ELO</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Badge</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.players.map(player => (
              <tr key={player.id} className="border-b border-gray-200">
                {editingId === player.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input className="bg-gray-50 border border-gray-300 rounded px-2 py-1 w-full mb-1" placeholder="Nickname" value={editForm.nickname || ''} onChange={e => setEditForm({...editForm, nickname: e.target.value})} />
                      <input className="bg-gray-50 border border-gray-300 rounded px-2 py-1 w-full text-xs text-gray-600" placeholder="Skin Nickname (optional)" value={editForm.skinNickname || ''} onChange={e => setEditForm({...editForm, skinNickname: e.target.value})} />
                    </td>
                    <td className="px-4 py-2 text-gray-500 text-xs text-center">Auto</td>
                    <td className="px-4 py-2"><input type="number" className="bg-gray-50 border border-gray-300 rounded px-2 py-1 w-20" value={editForm.tournamentPoints || 0} onChange={e => setEditForm({...editForm, tournamentPoints: parseInt(e.target.value)})} /></td>
                    <td className="px-4 py-2"><input type="number" className="bg-gray-50 border border-gray-300 rounded px-2 py-1 w-20" value={editForm.elo || 0} onChange={e => setEditForm({...editForm, elo: parseInt(e.target.value)})} /></td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-1">
                        {data.tiers.map(t => (
                          <div key={t.id} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-12 truncate">{t.name}</span>
                            <input 
                              className="bg-gray-50 border border-gray-300 rounded px-2 py-1 w-16 text-xs" 
                              placeholder="Tier" 
                              value={t.id === 'overall' ? editForm.tier || '' : editForm.tierScores?.[t.id] || ''} 
                              onChange={e => {
                                if (t.id === 'overall') {
                                  setEditForm({...editForm, tier: e.target.value});
                                } else {
                                  setEditForm({...editForm, tierScores: {...(editForm.tierScores || {}), [t.id]: e.target.value}});
                                }
                              }} 
                            />
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2"><input className="bg-gray-50 border border-gray-300 rounded px-2 py-1 w-20" value={editForm.badge || ''} onChange={e => setEditForm({...editForm, badge: e.target.value})} /></td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={handleSave} className="text-emerald-500 hover:text-emerald-400"><Check className="w-4 h-4"/></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-400"><X className="w-4 h-4"/></Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">
                      <div className="font-medium">{player.nickname}</div>
                      {player.badge && <div className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded inline-block mt-1">{player.badge}</div>}
                    </td>
                    <td className="px-4 py-3">{player.points}</td>
                    <td className="px-4 py-3">{player.tournamentPoints || 0}</td>
                    <td className="px-4 py-3">{player.elo}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {data.tiers.map(t => {
                          const val = t.id === 'overall' ? player.tier : player.tierScores?.[t.id];
                          if (!val) return null;
                          return (
                            <div key={t.id} className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500 w-12 truncate">{t.name}:</span>
                              <span className="font-medium">{val}</span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">{player.badge}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(player.id); setEditForm(player); }}><Edit2 className="w-4 h-4"/></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(player.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4"/></Button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TournamentsAdmin: React.FC<{ data: RatingData, setData: (d: RatingData) => void }> = ({ data, setData }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Tournament>>({});

  const handleAdd = () => {
    const newTournament: Tournament = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Tournament',
      date: new Date().toISOString().split('T')[0],
      places: { 1: '', 2: '', 3: '' }
    };
    setData({ ...data, tournaments: [...data.tournaments, newTournament] });
    setEditingId(newTournament.id);
    setEditForm(newTournament);
  };

  const handleSave = () => {
    if (!editingId) return;
    setData({
      ...data,
      tournaments: data.tournaments.map(t => t.id === editingId ? { ...t, ...editForm } as Tournament : t)
    });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) {
      setData({ ...data, tournaments: data.tournaments.filter(t => t.id !== id) });
    }
  };

  const handleApplyPoints = (tournament: Tournament) => {
    if (confirm(`Apply points for ${tournament.name}? This will add points to the winners based on settings.`)) {
      const coeffs = data.settings.tournamentCoefficients;
      const updatedPlayers = data.players.map(p => {
        let addedPoints = 0;
        if (p.id === tournament.places[1]) addedPoints = coeffs[1] || 0;
        if (p.id === tournament.places[2]) addedPoints = coeffs[2] || 0;
        if (p.id === tournament.places[3]) addedPoints = coeffs[3] || 0;
        
        if (addedPoints > 0) {
          const newTourneyPts = (p.tournamentPoints || 0) + addedPoints;
          const newTotalPts = p.points + addedPoints;
          return {
            ...p,
            tournamentPoints: newTourneyPts,
            points: newTotalPts,
            history: [
              ...p.history,
              { date: new Date().toISOString().split('T')[0], points: newTotalPts, elo: p.elo, position: 0 }
            ]
          };
        }
        return p;
      });
      setData({ ...data, players: updatedPlayers });
      alert('Points applied successfully!');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tournaments</h2>
        <Button onClick={handleAdd} size="sm" className="gap-2"><Plus className="w-4 h-4"/> Add Tournament</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-white text-gray-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Short Name</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">1st Place</th>
              <th className="px-4 py-3">2nd Place</th>
              <th className="px-4 py-3">3rd Place</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.tournaments.map(tournament => (
              <tr key={tournament.id} className="border-b border-gray-200">
                {editingId === tournament.id ? (
                  <>
                    <td className="px-4 py-2"><input className="bg-gray-50 border border-gray-300 rounded px-2 py-1 w-full" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                    <td className="px-4 py-2"><input className="bg-gray-50 border border-gray-300 rounded px-2 py-1 w-24" placeholder="e.g. S1" value={editForm.shortName || ''} onChange={e => setEditForm({...editForm, shortName: e.target.value})} /></td>
                    <td className="px-4 py-2"><input type="date" className="bg-gray-50 border border-gray-300 rounded px-2 py-1 w-32" value={editForm.date || ''} onChange={e => setEditForm({...editForm, date: e.target.value})} /></td>
                    <td className="px-4 py-2">
                      <select className="bg-gray-50 border border-gray-300 rounded px-2 py-1 w-32" value={editForm.places?.[1] || ''} onChange={e => setEditForm({...editForm, places: { ...editForm.places!, 1: e.target.value }})}>
                        <option value="">Select...</option>
                        {data.players.map(p => <option key={p.id} value={p.id}>{p.nickname}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select className="bg-gray-50 border border-gray-300 rounded px-2 py-1 w-32" value={editForm.places?.[2] || ''} onChange={e => setEditForm({...editForm, places: { ...editForm.places!, 2: e.target.value }})}>
                        <option value="">Select...</option>
                        {data.players.map(p => <option key={p.id} value={p.id}>{p.nickname}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select className="bg-gray-50 border border-gray-300 rounded px-2 py-1 w-32" value={editForm.places?.[3] || ''} onChange={e => setEditForm({...editForm, places: { ...editForm.places!, 3: e.target.value }})}>
                        <option value="">Select...</option>
                        {data.players.map(p => <option key={p.id} value={p.id}>{p.nickname}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={handleSave} className="text-emerald-500 hover:text-emerald-400"><Check className="w-4 h-4"/></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-400"><X className="w-4 h-4"/></Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium">{tournament.name}</td>
                    <td className="px-4 py-3 text-gray-500">{tournament.shortName}</td>
                    <td className="px-4 py-3">{tournament.date}</td>
                    <td className="px-4 py-3">{data.players.find(p => p.id === tournament.places[1])?.nickname || tournament.places[1]}</td>
                    <td className="px-4 py-3">{data.players.find(p => p.id === tournament.places[2])?.nickname || tournament.places[2]}</td>
                    <td className="px-4 py-3">{data.players.find(p => p.id === tournament.places[3])?.nickname || tournament.places[3]}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleApplyPoints(tournament)} className="text-xs mr-2">Apply Pts</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(tournament.id); setEditForm(tournament); }}><Edit2 className="w-4 h-4"/></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(tournament.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4"/></Button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TiersAdmin: React.FC<{ data: RatingData, setData: (d: RatingData) => void }> = ({ data, setData }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Tier>>({});

  const handleAdd = () => {
    const newTier: Tier = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Tier List'
    };
    setData({ ...data, tiers: [...data.tiers, newTier] });
    setEditingId(newTier.id);
    setEditForm(newTier);
  };

  const handleSave = () => {
    if (!editingId) return;
    setData({
      ...data,
      tiers: data.tiers.map(t => t.id === editingId ? { ...t, ...editForm } as Tier : t)
    });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (id === 'overall') {
      alert('Cannot delete overall tier');
      return;
    }
    if (confirm('Are you sure?')) {
      setData({ ...data, tiers: data.tiers.filter(t => t.id !== id) });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tiers Lists</h2>
        <Button onClick={handleAdd} size="sm" className="gap-2"><Plus className="w-4 h-4"/> Add Tier List</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-white text-gray-600">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Icon</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.tiers.map(tier => (
              <tr key={tier.id} className="border-b border-gray-200">
                {editingId === tier.id ? (
                  <>
                    <td className="px-4 py-2"><input className="bg-gray-50 border border-gray-300 rounded px-2 py-1 w-full" value={editForm.id || ''} onChange={e => setEditForm({...editForm, id: e.target.value})} disabled={tier.id === 'overall'} /></td>
                    <td className="px-4 py-2"><input className="bg-gray-50 border border-gray-300 rounded px-2 py-1 w-full" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                    <td className="px-4 py-2"><input className="bg-gray-50 border border-gray-300 rounded px-2 py-1 w-16" placeholder="e.g. 🪓" value={editForm.icon || ''} onChange={e => setEditForm({...editForm, icon: e.target.value})} /></td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={handleSave} className="text-emerald-500 hover:text-emerald-400"><Check className="w-4 h-4"/></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-400"><X className="w-4 h-4"/></Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-mono text-gray-500">{tier.id}</td>
                    <td className="px-4 py-3 font-medium">{tier.name}</td>
                    <td className="px-4 py-3 text-xl">{tier.icon}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(tier.id); setEditForm(tier); }}><Edit2 className="w-4 h-4"/></Button>
                      {tier.id !== 'overall' && (
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(tier.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4"/></Button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ArchivesAdmin: React.FC<{ data: RatingData, setData: (d: RatingData) => void }> = ({ data, setData }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ArchiveSnapshot>>({});
  const [newArchiveName, setNewArchiveName] = useState('');
  const [editingArchivePlayersId, setEditingArchivePlayersId] = useState<string | null>(null);

  const handleArchive = () => {
    if (!newArchiveName) return alert('Enter a name for the archive (e.g., Winter 2024)');
    if (confirm(`Archive current players state as "${newArchiveName}"?`)) {
      const today = new Date().toISOString().split('T')[0];
      const newArchive: ArchiveSnapshot = {
        id: Math.random().toString(36).substr(2, 9),
        name: newArchiveName,
        date: today,
        data: JSON.parse(JSON.stringify(data.players))
      };
      
      const updatedData = {
        ...data,
        archives: [...(data.archives || []), newArchive]
      };
      
      setData(updatedData);
      setNewArchiveName('');
      alert('Archive created successfully! Remember to "Save Changes" to apply it to the site.');
    }
  };

  const handleSave = () => {
    if (!editingId) return;
    setData({
      ...data,
      archives: (data.archives || []).map(a => a.id === editingId ? { ...a, ...editForm } as ArchiveSnapshot : a)
    });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this archive?')) {
      setData({ ...data, archives: (data.archives || []).filter(a => a.id !== id) });
    }
  };

  if (editingArchivePlayersId) {
    const archive = data.archives?.find(a => a.id === editingArchivePlayersId);
    if (!archive) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" onClick={() => setEditingArchivePlayersId(null)}>← Back to Archives</Button>
          <h3 className="text-lg font-medium">Editing Players in: {archive.name || archive.date}</h3>
        </div>
        <PlayersAdmin 
          data={{ ...data, players: archive.data }} 
          setData={(newData) => {
            setData({
              ...data,
              archives: (data.archives || []).map(a => a.id === editingArchivePlayersId ? { ...a, data: newData.players } : a)
            });
          }} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
        <h3 className="font-medium">Create New Archive (Season Snapshot)</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Season Name (e.g., Winter 2024)</label>
            <input 
              className="w-full bg-white border border-gray-200 rounded px-3 py-2" 
              value={newArchiveName} 
              onChange={e => setNewArchiveName(e.target.value)} 
              placeholder="Winter 2024"
            />
          </div>
          <Button onClick={handleArchive} className="gap-2"><Plus className="w-4 h-4"/> Snapshot Current State</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-white text-gray-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Players Count</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data.archives || []).map(archive => (
              <tr key={archive.id} className="border-b border-gray-200">
                {editingId === archive.id ? (
                  <>
                    <td className="px-4 py-2"><input className="bg-gray-50 border border-gray-300 rounded px-2 py-1 w-full" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                    <td className="px-4 py-2"><input type="date" className="bg-gray-50 border border-gray-300 rounded px-2 py-1 w-32" value={editForm.date || ''} onChange={e => setEditForm({...editForm, date: e.target.value})} /></td>
                    <td className="px-4 py-2 text-gray-500">{archive.data.length}</td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={handleSave} className="text-emerald-500 hover:text-emerald-400"><Check className="w-4 h-4"/></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-400"><X className="w-4 h-4"/></Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium">{archive.name || 'Legacy Archive'}</td>
                    <td className="px-4 py-3 text-gray-500">{archive.date}</td>
                    <td className="px-4 py-3 text-gray-500">{archive.data.length}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingArchivePlayersId(archive.id)} className="text-xs mr-2">Edit Players</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(archive.id); setEditForm(archive); }}><Edit2 className="w-4 h-4"/></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(archive.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4"/></Button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {(!data.archives || data.archives.length === 0) && (
              <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-500">No archives found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SettingsAdmin: React.FC<{ data: RatingData, setData: (d: RatingData) => void }> = ({ data, setData }) => {
  const [settings, setSettings] = useState(data.settings);

  const handleSave = () => {
    setData({ ...data, settings });
    alert('Settings updated locally. Click Save & Export to persist.');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Site Name</label>
          <input 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2"
            value={settings.siteName}
            onChange={e => setSettings({...settings, siteName: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
          <textarea 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 h-24"
            value={settings.description}
            onChange={e => setSettings({...settings, description: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Tier Values (Points per tier)</label>
          <input 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-mono text-sm"
            placeholder="S:10, A:8, B:6, C:4, D:2"
            value={Object.entries(settings.tierValues || {}).map(([k,v]) => `${k}:${v}`).join(', ')}
            onChange={e => {
              const vals: Record<string, number> = {};
              e.target.value.split(',').forEach(pair => {
                const [k, v] = pair.split(':').map(s => s.trim());
                if (k && !isNaN(Number(v))) vals[k] = Number(v);
              });
              setSettings({...settings, tierValues: vals});
            }}
          />
        </div>
      </div>
      <div className="flex gap-4">
        <Button onClick={handleSave}>Update Settings</Button>
      </div>
    </div>
  );
};
