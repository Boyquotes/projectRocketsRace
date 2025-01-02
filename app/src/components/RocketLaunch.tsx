'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import styles from './RocketLaunch.module.css';

interface RocketInfo {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface RocketProgressInfo {
  id: string;
  progress: integer;
  exploded: boolean;
}

interface RaceProgressDebug {
  raceId: string;
  rocket1: RocketProgressInfo;
  rocket2: RocketProgressInfo;
}

interface RocketLaunchProps {
  rocketInfo: RocketInfo;
  raceProgressDebug: RaceProgressDebug;
}

export default function RocketLaunch({ rocketInfo, raceProgressDebug}: RocketLaunchProps) {
  const [launch, setLaunch] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const explosionAudioRef = useRef<HTMLAudioElement | null>(null);


  useEffect(() => {
    // Start launch automatically after a delay
    const timer = setTimeout(() => {
      setLaunch(true);
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // Handle autoplay error silently
          console.log('Autoplay prevented by browser');
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("rocketInfo.id ", rocketInfo.id)
    console.log("explosion ", raceProgressDebug)
    console.log("explosion rocket1.progress", raceProgressDebug.rocket1.progress)
    console.log("explosion rocket2.progress", raceProgressDebug.rocket2.progress)
    console.log("explosion rocket1.exploded", raceProgressDebug.rocket1.exploded)
    console.log("explosion rocket2.exploded", raceProgressDebug.rocket2.exploded)
    if(raceProgressDebug.rocket1.exploded == true || raceProgressDebug.rocket2.exploded == true){
      console.log('EXPLODED');
      handlePlayExplosion();
    }
    // if(raceProgressDebug.rocket1.progress > 20 || raceProgressDebug.rocket2.progress > 20){
    if(raceProgressDebug.rocket1.progress > 20 && rocketInfo.id == raceProgressDebug.rocket1.id){
      console.log('PROGRESSED ', raceProgressDebug.rocket1.id);
      handlePlayExplosion();
    }

  }, [raceProgressDebug]);

  const handlePlaySound = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
    setLaunch(true);
  };

  const handleStopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handlePlayExplosion = () => {
    if (explosionAudioRef.current) {
      explosionAudioRef.current.play();
    }
  };

  return (
    <div className={`${styles.scene} ${launch ? styles.launch : ''}`}>
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
      <div className={styles.audioControls}>
        <button className={styles.playButton} disabled={launch}>
          {rocketInfo.name}
        </button>
        <button onClick={handleStopSound} className={styles.stopButton}>
          Stop Music
        </button>
        <button onClick={handlePlayExplosion} className={styles.explosionButton}>
          Play Explosion
        </button>
      </div>
      <div className={`${styles.rocket} ${launch ? styles.launch : ''}`}>
          <Image 
            src={rocketInfo.image} 
            alt={rocketInfo.name} 
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={styles.rocket_image}
          />
        <div className={styles.exhaust_flame}></div>
      </div>
    </div>
  );
} 