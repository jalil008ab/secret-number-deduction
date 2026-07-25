import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Target, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';

export default function VictoryScreen({ mode, winStats, onPlayAgain, onChooseNewMode }) {
  const winner = winStats?.winner || 'P1';
  const p1Secret = winStats?.p1Secret;
  const p2Secret = winStats?.p2Secret;

  useEffect(() => {
    const count = 250;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 space-y-8 text-center animate-fade-in">
      
      <div className="relative inline-block">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 p-[2px] shadow-2xl shadow-amber-500/30 animate-bounce">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-amber-400">
            <Trophy className="w-12 h-12" />
          </div>
        </div>
        <div className="absolute -bottom-2 right-0 left-0 mx-auto w-max px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-lg">
          {winner === 'P1' ? 'Player 1 G\'olib!' : 'Player 2 G\'olib!'}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {winner === 'P1' ? 'Player 1 G\'alaba Qozondi! 🎉' : 'Player 2 G\'alaba Qozondi! 🎉'}
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          {winner === 'P1' ? 'Player 1 Player 2 ning sirli sonini birinchi bo\'lib topdi!' : 'Player 2 Player 1 ning sirli sonini birinchi bo\'lib topdi!'}
        </p>
      </div>

      {/* BOTH SECRETS REVEAL BOX */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-3xl p-5 border border-cyan-500/30 space-y-1 glow-cyan">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Player 1 Siri</span>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
            {mode.prefix}{p1Secret} {mode.unit}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-indigo-500/30 space-y-1 glow-purple">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Player 2 Siri</span>
          <div className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">
            {mode.prefix}{p2Secret} {mode.unit}
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <button
          onClick={() => {
            sound.click();
            onPlayAgain();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 hover:brightness-110 active:scale-[0.99] transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Qayta O'ynash (Shu Rejimda)</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            onChooseNewMode();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <span>Yangi Rejim Tanlash</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
