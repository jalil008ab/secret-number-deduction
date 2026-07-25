import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ModeSelection from './components/ModeSelection';
import RoomConnect from './components/RoomConnect';
import SecretSetup from './components/SecretSetup';
import GameScreen from './components/GameScreen';
import VictoryScreen from './components/VictoryScreen';
import { sound } from './utils/sound';
import { peerManager } from './utils/peer';

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

  const handleConnectedAsHost = (code) => {
    setIsHost(true);
    setRoomCode(code);
    setCurrentStep('SETUP');
  };

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
      if (p2Secret !== null) {
        setCurrentStep('PLAYING');
      }
    } else {
      setP2Secret(mySecret);
      peerManager.send({
        type: 'SET_P2_SECRET',
        val: mySecret
      });
      if (p1Secret !== null) {
        setCurrentStep('PLAYING');
      }
    }
  };

  // PeerJS listener for secrets in Online mode
  useEffect(() => {
    if (!isOnline) return;

    const unsubscribe = peerManager.onData((data) => {
      if (data.type === 'SET_P1_SECRET') {
        setP1Secret(data.val);
        // If guest already entered p2Secret, launch game
        if (p2Secret !== null || !isHost) {
          setCurrentStep('PLAYING');
        }
      } else if (data.type === 'SET_P2_SECRET') {
        setP2Secret(data.val);
        // If host already entered p1Secret, launch game
        if (p1Secret !== null || isHost) {
          setCurrentStep('PLAYING');
        }
      }
    });

    return () => unsubscribe();
  }, [isOnline, isHost, p1Secret, p2Secret]);

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

        {currentStep === 'CONNECT_ROOM' && selectedMode && (
          <RoomConnect
            mode={selectedMode}
            onConnectedAsHost={handleConnectedAsHost}
            onConnectedAsGuest={handleConnectedAsGuest}
            onBack={() => setCurrentStep('MODE_SELECT')}
          />
        )}

        {currentStep === 'SETUP' && selectedMode && (
          <SecretSetup
            mode={selectedMode}
            isOnline={isOnline}
            isHost={isHost}
            onDualSecretSet={isOnline ? handleDualSecretSetOnline : handleDualSecretSetLocal}
            onBack={() => setCurrentStep(isOnline ? 'CONNECT_ROOM' : 'MODE_SELECT')}
          />
        )}

        {currentStep === 'PLAYING' && selectedMode && p1Secret !== null && p2Secret !== null && (
          <GameScreen
            mode={selectedMode}
            p1Secret={p1Secret}
            p2Secret={p2Secret}
            isOnline={isOnline}
            isHost={isHost}
            onWin={handleWin}
          />
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
