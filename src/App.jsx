import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ModeSelection from './components/ModeSelection';
import RoomConnect from './components/RoomConnect';
import SecretSetup from './components/SecretSetup';
import GameScreen from './components/GameScreen';
import VictoryScreen from './components/VictoryScreen';
import { sound } from './utils/sound';
import { peerManager } from './utils/peer';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = useState('MODE_SELECT');
  const [selectedMode, setSelectedMode] = useState(null);
  
  // Dual secret numbers
  const [p1Secret, setP1Secret] = useState(null);
  const [p2Secret, setP2Secret] = useState(null);
  
  const [soundMuted, setSoundMuted] = useState(false);
  const [winStats, setWinStats] = useState(null);

  // Online Multiplayer State
  const [isOnline, setIsOnline] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [roomCode, setRoomCode] = useState(null);

  const handleToggleSound = () => {
    sound.muted = !soundMuted;
    setSoundMuted(!soundMuted);
  };

  const handleSelectMode = (modeObj) => {
    setSelectedMode(modeObj);
    if (modeObj.playType === 'ONLINE') {
      setIsOnline(true);
      setCurrentStep('CONNECT_ROOM');
    } else {
      setIsOnline(false);
      setIsHost(true);
      setCurrentStep('SETUP');
    }
  };

  // Online Host connected
  const handleConnectedAsHost = (code) => {
    setIsHost(true);
    setRoomCode(code);
    setCurrentStep('SETUP');

    // Automatically send room mode sync to Guest when Guest connects
    peerManager.send({
      type: 'ROOM_INIT',
      mode: selectedMode,
      p1Secret
    });
  };

  // Online Guest connected
  const handleConnectedAsGuest = (code) => {
    setIsHost(false);
    setRoomCode(code);
    setCurrentStep('SETUP');
  };

  // Local Dual Secret Set
  const handleDualSecretSetLocal = (s1, s2) => {
    setP1Secret(s1);
    setP2Secret(s2);
    setCurrentStep('PLAYING');
  };

  // Online Dual Secret Set
  const handleDualSecretSetOnline = (mySecret) => {
    if (isHost) {
      setP1Secret(mySecret);
      peerManager.send({
        type: 'SET_P1_SECRET',
        val: mySecret
      });
    } else {
      setP2Secret(mySecret);
      peerManager.send({
        type: 'SET_P2_SECRET',
        val: mySecret
      });
    }
  };

  // Auto-transition to PLAYING only when BOTH secrets are set
  useEffect(() => {
    if (isOnline && p1Secret !== null && p2Secret !== null && currentStep !== 'PLAYING' && currentStep !== 'VICTORY') {
      sound.answerYes();
      setCurrentStep('PLAYING');
    }
  }, [isOnline, p1Secret, p2Secret, currentStep]);

  // PeerJS listener for room init and secrets
  useEffect(() => {
    if (!isOnline) return;

    const unsubscribe = peerManager.onData((data) => {
      if (data.type === 'ROOM_INIT') {
        if (data.mode) setSelectedMode(data.mode);
        if (data.p1Secret !== undefined) setP1Secret(data.p1Secret);
      } else if (data.type === 'SET_P1_SECRET') {
        setP1Secret(data.val);
      } else if (data.type === 'SET_P2_SECRET') {
        setP2Secret(data.val);
      }
    });

    return () => unsubscribe();
  }, [isOnline]);

  // If host connects, resend ROOM_INIT whenever peer connects
  useEffect(() => {
    if (!isOnline || !isHost) return;

    const unsubscribe = peerManager.onConnect(() => {
      peerManager.send({
        type: 'ROOM_INIT',
        mode: selectedMode,
        p1Secret
      });
    });

    return () => unsubscribe();
  }, [isOnline, isHost, selectedMode, p1Secret]);

  const handleWin = (stats) => {
    setWinStats(stats);
    setCurrentStep('VICTORY');
  };

  const handleResetGame = () => {
    if (isOnline) {
      peerManager.disconnect();
    }
    setIsOnline(false);
    setIsHost(false);
    setRoomCode(null);
    setP1Secret(null);
    setP2Secret(null);
    setWinStats(null);
    setCurrentStep('MODE_SELECT');
  };

  const handlePlayAgainSameMode = () => {
    setP1Secret(null);
    setP2Secret(null);
    setWinStats(null);
    setCurrentStep('SETUP');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Header
        mode={selectedMode}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
        onResetGame={handleResetGame}
        currentStep={currentStep}
        isOnline={isOnline}
        roomCode={roomCode}
      />

      <main className="flex-1">
        {currentStep === 'MODE_SELECT' && (
          <ModeSelection onSelectMode={handleSelectMode} />
        )}

        {currentStep === 'CONNECT_ROOM' && (
          <RoomConnect
            mode={selectedMode}
            onConnectedAsHost={handleConnectedAsHost}
            onConnectedAsGuest={handleConnectedAsGuest}
            onBack={() => setCurrentStep('MODE_SELECT')}
          />
        )}

        {currentStep === 'SETUP' && (
          selectedMode ? (
            <SecretSetup
              mode={selectedMode}
              isOnline={isOnline}
              isHost={isHost}
              p1Secret={p1Secret}
              p2Secret={p2Secret}
              onDualSecretSet={isOnline ? handleDualSecretSetOnline : handleDualSecretSetLocal}
              onBack={() => setCurrentStep(isOnline ? 'CONNECT_ROOM' : 'MODE_SELECT')}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 text-center glass-card rounded-3xl space-y-4">
              <Loader2 className="w-10 h-10 mx-auto animate-spin text-cyan-400" />
              <p className="text-sm font-semibold text-slate-200">Xona rejim ma'lumotlari yuklanmoqda...</p>
            </div>
          )
        )}

        {currentStep === 'PLAYING' && (
          selectedMode && p1Secret !== null && p2Secret !== null ? (
            <GameScreen
              mode={selectedMode}
              p1Secret={p1Secret}
              p2Secret={p2Secret}
              isOnline={isOnline}
              isHost={isHost}
              onWin={handleWin}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 text-center glass-card rounded-3xl space-y-4">
              <Loader2 className="w-10 h-10 mx-auto animate-spin text-cyan-400" />
              <p className="text-sm font-semibold text-slate-200">O'yin boshlanmoqda. Sirli sonlar sinxronlanmoqda...</p>
            </div>
          )
        )}

        {currentStep === 'VICTORY' && selectedMode && (
          <VictoryScreen
            mode={selectedMode}
            winStats={winStats}
            onPlayAgain={handlePlayAgainSameMode}
            onChooseNewMode={handleResetGame}
          />
        )}
      </main>

      <footer className="py-4 border-t border-slate-900 text-center text-xs text-slate-500">
        SirliDeduct &bull; Galma-galdan 2-tomonlama mantiqiy o'yin
      </footer>
    </div>
  );
}
