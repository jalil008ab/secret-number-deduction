import React, { useState } from 'react';
import { Calendar, DollarSign, ArrowRight, Sparkles, HelpCircle, ShieldCheck, Tag, Users, Smartphone, Wifi } from 'lucide-react';
import { sound } from '../utils/sound';

export default function ModeSelection({ onSelectMode }) {
  const [playType, setPlayType] = useState('ONLINE'); // 'LOCAL' | 'ONLINE'
  const [customMin, setCustomMin] = useState(1);
  const [customMax, setCustomMax] = useState(500);
  const [priceItemName, setPriceItemName] = useState('');

  const handleSelectAgeMode = () => {
    sound.click();
    onSelectMode({
      id: 'AGE',
      playType, // 'LOCAL' or 'ONLINE'
      title: 'Yoshni topish',
      description: 'Player 1 yashirin yoshni kiritadi (0 - 100). Player 2 mantiqiy savollar berib topishi kerak.',
      unit: 'yosh',
      prefix: '',
      min: 0,
      max: 100,
      placeholder: 'masalan: 24',
      suggestedQuestions: [
        'Yoshi 30 dan kattami?',
        'Mashina haydash huquqi bormi?',
        'Juft sonmi?',
        'Pensiya yoshidami (65+)?',
        '20 yoshlar oralig\'idami?',
        '21-asrda tug\'ilganmi?'
      ]
    });
  };

  const handleSelectPriceMode = () => {
    sound.click();
    const minVal = Number(customMin) || 1;
    const maxVal = Number(customMax) || 1000;
    const itemPrompt = priceItemName.trim() ? priceItemName.trim() : 'Sirli buyum';

    onSelectMode({
      id: 'PRICE',
      playType, // 'LOCAL' or 'ONLINE'
      title: 'Narxni topish',
      description: `Player 1 narx oralig'ini ($${minVal} - $${maxVal}) kiritadi. Player 2 narxni aniqlash uchun savol beradi.`,
      unit: '',
      prefix: '$',
      min: Math.min(minVal, maxVal - 1),
      max: Math.max(minVal + 1, maxVal),
      itemName: itemPrompt,
      placeholder: `masalan: 150`,
      suggestedQuestions: [
        `Narxi $${Math.round((minVal + maxVal) / 2)} dan arzonmi?`,
        'Oddiy do\'konda sotiladimi?',
        'Narxi 10 ga bo\'linadimi?',
        'Narxi $500 dan pastmi?',
        'Smartfon narxidan qimmatmi?',
        'Narxi toq sonmi?'
      ]
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      
      {/* Title & Play Type Switcher */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> O'yin Rejimini Tanlang
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Sirli Sonni Topish O'yini
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Player 1 sirli sonni o'ylaydi. Player 2 mantiqiy "Ha/Yo'q" savollari berib sirli sonni topishi kerak!
        </p>

        {/* Play Method Switcher (Onlayn do'st bilan vs Bitta qurilmada) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 max-w-md mx-auto">
          <button
            onClick={() => {
              setPlayType('ONLINE');
              sound.click();
            }}
            className={`py-3 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
              playType === 'ONLINE'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>Do'st Bilan Onlayn</span>
          </button>
          <button
            onClick={() => {
              setPlayType('LOCAL');
              sound.click();
            }}
            className={`py-3 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
              playType === 'LOCAL'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Bitta Qurilmada</span>
          </button>
        </div>
      </div>

      {/* Mode Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* CARD 1: YOSHNI TOPISH */}
        <div className="group relative rounded-3xl p-1 bg-gradient-to-b from-cyan-500/30 via-slate-800/50 to-slate-900/80 transition-all duration-300 hover:from-cyan-400/50 hover:to-indigo-600/40 hover:-translate-y-1">
          <div className="h-full rounded-[22px] bg-slate-950/90 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300">
                  <Calendar className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-cyan-300">
                  Oraliq: 0 - 100
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Yoshni Topish
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Player 1 sirli yoshni (0 dan 100 gacha) tanlaydi. Player 2 yoshga oid mantiqiy savollar beradi!
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-900">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Aniq oraliq: 0 dan 100 yoshgacha</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Tayyor mantiqiy yosh savollari</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSelectAgeMode}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 active:scale-[0.99] transition-all duration-200"
            >
              <span>"Yoshni Topish" Rejimi</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

          </div>
        </div>

        {/* CARD 2: NARXNI TOPISH */}
        <div className="group relative rounded-3xl p-1 bg-gradient-to-b from-indigo-500/30 via-slate-800/50 to-slate-900/80 transition-all duration-300 hover:from-indigo-400/50 hover:to-purple-600/40 hover:-translate-y-1">
          <div className="h-full rounded-[22px] bg-slate-950/90 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                  <DollarSign className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-indigo-300">
                  Erkin Oraliq
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Narxni Topish
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Istalgan narx oralig'ini va sirli buyum nomini (masalan: "PlayStation 5", "Krossovka") kiriting.
                </p>
              </div>

              <div className="space-y-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Buyum Nomi (Ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    placeholder="masalan: Noutbuk, Telefon..."
                    value={priceItemName}
                    onChange={(e) => setPriceItemName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-slate-400">Min Narx ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={customMin}
                      onChange={(e) => setCustomMin(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-slate-400">Max Narx ($)</label>
                    <input
                      type="number"
                      min="1"
                      value={customMax}
                      onChange={(e) => setCustomMax(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

            </div>

            <button
              onClick={handleSelectPriceMode}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110 active:scale-[0.99] transition-all duration-200"
            >
              <span>"Narxni Topish" Rejimi</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

          </div>
        </div>

      </div>

      {/* Rules Footer */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800/80 flex items-start gap-3 text-slate-400 text-xs leading-relaxed max-w-2xl mx-auto">
        <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200">O'yin qoidasi:</strong> Player 1 sirli sonni berkitadi. Player 2 savol beradi. Player 1 faqat "Ha" yoki "Yo'q" deb javob beradi. Player 2 xohlagan vaqtda aniq sonni taxmin qilib ko'rishi mumkin!
        </div>
      </div>
    </div>
  );
}
