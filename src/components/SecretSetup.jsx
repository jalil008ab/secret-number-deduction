import React, { useState } from 'react';
import { Eye, EyeOff, Shield, ArrowRight, UserCheck, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

export default function SecretSetup({ mode, isOnline, isHost, onSecretSet, onBack }) {
  const [secretValue, setSecretValue] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If online mode and user is Player 2 (Guest), show waiting screen for Player 1
  if (isOnline && !isHost) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-pulse">
            <UserCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Player 1 Sirli Sonni Kiritmoqda...</h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              Player 1 sirli sonni belgilaganidan so'ng o'yin avtomatik boshlanadi!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleLockSecret = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (secretValue === '' || isNaN(secretValue)) {
      setErrorMsg('Iltimos, to\'g\'ri son kiritishingiz shart.');
      return;
    }

    const num = Number(secretValue);
    if (num < mode.min || num > mode.max) {
      setErrorMsg(`Son ${mode.prefix}${mode.min} va ${mode.prefix}${mode.max} oralig'ida bo'lishi kerak.`);
      return;
    }

    sound.click();
    if (isOnline) {
      // In online mode, lock and directly start for both players
      onSecretSet(num);
    } else {
      setIsLocked(true);
    }
  };

  const handleStartGame = () => {
    sound.click();
    onSecretSet(Number(secretValue));
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      
      {!isLocked ? (
        /* STEP 1: PLAYER 1 SIRLI SONNI KIRITADI */
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-cyan-400 text-xs font-semibold">
              <UserCheck className="w-3.5 h-3.5" /> Player 1 Bosqichi
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Sirli Sonni Belgilang
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Bu sonni Player 2 dan sir saqlang! Oraliq: <strong className="text-cyan-300">{mode.prefix}{mode.min} - {mode.prefix}{mode.max} {mode.unit}</strong>
              {mode.itemName && ` (${mode.itemName})`}
            </p>
          </div>

          <form onSubmit={handleLockSecret} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Sirli {mode.id === 'AGE' ? 'Yosh' : 'Narx'}</span>
                <span className="text-[11px] font-normal text-slate-400">Ko'rsatish/berkitish uchun ko'z tugmasini bosing</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-lg">
                  {mode.prefix ? mode.prefix : '#'}
                </div>
                <input
                  type={showSecret ? 'number' : 'password'}
                  min={mode.min}
                  max={mode.max}
                  placeholder={mode.placeholder}
                  value={secretValue}
                  onChange={(e) => setSecretValue(e.target.value)}
                  className="w-full pl-10 pr-12 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-xl sm:text-2xl font-bold placeholder:text-slate-700 focus:outline-none focus:border-cyan-500 transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 text-rose-400 text-xs mt-2 bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {!isOnline && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Tasdiqlash tugmasini bosishdan oldin Player 2 qaramayotganiga ishonch hosil qiling!</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-800 transition-colors"
              >
                Orqaga
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all active:scale-[0.99]"
              >
                <span>{isOnline ? 'Sirni Saqlash va Boshlash' : 'Saqlash va Qurilmani Berish'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>
      ) : (
        /* PRIVACY SHIELD CURTAIN FOR LOCAL PASS AND PLAY */
        <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6 text-center shadow-2xl animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10 animate-float">
            <KeyRound className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-white">
              Sirli Son Saqlandi! 🔒
            </h3>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Iltimos, telefonni <strong className="text-cyan-400">Player 2</strong> ga bering.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200/90 leading-relaxed max-w-md mx-auto">
            <Sparkles className="w-4 h-4 text-cyan-400 inline mr-1" />
            Player 2 mantiqiy savollar beradi. Player 1 esa "Ha" yoki "Yo'q" deb javob qaytaradi.
          </div>

          <button
            onClick={handleStartGame}
            className="w-full max-w-sm mx-auto py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 hover:brightness-110 transition-all active:scale-[0.99]"
          >
            <span>Men Player 2 man – Boshladik!</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

    </div>
  );
}
