import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, HelpCircle, Target, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';

export default function VictoryScreen({ mode, secretValue, winStats, onPlayAgain, onChooseNewMode }) {
  useEffect(() => {
    const count = 200;
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
          Player 2 G'olib!
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          G'olib Bo'ldingiz! 🎉
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Player 2 sirli sonni to'g'ri topib g'alaba qozondi!
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-cyan-500/30 space-y-2 glow-cyan">
        <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Sirli Son Nima Edi?</span>
        <div className="text-4xl sm:text-5xl font-black text-cyan-400 font-mono">
          {mode.prefix}{secretValue} {mode.unit}
        </div>
        {mode.itemName && (
          <p className="text-xs text-slate-300 font-medium pt-1">
            Buyum: <strong className="text-white">{mode.itemName}</strong>
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" /> Berilgan Savollar
          </div>
          <div className="text-2xl font-black text-white">
            {winStats?.questionCount || 0} ta
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <Target className="w-4 h-4" /> Urinishlar Soni
          </div>
          <div className="text-2xl font-black text-white">
            {winStats?.guessCount || 1} ta
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
