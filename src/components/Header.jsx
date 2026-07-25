import React from 'react';
import { Volume2, VolumeX, RotateCcw, Sparkles, Wifi } from 'lucide-react';
import { sound } from '../utils/sound';

export default function Header({ mode, soundMuted, onToggleSound, onResetGame, currentStep, isOnline, roomCode }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse-subtle" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400 bg-clip-text text-transparent">
                SirliDeduct
              </h1>
              {isOnline ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-emerald-950/80 border border-emerald-800/50 text-emerald-400 rounded-full">
                  <Wifi className="w-3 h-3 animate-pulse" /> Xona: {roomCode}
                </span>
              ) : (
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-cyan-950/80 border border-cyan-800/50 text-cyan-400 rounded-full">
                  2-O'yinchi
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {mode ? mode.title : "Mantiqiy savol-javob o'yini"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sound.click();
            }}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-slate-700 transition-all duration-200 focus:outline-none"
            title={soundMuted ? 'Ovozni yoqish' : 'Ovozni o\'chirish'}
            aria-label="Ovoz sozlamasi"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Reset / Home */}
          {currentStep !== 'MODE_SELECT' && (
            <button
              onClick={() => {
                sound.click();
                if (window.confirm('O\'yinni qayta boshlashga ishonchingiz komilmi?')) {
                  onResetGame();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-rose-400 hover:border-rose-950 transition-all duration-200"
              title="Qayta boshlash"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Boshiga</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
