import React, { useState } from 'react';
import { Users, Copy, Check, ArrowRight, Loader2, Wifi, ShieldCheck, AlertCircle } from 'lucide-react';
import { peerManager } from '../utils/peer';
import { sound } from '../utils/sound';

export default function RoomConnect({ mode, onConnectedAsHost, onConnectedAsGuest, onBack }) {
  const [tab, setTab] = useState('CREATE'); // 'CREATE' | 'JOIN'
  const [roomCode, setRoomCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isWaitingForPeer, setIsWaitingForPeer] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate and create online room (Host / Player 1)
  const handleCreateRoom = () => {
    sound.click();
    setIsCreating(true);
    setErrorMsg('');

    const newCode = peerManager.generateRoomCode();
    setRoomCode(newCode);

    peerManager.createRoom(
      newCode,
      (code) => {
        setIsCreating(false);
        setIsWaitingForPeer(true);

        // Listen for guest connection
        peerManager.onConnect(() => {
          sound.answerYes();
          onConnectedAsHost(code);
        });
      },
      (err) => {
        setIsCreating(false);
        setErrorMsg(err || 'Xona yaratishda xatolik yuz berdi. Qayta urinib ko\'ring.');
      }
    );
  };

  // Join online room (Guest / Player 2)
  const handleJoinRoom = (e) => {
    e.preventDefault();
    const code = joinCodeInput.trim();
    if (!code) {
      setErrorMsg('Xona kodini kiriting!');
      return;
    }

    sound.click();
    setIsJoining(true);
    setErrorMsg('');

    peerManager.joinRoom(
      code,
      () => {
        setIsJoining(false);
        sound.answerYes();
        onConnectedAsGuest(code);
      },
      (err) => {
        setIsJoining(false);
        setErrorMsg(err || 'Xonaga ulanib bo\'lmadi. Kodni qayta tekshiring.');
      }
    );
  };

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    sound.click();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-cyan-400 text-xs font-semibold">
            <Wifi className="w-3.5 h-3.5 animate-pulse" /> Onlayn 2-O'yinchi Rejimi
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Do'st Bilan Onlayn Ulanish
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Biringiz xona yarating va kodni do'stingizga yuboring!
          </p>
        </div>

        {/* Tabs: Create / Join */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => {
              setTab('CREATE');
              setErrorMsg('');
            }}
            className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
              tab === 'CREATE'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Xona Yaratish (1-O'yinchi)
          </button>
          <button
            onClick={() => {
              setTab('JOIN');
              setErrorMsg('');
            }}
            className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
              tab === 'JOIN'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Xonaga Ulanish (2-O'yinchi)
          </button>
        </div>

        {/* TAB 1: CREATE ROOM */}
        {tab === 'CREATE' && (
          <div className="space-y-6 text-center">
            {!isWaitingForPeer ? (
              <div className="space-y-4 pt-2">
                <p className="text-slate-300 text-xs leading-relaxed">
                  Siz <strong>Player 1 (Sir saqlovchi)</strong> bo'lasiz. Xona yarating va kodni do'stingizga yetkazing.
                </p>
                <button
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Xona yaratilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5" />
                      <span>Xona Kodi Olish</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* WAITING FOR GUEST SCREEN */
              <div className="space-y-6 pt-2 animate-fade-in">
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3 glow-cyan">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Xona Kodi (Do'stingizga yuboring)</span>
                  <div className="text-4xl sm:text-5xl font-black text-cyan-400 font-mono tracking-widest">
                    {roomCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-bold hover:bg-cyan-900/80 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Nusxalandi!' : 'Kodni nusxalash'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3 text-sm text-cyan-300 font-semibold animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                  <span>Do'stingiz ulanishi kutilmoqda...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: JOIN ROOM */}
        {tab === 'JOIN' && (
          <form onSubmit={handleJoinRoom} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Xona Kodini Kiriting
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="masalan: 7492"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="w-full text-center py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-2xl font-bold tracking-widest placeholder:text-slate-700 focus:outline-none focus:border-cyan-500 transition-all"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isJoining || !joinCodeInput.trim()}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Xonaga ulanilmoqda...</span>
                </>
              ) : (
                <>
                  <span>Xonaga Ulanish</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-950/40 border border-rose-900/60 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold hover:text-white transition-colors"
        >
          Orqaga qaytish
        </button>

      </div>
    </div>
  );
}
