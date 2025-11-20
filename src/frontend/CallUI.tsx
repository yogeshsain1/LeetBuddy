import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  MonitorOff,
  Settings,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Users,
  MessageSquare,
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isSpeaking?: boolean;
}

interface CallUIProps {
  callType: 'audio' | 'video';
  callState: 'ringing' | 'connecting' | 'connected' | 'ended';
  participants: Participant[];
  currentUserId: string;
  duration?: number;
  onEndCall: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleSpeaker?: () => void;
  onOpenChat?: () => void;
  onOpenSettings?: () => void;
}

export default function CallUI({
  callType,
  callState,
  participants,
  currentUserId,
  duration = 0,
  onEndCall,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleSpeaker,
  onOpenChat,
  onOpenSettings,
}: CallUIProps) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  const currentUser = participants.find((p) => p.id === currentUserId);
  const otherParticipants = participants.filter((p) => p.id !== currentUserId);
  const mainParticipant = otherParticipants[0] || currentUser;

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-hide controls after inactivity
  useEffect(() => {
    if (callState !== 'connected') return;

    const resetTimer = () => {
      setShowControls(true);
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    resetTimer();
    const handleMouseMove = () => resetTimer();
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, [callState]);

  const handleToggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    onToggleAudio();
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    onToggleVideo();
  };

  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    onToggleScreenShare();
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
    onToggleSpeaker?.();
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Ringing state
  if (callState === 'ringing') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center z-50">
        <div className="text-center text-white p-8">
          <div className="mb-6">
            <img
              src={mainParticipant?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mainParticipant?.name || 'User')}&size=128&background=random`}
              alt={mainParticipant?.name}
              className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-xl animate-pulse"
            />
          </div>
          
          <h2 className="text-3xl font-bold mb-2">{mainParticipant?.name}</h2>
          <p className="text-xl mb-8">
            {callType === 'video' ? 'Video' : 'Audio'} calling...
          </p>

          <div className="flex gap-6 justify-center">
            <button
              onClick={onEndCall}
              className="p-6 bg-red-500 hover:bg-red-600 rounded-full transition shadow-xl"
            >
              <PhoneOff className="w-8 h-8" />
            </button>
            
            <button
              onClick={handleToggleAudio}
              className="p-6 bg-white/20 hover:bg-white/30 rounded-full transition shadow-xl"
            >
              {isAudioEnabled ? (
                <Mic className="w-8 h-8" />
              ) : (
                <MicOff className="w-8 h-8" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Connecting state
  if (callState === 'connecting') {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center text-white p-8">
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold">Connecting...</h2>
          <p className="text-gray-400 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // Connected state - Video call
  if (callState === 'connected' && callType === 'video') {
    return (
      <div 
        ref={containerRef}
        className="fixed inset-0 bg-gray-900 z-50 flex flex-col"
        onMouseMove={() => setShowControls(true)}
      >
        {/* Main video area */}
        <div className="flex-1 relative">
          {/* Main participant video */}
          <div className="absolute inset-0 flex items-center justify-center">
            {mainParticipant?.isVideoEnabled ? (
              <video
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <img
                  src={mainParticipant?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mainParticipant?.name || 'User')}&size=200&background=random`}
                  alt={mainParticipant?.name}
                  className="w-40 h-40 rounded-full mb-4"
                />
                <h3 className="text-2xl font-semibold text-white">{mainParticipant?.name}</h3>
              </div>
            )}
          </div>

          {/* Participant grid for group calls */}
          {otherParticipants.length > 1 && (
            <div className="absolute top-4 right-4 grid grid-cols-2 gap-2 max-w-md">
              {otherParticipants.slice(1).map((participant) => (
                <div
                  key={participant.id}
                  className="w-40 h-28 bg-gray-800 rounded-lg overflow-hidden relative"
                >
                  {participant.isVideoEnabled ? (
                    <video className="w-full h-full object-cover" autoPlay playsInline />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={participant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&size=64&background=random`}
                        alt={participant.name}
                        className="w-12 h-12 rounded-full"
                      />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                    {participant.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Self video (picture-in-picture) */}
          <div className="absolute bottom-24 right-4 w-40 h-28 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20 shadow-xl">
            {isVideoEnabled ? (
              <video
                className="w-full h-full object-cover mirror"
                autoPlay
                playsInline
                muted
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'You')}&size=64&background=random`}
                  alt="You"
                  className="w-12 h-12 rounded-full"
                />
              </div>
            )}
            <div className="absolute bottom-2 left-2 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
              You
            </div>
          </div>

          {/* Top bar with info */}
          <div
            className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 transition-opacity ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-medium">{formatDuration(duration)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{participants.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div
          className={`bg-gray-800 p-6 transition-transform ${
            showControls ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex items-center justify-center gap-4">
            {/* Audio toggle */}
            <button
              onClick={handleToggleAudio}
              className={`p-4 rounded-full transition ${
                isAudioEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isAudioEnabled ? 'Mute' : 'Unmute'}
            >
              {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>

            {/* Video toggle */}
            <button
              onClick={handleToggleVideo}
              className={`p-4 rounded-full transition ${
                isVideoEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>

            {/* Screen share */}
            <button
              onClick={handleToggleScreenShare}
              className={`p-4 rounded-full transition ${
                isScreenSharing
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
            </button>

            {/* End call */}
            <button
              onClick={onEndCall}
              className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition text-white"
              title="End call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            {/* Chat */}
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition text-white"
                title="Open chat"
              >
                <MessageSquare className="w-6 h-6" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={handleToggleFullscreen}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition text-white"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </button>

            {/* Settings */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition text-white"
                title="Settings"
              >
                <Settings className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Connected state - Audio call
  if (callState === 'connected' && callType === 'audio') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center z-50">
        <div className="text-center text-white p-8 max-w-md w-full">
          {/* Avatar */}
          <div className="mb-8">
            <img
              src={mainParticipant?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mainParticipant?.name || 'User')}&size=200&background=random`}
              alt={mainParticipant?.name}
              className="w-48 h-48 rounded-full mx-auto border-8 border-white/20 shadow-2xl"
            />
            {mainParticipant?.isSpeaking && (
              <div className="mt-4">
                <div className="flex items-center justify-center gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-white rounded-full animate-pulse"
                      style={{
                        height: `${20 + i * 10}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Name and status */}
          <h2 className="text-4xl font-bold mb-2">{mainParticipant?.name}</h2>
          <div className="flex items-center justify-center gap-2 text-xl mb-8">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>{formatDuration(duration)}</span>
          </div>

          {/* Group participants */}
          {otherParticipants.length > 1 && (
            <div className="mb-8 flex items-center justify-center gap-4">
              {otherParticipants.slice(1, 4).map((p) => (
                <img
                  key={p.id}
                  src={p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&size=64&background=random`}
                  alt={p.name}
                  className="w-12 h-12 rounded-full border-2 border-white/50"
                />
              ))}
              {otherParticipants.length > 4 && (
                <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-sm font-bold">
                  +{otherParticipants.length - 4}
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-6 justify-center">
            <button
              onClick={handleToggleSpeaker}
              className={`p-6 rounded-full transition shadow-xl ${
                isSpeakerEnabled
                  ? 'bg-white/20 hover:bg-white/30'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
              title={isSpeakerEnabled ? 'Mute speaker' : 'Unmute speaker'}
            >
              {isSpeakerEnabled ? <Volume2 className="w-8 h-8" /> : <VolumeX className="w-8 h-8" />}
            </button>

            <button
              onClick={handleToggleAudio}
              className={`p-6 rounded-full transition shadow-xl ${
                isAudioEnabled
                  ? 'bg-white/20 hover:bg-white/30'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
              title={isAudioEnabled ? 'Mute' : 'Unmute'}
            >
              {isAudioEnabled ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
            </button>

            <button
              onClick={onEndCall}
              className="p-6 bg-red-500 hover:bg-red-600 rounded-full transition shadow-xl"
              title="End call"
            >
              <PhoneOff className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Add this CSS to your global styles for the mirror effect
export const callUIStyles = `
.mirror {
  transform: scaleX(-1);
}
`;
