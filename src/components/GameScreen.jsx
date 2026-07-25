import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Target, CheckCircle2, XCircle, User, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';
import { peerManager } from '../utils/peer';

export default function GameScreen({ mode, p1Secret, p2Secret, isOnline, isHost, onWin }) {
  // Current Turn: 'P1' or 'P2'
  const [currentTurn, setCurrentTurn] = useState('P1');

  // Messages list
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'SYSTEM',
      type: 'SYSTEM',
      text: `O'yin Boshlandi! Har ikkalamanngiz sirli sonni o'yladingiz. Galma-galdan savol berib, bir-biringizning soningizni toping! Player 1, birinchi savolingizni bering!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [questionInput, setQuestionInput] = useState('');
  const [guessInput, setGuessInput] = useState('');
  const [pendingQuestionId, setPendingQuestionId] = useState(null); // ID of question waiting for answer
  const [pendingQuestionSender, setPendingQuestionSender] = useState(null); // 'P1' or 'P2'
  const [toastError, setToastError] = useState('');

  const chatEndRef = useRef(null);

  // My identity in online mode
  const myRole = isOnline ? (isHost ? 'P1' : 'P2') : currentTurn;

  // Target secret to guess for current turn player:
  // If turn is P1 -> P1 is trying to guess P2's secret (p2Secret)
  // If turn is P2 -> P2 is trying to guess P1's secret (p1Secret)
  const getTargetSecret = (askingPlayer) => {
    return askingPlayer === 'P1' ? p2Secret : p1Secret;
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingQuestionId, toastError, currentTurn]);

  // PeerJS online real-time sync
  useEffect(() => {
    if (!isOnline) return;

    const unsubscribe = peerManager.onData((data) => {
      if (data.type === 'ASK_QUESTION') {
        sound.questionSubmitted();
        const newQuestion = {
          id: data.id,
          sender: data.sender, // 'P1' or 'P2'
          type: 'QUESTION',
          text: data.text,
          timestamp: data.timestamp
        };
        setMessages((prev) => [...prev, newQuestion]);
        setPendingQuestionId(data.id);
        setPendingQuestionSender(data.sender);
      } else if (data.type === 'ANSWER_QUESTION') {
        if (data.answer === 'YES') sound.answerYes();
        else sound.answerNo();

        const ansMessage = {
          id: data.id,
          sender: data.sender, // Answerer
          type: 'ANSWER',
          questionId: data.questionId,
          answer: data.answer,
          text: data.text,
          timestamp: data.timestamp
        };
        setMessages((prev) => [...prev, ansMessage]);
        setPendingQuestionId(null);
        setPendingQuestionSender(null);

        // Switch turn to the other player!
        const nextTurn = data.sender === 'P1' ? 'P1' : 'P2'; // The one who asked gets next turn, or switch
        setCurrentTurn(data.sender); 
      } else if (data.type === 'MAKE_GUESS') {
        if (data.isCorrect) {
          sound.victory();
          onWin({
            winner: data.sender,
            targetSecret: data.val,
            p1Secret,
            p2Secret,
            messages: data.messages
          });
        } else {
          sound.wrongGuess();
          const wrongMsg = {
            id: data.id,
            sender: data.sender,
            type: 'GUESS',
            text: `Taxmin qilindi: ${mode.prefix}${data.val} ${mode.unit}`,
            timestamp: data.timestamp
          };
          setMessages((prev) => [...prev, wrongMsg]);
          setToastError(`${data.sender === 'P1' ? 'Player 1' : 'Player 2'} noto'g'ri taxmin qildi (${mode.prefix}${data.val})! Navbat ikkinchi o'yinchiga o'tdi.`);
          // Switch turn
          setCurrentTurn(data.sender === 'P1' ? 'P2' : 'P1');
          setTimeout(() => setToastError(''), 4500);
        }
      }
    });

    return () => unsubscribe();
  }, [isOnline, p1Secret, p2Secret, mode, onWin]);

  // Handle asking a question
  const handleAskQuestion = (e) => {
    if (e) e.preventDefault();
    const query = questionInput.trim();
    if (!query) return;

    // Check if it's my turn in online mode
    if (isOnline && myRole !== currentTurn) {
      setToastError('Hozir sizning navbatingiz emas! Do\'stingiz javob berishini kuting.');
      setTimeout(() => setToastError(''), 3000);
      return;
    }

    if (pendingQuestionId !== null) {
      setToastError('Iltimos, avvalgi savolga javob berilishini kuting!');
      setTimeout(() => setToastError(''), 3000);
      return;
    }

    sound.questionSubmitted();
    const qId = Date.now();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const askingPlayer = currentTurn;
    const newQuestion = {
      id: qId,
      sender: askingPlayer, // 'P1' or 'P2'
      type: 'QUESTION',
      text: query,
      timestamp
    };

    setMessages((prev) => [...prev, newQuestion]);
    setPendingQuestionId(qId);
    setPendingQuestionSender(askingPlayer);
    setQuestionInput('');
    setToastError('');

    if (isOnline) {
      peerManager.send({
        type: 'ASK_QUESTION',
        id: qId,
        sender: askingPlayer,
        text: query,
        timestamp
      });
    }
  };

  // Handle answering YES or NO
  const handleAnswerQuestion = (answerType) => {
    if (!pendingQuestionId) return;

    // The answerer must be the opposite of the question sender!
    const answererRole = pendingQuestionSender === 'P1' ? 'P2' : 'P1';

    if (isOnline && myRole !== answererRole) {
      setToastError('Javob berish navbati do\'stingizda!');
      setTimeout(() => setToastError(''), 3000);
      return;
    }

    if (answerType === 'YES') sound.answerYes();
    else sound.answerNo();

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const textStr = answerType === 'YES' ? 'Ha! ✅' : answerType === 'NO' ? 'Yo\'q! ❌' : 'Qisman / Noma\'lum ⚠️';

    const ansMessage = {
      id: Date.now(),
      sender: answererRole,
      type: 'ANSWER',
      questionId: pendingQuestionId,
      answer: answerType,
      text: textStr,
      timestamp
    };

    setMessages((prev) => [...prev, ansMessage]);
    setPendingQuestionId(null);
    setPendingQuestionSender(null);

    // Switch turn to the player who just answered!
    const nextTurn = answererRole;
    setCurrentTurn(nextTurn);

    if (isOnline) {
      peerManager.send({
        type: 'ANSWER_QUESTION',
        id: ansMessage.id,
        sender: answererRole,
        questionId: pendingQuestionId,
        answer: answerType,
        text: textStr,
        timestamp
      });
    }
  };

  // Handle numeric guess
  const handleMakeGuess = (e) => {
    e.preventDefault();
    if (!guessInput) return;

    if (isOnline && myRole !== currentTurn) {
      setToastError('Hozir sizning navbatingiz emas!');
      setTimeout(() => setToastError(''), 3000);
      return;
    }

    const val = Number(guessInput);
    if (isNaN(val)) return;

    const askingPlayer = currentTurn;
    const targetSecret = getTargetSecret(askingPlayer);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (val === targetSecret) {
      sound.victory();
      const winData = {
        winner: askingPlayer,
        targetSecret: val,
        p1Secret,
        p2Secret,
        messages
      };

      if (isOnline) {
        peerManager.send({
          type: 'MAKE_GUESS',
          sender: askingPlayer,
          val,
          isCorrect: true,
          timestamp,
          messages
        });
      }

      onWin(winData);
    } else {
      sound.wrongGuess();
      const wrongMsg = {
        id: Date.now(),
        sender: askingPlayer,
        type: 'GUESS',
        text: `Taxmin qilindi: ${mode.prefix}${val} ${mode.unit}`,
        timestamp
      };

      setMessages((prev) => [...prev, wrongMsg]);
      setToastError(`Noto'g'ri taxmin (${mode.prefix}${val})! Navbat ikkinchi o'yinchiga o'tdi.`);
      setGuessInput('');

      // Switch turn after wrong guess
      const nextTurn = askingPlayer === 'P1' ? 'P2' : 'P1';
      setCurrentTurn(nextTurn);

      if (isOnline) {
        peerManager.send({
          type: 'MAKE_GUESS',
          sender: askingPlayer,
          val,
          isCorrect: false,
          timestamp,
          messages
        });
      }

      setTimeout(() => setToastError(''), 4500);
    }
  };

  const handleSelectQuickQuestion = (qText) => {
    if (pendingQuestionId !== null) {
      setToastError('Iltimos, avvalgi savolga javob berilishini kuting.');
      setTimeout(() => setToastError(''), 3000);
      return;
    }
    setQuestionInput(qText);
  };

  const answererRole = pendingQuestionSender === 'P1' ? 'P2' : 'P1';

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-4 flex flex-col h-[calc(100vh-4.5rem)]">
      
      {/* TURN STATUS BANNER */}
      <div className="glass-panel rounded-2xl px-4 py-3 flex items-center justify-between border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className={`w-3.5 h-3.5 rounded-full animate-ping ${currentTurn === 'P1' ? 'bg-cyan-400' : 'bg-indigo-400'}`} />
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Navbat Boshqaruvi</span>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              {pendingQuestionId ? (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <User className="w-4 h-4" /> {answererRole === 'P1' ? 'Player 1' : 'Player 2'}: Savolga javob bering
                </span>
              ) : (
                <span className={currentTurn === 'P1' ? 'text-cyan-400' : 'text-indigo-400'}>
                  🚀 Navbat: {currentTurn === 'P1' ? 'Player 1' : 'Player 2'} (Savol bering yoki taxmin qiling)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Rejim</span>
          <div className="text-xs font-bold text-cyan-300">Galma-galdan</div>
        </div>
      </div>

      {/* CHAT FEED */}
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

          const isP1 = msg.sender === 'P1';

          if (msg.type === 'QUESTION') {
            return (
              <div key={msg.id} className={`flex flex-col space-y-1 max-w-[85%] sm:max-w-[75%] ${isP1 ? 'mr-auto items-start' : 'ml-auto items-end'}`}>
                <span className={`text-[10px] font-bold tracking-wider uppercase ${isP1 ? 'text-cyan-400 pl-2' : 'text-indigo-400 pr-2'}`}>
                  {isP1 ? 'Player 1 Savoli' : 'Player 2 Savoli'}
                </span>
                <div className={`rounded-2xl px-4 py-3 text-white shadow-md text-sm font-medium ${
                  isP1 ? 'bg-cyan-900/80 border border-cyan-700/60 rounded-tl-none' : 'bg-indigo-900/80 border border-indigo-700/60 rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-500 px-1">{msg.timestamp}</span>
              </div>
            );
          }

          if (msg.type === 'ANSWER') {
            const isYes = msg.answer === 'YES';
            const isNo = msg.answer === 'NO';

            return (
              <div key={msg.id} className={`flex flex-col space-y-1 max-w-[85%] sm:max-w-[75%] ${isP1 ? 'mr-auto items-start' : 'ml-auto items-end'}`}>
                <span className={`text-[10px] font-bold tracking-wider uppercase ${isP1 ? 'text-cyan-400 pl-2' : 'text-indigo-400 pr-2'}`}>
                  {isP1 ? 'Player 1 Javobi' : 'Player 2 Javobi'}
                </span>
                <div className={`rounded-2xl px-4 py-2.5 font-bold text-sm shadow-md flex items-center gap-2 border ${
                  isP1 ? 'rounded-tl-none' : 'rounded-tr-none'
                } ${
                  isYes ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-300' : isNo ? 'bg-rose-950/80 border-rose-600/60 text-rose-300' : 'bg-amber-950/80 border-amber-600/60 text-amber-300'
                }`}>
                  {isYes && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isNo && <XCircle className="w-4 h-4 text-rose-400" />}
                  <span>{msg.text}</span>
                </div>
                <span className="text-[10px] text-slate-500 px-1">{msg.timestamp}</span>
              </div>
            );
          }

          if (msg.type === 'GUESS') {
            return (
              <div key={msg.id} className={`flex flex-col space-y-1 max-w-[85%] sm:max-w-[75%] ${isP1 ? 'mr-auto items-start' : 'ml-auto items-end'}`}>
                <span className="text-[10px] text-rose-400 font-bold tracking-wider uppercase px-2">
                  {isP1 ? 'Player 1 Taxmin Urinishi' : 'Player 2 Taxmin Urinishi'}
                </span>
                <div className="rounded-2xl px-4 py-2.5 bg-rose-950/60 border border-rose-800/80 text-rose-200 text-sm font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-400" />
                  <span>{msg.text} - <strong className="text-rose-400">Noto'g'ri!</strong></span>
                </div>
                <span className="text-[10px] text-slate-500 px-1">{msg.timestamp}</span>
              </div>
            );
          }

          return null;
        })}

        {/* PENDING QUESTION ANSWER CONTROLS */}
        {pendingQuestionId && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-700/60 space-y-3 animate-pulse-subtle my-2">
            <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                {answererRole === 'P1' ? 'Player 1' : 'Player 2'}: Berilgan savolga javob bering!
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAnswerQuestion('YES')}
                disabled={isOnline && myRole !== answererRole}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" /> HA
              </button>
              <button
                onClick={() => handleAnswerQuestion('NO')}
                disabled={isOnline && myRole !== answererRole}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
              >
                <XCircle className="w-4 h-4" /> YO'Q
              </button>
              <button
                onClick={() => handleAnswerQuestion('NA')}
                disabled={isOnline && myRole !== answererRole}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-semibold text-xs transition-colors"
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
      {!pendingQuestionId && mode.suggestedQuestions && (!isOnline || myRole === currentTurn) && (
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

      {/* INPUT CONTROLS */}
      <div className="grid sm:grid-cols-3 gap-3 pt-1">
        
        {/* ASK QUESTION */}
        <form onSubmit={handleAskQuestion} className="sm:col-span-2 flex gap-2">
          <input
            type="text"
            placeholder={
              pendingQuestionId 
                ? "Javob berilishini kuting..." 
                : isOnline && myRole !== currentTurn 
                ? "Do'stingizning navbati..." 
                : `${currentTurn === 'P1' ? 'Player 1' : 'Player 2'}: Savolingizni kiriting...`
            }
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            disabled={pendingQuestionId !== null || (isOnline && myRole !== currentTurn)}
            className="w-full pl-4 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={pendingQuestionId !== null || !questionInput.trim() || (isOnline && myRole !== currentTurn)}
            className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <span>Yuborish</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* MAKE GUESS */}
        <form onSubmit={handleMakeGuess} className="flex gap-2">
          <input
            type="number"
            min={mode.min}
            max={mode.max}
            placeholder={`Taxmin (${mode.prefix}${mode.min}-${mode.max})`}
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            disabled={isOnline && myRole !== currentTurn}
            className="w-full px-3 py-3 rounded-2xl bg-slate-950 border border-rose-900/60 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-rose-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!guessInput || (isOnline && myRole !== currentTurn)}
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
