import { RefObject } from 'react';

interface RocketAudioProps {
  audioRef: RefObject<HTMLAudioElement>;
  explosionAudioRef: RefObject<HTMLAudioElement>;
  winnerAudioRef: RefObject<HTMLAudioElement>;
}

export default function RocketAudio({ audioRef, explosionAudioRef, winnerAudioRef }: RocketAudioProps) {
  return (
    <>
      <audio 
        ref={audioRef}
        loop
      >
        <source src="/audio/space-invaders-theme.mp3" type="audio/mpeg" />
        <source src="/audio/space-invaders-theme.wav" type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
      <audio 
        ref={explosionAudioRef}
      >
        <source src="/audio/explosion.mp3" type="audio/mpeg" />
        <source src="/audio/explosion.wav" type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
      <audio 
        ref={winnerAudioRef}
      >
        <source src="/audio/youwin.mp3" type="audio/mpeg" />
        <source src="/audio/youwin.wav" type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
    </>
  );
} 