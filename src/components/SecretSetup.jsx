import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, UserCheck, KeyRound, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

export default function SecretSetup({ mode, isOnline, isHost, p1Secret, p2Secret, onDualSecretSet, onBack }) {
  // Local Mode steps: 'P1_INPUT' | 'PASS_TO_P2' | 'P2_INPUT'
  const [localStep, setLocalStep] = useState('P1_INPUT');
  const [p1Value, setP1Value] = useState('');
  const [currentInputValue, setCurrentInputValue] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Determine if MY secret is submitted in Online mode:
  // If Host -> check p1Secret !== null
  // If Guest -> check p2Secret !== null
  const mySecret = isHost ? p1Secret : p2Secret;
  const opponentSecret = isHost ? p2Secret : p1Secret;
  const isMySecretSubmitted = mySecret !== null;
  const isOpponentSecretSubmitted = opponentSecret !== null;

  // Local Mode: P1 locks secret
  const handleLocalP1Submit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (currentInputValue === '' || isNaN(currentInputValue)) {
      setErrorMsg('Iltimos, to\'g\'ri son kiriting.');
      return;
    }

    const num = Number(currentInputValue);
    if (num < mode.min || num > mode.max) {
      setErrorMsg(`Son ${mode.prefix}${mode.min} va ${mode.prefix}${mode.max} oralig'ida bo'lishi kerak.`);
      return;
    }

    sound.click();
    setP1Value(num);
    setCurrentInputValue('');
    setShowSecret(false);
    setLocalStep('PASS_TO_P2');
  };

  // Local Mode: P2 locks secret & start game
  const handleLocalP2Submit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (currentInputValue === '' || isNaN(currentInputValue)) {
      setErrorMsg('Iltimos, to\'g\'ri son kiriting.');
      return;
    }

    const num = Number(currentInputValue);
    if (num < mode.min || num > mode.max) {
      setErrorMsg(`Son ${mode.prefix}${mode.min} va ${mode.prefix}${mode.max} oralig'ida bo'lishi kerak.`);
      return;
    }

    sound.click();
    const finalP2 = num;
    onDualSecretSet(p1Value, finalP2);
  };

  // Online Mode: Current user submits their secret
  const handleOnlineSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (currentInputValue === '' || isNaN(currentInputValue)) {
      setErrorMsg('Iltimos, to\'g\'ri son kiriting.');
      return;
    }

    const num = Number(currentInputValue);
    if (num < mode.min || num > mode.max) {
      setErrorMsg(`Son ${mode.prefix}${mode.min} va ${mode.prefix}${mode.max} oralig'ida bo'lishi kerak.`);
      return;
    }

    sound.click();
    onDualSecretSet(num);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      
      {/* ONLINE MODE: REAL-TIME TWO-SIDED SECRET SETUP */}
      {isOnline ? (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

          {/* ONLINE STATUS HEADER */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              {isHost ? (
                isMySecretSubmitted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              ) : (
                isOpponentSecretSubmitted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              )}
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Player 1 Soni</span>
                <span className="font-semibold text-white">
                  {p1Secret !== null ? 'Saqlandi ✅' : 'Kiritilmoqda...'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isHost ? (
                isMySecretSubmitted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              ) : (
                isOpponentSecretSubmitted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              )}
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Player 2 Soni</span>
                <span className="font-semibold text-white">
                  {p2Secret !== null ? 'Saqlandi ✅' : 'Kiritilmoqda...'}
                </span>
              </div>
            </div>
          </div>

          {!isMySecretSubmitted ? (
            <>
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-cyan-400 text-xs font-semibold">
                  <UserCheck className="w-3.5 h-3.5" /> {isHost ? "Player 1 (Siz)" : "Player 2 (Siz)"}
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  O'z Sirli Soningizni Kiriting
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Do'stingiz bu sonni bilmaydi! Oraliq: <strong className="text-cyan-300">{mode.prefix}{mode.min} - {mode.prefix}{mode.max} {mode.unit}</strong>
                </p>
              </div>

              <form onSubmit={handleOnlineSubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-lg">
                      {mode.prefix ? mode.prefix : '#'}
                    </div>
                    <input
                      type={showSecret ? 'number' : 'password'}
                      min={mode.min}
                      max={mode.max}
                      placeholder={mode.placeholder}
                      value={currentInputValue}
                      onChange={(e) => setCurrentInputValue(e.target.value)}
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

                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 hover:brightness-110 active:scale-[0.99] transition-all"
                >
                  <span>Sirli Sonimni Saqlash</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 py-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">Sizning Sirli Soningiz Saqlandi!</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Do'stingiz ham o'z sirli sonini kiritishi kutilmoqda. Do'stingiz kiritgach, o'yin avtomatik boshlanadi!
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-cyan-300 font-semibold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Do'stingiz kiritishi kutilmoqda...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* LOCAL PASS-AND-PLAY MODE FOR BOTH PLAYERS */
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

          {/* VISUAL STEP INDICATOR */}
          <div className="flex items-center justify-center gap-4 border-b border-slate-800/80 pb-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
              localStep === 'P1_INPUT' ? 'bg-cyan-950/90 border-cyan-500/50 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-black">1</span>
              <span>Player 1 Son Kiritishi</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
              localStep === 'P2_INPUT' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black">2</span>
              <span>Player 2 Son Kiritishi</span>
            </div>
          </div>

          {localStep === 'P1_INPUT' && (
            <>
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-cyan-400 text-xs font-semibold">
                  <UserCheck className="w-3.5 h-3.5" /> 1-Bosqich: Player 1 Soni
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Player 1: O'z Sirli Soningizni Kiriting
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Player 2 qaramasligini ta'minlang! Oraliq: <strong className="text-cyan-300">{mode.prefix}{mode.min} - {mode.prefix}{mode.max} {mode.unit}</strong>
                </p>
              </div>

              <form onSubmit={handleLocalP1Submit} className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-lg">
                      {mode.prefix ? mode.prefix : '#'}
                    </div>
                    <input
                      type={showSecret ? 'number' : 'password'}
                      min={mode.min}
                      max={mode.max}
                      placeholder={mode.placeholder}
                      value={currentInputValue}
                      onChange={(e) => setCurrentInputValue(e.target.value)}
                      className="w-full pl-10 pr-12 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-xl sm:text-2xl font-bold focus:outline-none focus:border-cyan-500 transition-all"
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
                    className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all"
                  >
                    <span>1-Sonni Saqlash & Player 2 ga Berish</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          )}

          {localStep === 'PASS_TO_P2' && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10 animate-float">
                <KeyRound className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-white">Player 1 Soni Saqlandi! 🔒</h3>
                <p className="text-slate-300 text-sm">
                  Iltimos, telefonni <strong className="text-emerald-400">Player 2</strong> ga bering. Player 2 ham o'zi o'ylagan sirli sonini kiritishi kerak!
                </p>
              </div>
              <button
                onClick={() => setLocalStep('P2_INPUT')}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 hover:brightness-110 transition-all"
              >
                <span>Men Player 2 man – 2-Sirli Sonni Kiritaman!</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {localStep === 'P2_INPUT' && (
            <>
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/50 text-emerald-400 text-xs font-semibold">
                  <UserCheck className="w-3.5 h-3.5" /> 2-Bosqich: Player 2 Soni
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Player 2: O'z Sirli Soningizni Kiriting
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Player 1 qaramasligini ta'minlang! Oraliq: <strong className="text-cyan-300">{mode.prefix}{mode.min} - {mode.prefix}{mode.max} {mode.unit}</strong>
                </p>
              </div>

              <form onSubmit={handleLocalP2Submit} className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-lg">
                      {mode.prefix ? mode.prefix : '#'}
                    </div>
                    <input
                      type={showSecret ? 'number' : 'password'}
                      min={mode.min}
                      max={mode.max}
                      placeholder={mode.placeholder}
                      value={currentInputValue}
                      onChange={(e) => setCurrentInputValue(e.target.value)}
                      className="w-full pl-10 pr-12 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-xl sm:text-2xl font-bold focus:outline-none focus:border-cyan-500 transition-all"
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

                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 hover:brightness-110 transition-all"
                >
                  <span>2-Sonni Saqlash & O'yinni Boshlash</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </>
          )}

        </div>
      )}

    </div>
  );
}
