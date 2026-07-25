import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Target, CheckCircle2, XCircle, User, AlertTriangle, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';
import { peerManager } from '../utils/peer';

export default function GameScreen({ mode, secretValue, isOnline, isHost, onWin }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'SYSTEM',
      type: 'SYSTEM',
      text: `O'yin Boshlandi! Sirli ${mode.title} ${mode.prefix}${mode.min} va ${mode.prefix}${mode.max} oralig'ida. Player 2, mantiqiy savolingizni bering!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [questionInput, setQuestionInput] = useState('');
  const [guessInput, setGuessInput] = useState('');
  const [pendingQuestionId, setPendingQuestionId] = useState(null);
  const [toastError, setToastError] = useState('');
  const [guessCount, setGuessCount] = useState(0);

  const chatEndRef = useRef(null);

  // My Player identity in Online mode
  const myPlayerRole = isOnline ? (isHost ? 'P1' : 'P2') : null;

  // Auto-scroll chat feed
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingQuestionId, toastError]);

  // PeerJS listener for online real-time synchronization
  useEffect(() => {
    if (!isOnline) return;

    const unsubscribe = peerManager.onData((data) => {
      if (data.type === 'ASK_QUESTION') {
        sound.questionSubmitted();
        const newQuestion = {
          id: data.id,
          sender: 'P2',
          type: 'QUESTION',
          text: data.text,
          timestamp: data.timestamp
        };
        setMessages((prev) => [...prev, newQuestion]);
        setPendingQuestionId(data.id);
      } else if (data.type === 'ANSWER_QUESTION') {
        if (data.answer === 'YES') sound.answerYes();
        else sound.answerNo();

        const ansMessage = {
          id: data.id,
          sender: 'P1',
          type: 'ANSWER',
          questionId: data.questionId,
          answer: data.answer,
          text: data.text,
          timestamp: data.timestamp
        };
        setMessages((prev) => [...prev, ansMessage]);
        setPendingQuestionId(null);
      } else if (data.type === 'MAKE_GUESS') {
        setGuessCount((prev) => prev + 1);

        if (data.val === secretValue) {
          sound.victory();
          onWin({
            guessCount: data.guessCount,
            questionCount: data.questionCount,
            messages: data.messages
          });
        } else {
          sound.wrongGuess();
          const wrongMsg = {
            id: data.id,
            sender: 'P2',
            type: 'GUESS',
            text: `Taxmin qilingan son: ${mode.prefix}${data.val} ${mode.unit}`,
            timestamp: data.timestamp
          };
          setMessages((prev) => [...prev, wrongMsg]);
          setToastError(`Noto'g'ri taxmin (${mode.prefix}${data.val})! Savol berishda davom eting.`);
          setTimeout(() => setToastError(''), 4000);
        }
      }
    });

    return () => unsubscribe();
  }, [isOnline, secretValue, mode, onWin]);

  // Player 2 asks a question
  const handleAskQuestion = (e) => {
    if (e) e.preventDefault();
    const query = questionInput.trim();
    if (!query) return;

    if (isOnline && myPlayerRole === 'P1') {
      setToastError('Siz Player 1 siz! Faqat Player 2 savol berishi mumkin.');
      setTimeout(() => setToastError(''), 3000);
      return;
    }

    if (pendingQuestionId !== null) {
      setToastError('Iltimos, Player 1 avvalgi savolga javob berishini kuting!');
      setTimeout(() => setToastError(''), 3000);
      return;
    }

    sound.questionSubmitted();
    const qId = Date.now();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newQuestion = {
      id: qId,
      sender: 'P2',
      type: 'QUESTION',
      text: query,
      timestamp
    };

    setMessages((prev) => [...prev, newQuestion]);
    setPendingQuestionId(qId);
    setQuestionInput('');
    setToastError('');

    if (isOnline) {
      peerManager.send({
        type: 'ASK_QUESTION',
        id: qId,
        text: query,
        timestamp
      });
    }
  };

  // Player 1 answers YES or NO
  const handleAnswerQuestion = (answerType) => {
    if (!pendingQuestionId) return;

    if (isOnline && myPlayerRole === 'P2') {
      setToastError('Siz Player 2 siz! Faqat Player 1 javob berishi mumkin.');
      setTimeout(() => setToastError(''), 3000);
      return;
    }

    if (answerType === 'YES') sound.answerYes();
    else sound.answerNo();

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const textStr = answerType === 'YES' ? 'Ha! ✅' : answerType === 'NO' ? 'Yo\'q! ❌' : 'Qisman / Noma\'lum ⚠️';

    const ansMessage = {
      id: Date.now(),
      sender: 'P1',
      type: 'ANSWER',
      questionId: pendingQuestionId,
      answer: answerType,
      text: textStr,
      timestamp
    };

    setMessages((prev) => [...prev, ansMessage]);
    setPendingQuestionId(null);

    if (isOnline) {
      peerManager.send({
        type: 'ANSWER_QUESTION',
        id: ansMessage.id,
        questionId: pendingQuestionId,
        answer: answerType,
        text: textStr,
        timestamp
      });
    }
  };

  // Player 2 numeric guess
  const handleMakeGuess = (e) => {
    e.preventDefault();
    if (!guessInput) return;

    if (isOnline && myPlayerRole === 'P1') {
      setToastError('Siz Player 1 siz! Faqat Player 2 sonni taxmin qilishi mumkin.');
      setTimeout(() => setToastError(''), 3000);
      return;
    }

    const val = Number(guessInput);
    if (isNaN(val)) return;

    const newGuessCount = guessCount + 1;
    setGuessCount(newGuessCount);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const questionCount = messages.filter((m) => m.type === 'QUESTION').length;

    if (val === secretValue) {
      sound.victory();
      const winObj = {
        guessCount: newGuessCount,
        questionCount,
        messages
      };

      if (isOnline) {
        peerManager.send({
          type: 'MAKE_GUESS',
          val,
          id: Date.now(),
          timestamp,
          guessCount: newGuessCount,
          questionCount,
          messages
        });
      }

      onWin(winObj);
    } else {
      sound.wrongGuess();
      const wrongMsg = {
        id: Date.now(),
        sender: 'P2',
        type: 'GUESS',
        text: `Taxmin qilingan son: ${mode.prefix}${val} ${mode.unit}`,
        timestamp
      };

      setMessages((prev) => [...prev, wrongMsg]);
      setToastError(`Noto'g'ri taxmin (${mode.prefix}${val})! Savol berishda davom eting.`);
      setGuessInput('');

      if (isOnline) {
        peerManager.send({
          type: 'MAKE_GUESS',
          val,
          id: wrongMsg.id,
          timestamp,
          guessCount: newGuessCount,
          questionCount,
          messages
        });
      }

      setTimeout(() => setToastError(''), 4000);
    }
  };

  const handleSelectQuickQuestion = (qText) => {
    if (pendingQuestionId !== null) {
      setToastError('Iltimos, Player 1 avvalgi savolga javob berishini kuting.');
      setTimeout(() => setToastError(''), 3000);
      return;
    }
    setQuestionInput(qText);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-4 flex flex-col h-[calc(100vh-4.5rem)]">
      
      {/* TURN STATUS BANNER */}
      <div className="glass-panel rounded-2xl px-4 py-3 flex items-center justify-between border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full animate-ping ${pendingQuestionId ? 'bg-amber-400' : 'bg-cyan-400'}`} />
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Hozirgi Bosqich</span>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              {pendingQuestionId ? (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Player 1: Savolga Javob Bering
                </span>
              ) : (
                <span className="text-cyan-400 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Player 2: Savol Bering Yoki Taxmin Qiling
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Taxminlar Soni</span>
          <div className="text-sm font-extrabold text-slate-200">{guessCount}</div>
        </div>
      </div>

      {/* CHAT MESSENGER FEED */}
      <div className="flex-1 glass-card rounded-3xl p-4 sm:p-6 border border-slate-800/80 overflow-y-auto space-y-4 flex flex-col shadow-inner">
        {messages.map((msg) => {
          if (msg.type === 'SYSTEM') {
            return (
              <div key={msg.id} className="mx-auto my-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-slate-400 text-xs flex items-center gap-2 text-center max-w-lg shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{msg.text}</span>
              </div>
            );
          }

          if (msg.sender === 'P2' && msg.type === 'QUESTION') {
            return (
              <div key={msg.id} className="flex flex-col items-end space-y-1 max-w-[85%] sm:max-w-[75%] ml-auto">
                <span className="text-[10px] text-indigo-400 font-bold tracking-wider uppercase pr-2">
                  Player 2 (Savol beruvchi)
                </span>
                <div className="rounded-2xl rounded-tr-none px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md text-sm font-medium">
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-500 pr-1">{msg.timestamp}</span>
              </div>
            );
          }

          if (msg.sender === 'P1' && msg.type === 'ANSWER') {
            const isYes = msg.answer === 'YES';
            const isNo = msg.answer === 'NO';

            return (
              <div key={msg.id} className="flex flex-col items-start space-y-1 max-w-[85%] sm:max-w-[75%] mr-auto">
                <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase pl-2">
                  Player 1 (Sir saqlovchi)
                </span>
                <div className={`rounded-2xl rounded-tl-none px-4 py-2.5 font-bold text-sm shadow-md flex items-center gap-2 border ${
                  isYes 
                    ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-300' 
                    : isNo 
                    ? 'bg-rose-950/80 border-rose-600/60 text-rose-300' 
                    : 'bg-amber-950/80 border-amber-600/60 text-amber-300'
                }`}>
                  {isYes && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isNo && <XCircle className="w-4 h-4 text-rose-400" />}
                  <span>{msg.text}</span>
                </div>
                <span className="text-[10px] text-slate-500 pl-1">{msg.timestamp}</span>
              </div>
            );
          }

          if (msg.type === 'GUESS') {
            return (
              <div key={msg.id} className="flex flex-col items-end space-y-1 max-w-[85%] sm:max-w-[75%] ml-auto">
                <span className="text-[10px] text-rose-400 font-bold tracking-wider uppercase pr-2">
                  Player 2 Taxmin Urinishi
                </span>
                <div className="rounded-2xl rounded-tr-none px-4 py-2.5 bg-rose-950/60 border border-rose-800/80 text-rose-200 text-sm font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-400" />
                  <span>{msg.text} - <strong className="text-rose-400">Noto'g'ri!</strong></span>
                </div>
                <span className="text-[10px] text-slate-500 pr-1">{msg.timestamp}</span>
              </div>
            );
          }

          return null;
        })}

        {/* PENDING QUESTION ANSWER PANEL */}
        {pendingQuestionId && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-700/60 space-y-3 animate-pulse-subtle my-2">
            <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Player 1: Player 2 bergan savolga javob bering!
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAnswerQuestion('YES')}
                disabled={isOnline && myPlayerRole === 'P2'}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" /> HA
              </button>
              <button
                onClick={() => handleAnswerQuestion('NO')}
                disabled={isOnline && myPlayerRole === 'P2'}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
              >
                <XCircle className="w-4 h-4" /> YO'Q
              </button>
              <button
                onClick={() => handleAnswerQuestion('NA')}
                disabled={isOnline && myPlayerRole === 'P2'}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-semibold text-xs transition-colors"
                title="Savol noma'lum yoki mos emas bo'lsa"
              >
                Noma'lum
              </button>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ERROR TOAST */}
      {toastError && (
        <div className="px-4 py-3 rounded-2xl bg-rose-950 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-2 shadow-lg animate-bounce">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{toastError}</span>
        </div>
      )}

      {/* QUICK SUGGESTIONS */}
      {!pendingQuestionId && mode.suggestedQuestions && (!isOnline || myPlayerRole === 'P2') && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">Tayyor Savollar:</span>
          {mode.suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectQuickQuestion(q)}
              className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-cyan-300 hover:text-cyan-200 transition-colors whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* CONTROLS */}
      <div className="grid sm:grid-cols-3 gap-3 pt-1">
        
        {/* QUESTION INPUT */}
        <form onSubmit={handleAskQuestion} className="sm:col-span-2 flex gap-2">
          <input
            type="text"
            placeholder={pendingQuestionId ? "Player 1 javob berishini kuting..." : "Player 2: Savolingizni kiriting..."}
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            disabled={pendingQuestionId !== null || (isOnline && myPlayerRole === 'P1')}
            className="w-full pl-4 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={pendingQuestionId !== null || !questionInput.trim() || (isOnline && myPlayerRole === 'P1')}
            className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <span>Yuborish</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* GUESS INPUT */}
        <form onSubmit={handleMakeGuess} className="flex gap-2">
          <input
            type="number"
            min={mode.min}
            max={mode.max}
            placeholder={`Taxmin (${mode.prefix}${mode.min}-${mode.max})`}
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            disabled={isOnline && myPlayerRole === 'P1'}
            className="w-full px-3 py-3 rounded-2xl bg-slate-950 border border-rose-900/60 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-rose-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!guessInput || (isOnline && myPlayerRole === 'P1')}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:brightness-110 disabled:opacity-50 text-white font-extrabold text-sm flex items-center gap-1 shadow-lg shadow-rose-600/30 transition-all"
          >
            <Target className="w-4 h-4" />
            <span>Taxmin</span>
          </button>
        </form>

      </div>

    </div>
  );
}
