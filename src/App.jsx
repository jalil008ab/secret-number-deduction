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
  // STEPS: 'MODE_SELECT' | 'CONNECT_ROOM' | 'SETUP' | 'PLAYING' | 'VICTORY'
  const [currentStep, setCurrentStep] = useState('MODE_SELECT');
  const [selectedMode, setSelectedMode] = useState(null);
  const [secretValue, setSecretValue] = useState(null);
  const [soundMuted, setSoundMuted] = useState(false);
  const [winStats, setWinStats] = useState(null);

  // Online Multiplayer State
  const [isOnline, setIsOnline] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [roomCode, setRoomCode] = useState(null);

  // Sound toggle handler
  const handleToggleSound = () => {
    sound.muted = !soundMuted;
    setSoundMuted(!soundMuted);
  };

  // Mode Selection handler
  const handleSelectMode = (modeObj) => {
    setSelectedMode(modeObj);
    if (modeObj.playType === 'ONLINE') {
      setIsOnline(true);
      setCurrentStep('CONNECT_ROOM');
    } else {
      setIsOnline(false);
      setIsHost(true); // local pass-and-play
      setCurrentStep('SETUP');
    }
  };

  // Online Host connected
  const handleConnectedAsHost = (code) => {
    setIsHost(true);
    setRoomCode(code);
    setCurrentStep('SETUP');
  };

  // Online Guest connected
  const handleConnectedAsGuest = (code) => {
    setIsHost(false);
    setRoomCode(code);
    setCurrentStep('SETUP');
  };

  // Secret Number set
  const handleSecretSet = (val) => {
    setSecretValue(val);
    setCurrentStep('PLAYING');

    if (isOnline && isHost) {
      peerManager.send({
        type: 'SECRET_SET',
        secretValue: val
      });
    }
  };

  // PeerJS listener for Guest to receive secret set event
  useEffect(() => {
    if (!isOnline) return;

    const unsubscribe = peerManager.onData((data) => {
      if (data.type === 'SECRET_SET') {
        setSecretValue(data.secretValue);
        setCurrentStep('PLAYING');
      }
    });

    return () => unsubscribe();
  }, [isOnline]);

  // Win handler
  const handleWin = (stats) => {
    setWinStats(stats);
    setCurrentStep('VICTORY');
  };

  // Reset Game handler
  const handleResetGame = () => {
    if (isOnline) {
      peerManager.disconnect();
    }
    setIsOnline(false);
    setIsHost(false);
    setRoomCode(null);
    setSecretValue(null);
    setWinStats(null);
    setCurrentStep('MODE_SELECT');
  };

  // Play Again handler
  const handlePlayAgainSameMode = () => {
    setSecretValue(null);
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
            onSecretSet={handleSecretSet}
            onBack={() => setCurrentStep(isOnline ? 'CONNECT_ROOM' : 'MODE_SELECT')}
          />
        )}

        {currentStep === 'PLAYING' && selectedMode && secretValue !== null && (
          <GameScreen
            mode={selectedMode}
            secretValue={secretValue}
            isOnline={isOnline}
            isHost={isHost}
            onWin={handleWin}
          />
        )}

        {currentStep === 'VICTORY' && selectedMode && (
          <VictoryScreen
            mode={selectedMode}
            secretValue={secretValue}
            winStats={winStats}
            onPlayAgain={handlePlayAgainSameMode}
            onChooseNewMode={handleResetGame}
          />
        )}
      </main>

      <footer className="py-4 border-t border-slate-900 text-center text-xs text-slate-500">
        SirliDeduct &bull; O'zbek tilidagi 2-kishilik onlayn va lokal mantiqiy o'yin
      </footer>
    </div>
  );
}
