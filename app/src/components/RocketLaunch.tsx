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
  const [destroy, setDestroy] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const explosionAudioRef = useRef<HTMLAudioElement | null>(null);
  const winnerAudioRef = useRef<HTMLAudioElement | null>(null);
  


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
      handleStopSound();
      setDestroy(true);
      setShowExplosion(true);
      if (explosionAudioRef.current) {
        explosionAudioRef.current.play().catch(() => {
          console.log('Explosion sound autoplay prevented');
        });
      }
      // Hide explosion after animation
      const timer = setTimeout(() => {
        setShowExplosion(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    // if(raceProgressDebug.rocket1.progress > 20 || raceProgressDebug.rocket2.progress > 20){
    if( (raceProgressDebug.rocket1.progress > 99 && rocketInfo.id == raceProgressDebug.rocket1.id) || (raceProgressDebug.rocket2.progress > 99 && rocketInfo.id == raceProgressDebug.rocket2.id)){
      console.log('PROGRESSED 1', raceProgressDebug.rocket1.id);
      console.log('PROGRESSED 2', raceProgressDebug.rocket2.id);
      setShowWinner(true);
      if (winnerAudioRef.current) {
        winnerAudioRef.current.play().catch(() => {
          console.log('Winner sound autoplay prevented');
        });
      }
      // Hide explosion after animation
      const timer = setTimeout(() => {
        setShowWinner(false);
      }, 10000);
      return () => clearTimeout(timer);
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
      <audio 
        ref={winnerAudioRef}
      >
        <source src="/audio/youwin.mp3" type="audio/mpeg" />
        <source src="/audio/youwin.wav" type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
      <div className={styles.audioControls}>
        <button className={styles.playButton} disabled={launch}>
          {rocketInfo.name}
        </button>
      </div>
      {raceProgressDebug.rocket1.progress && rocketInfo.id == raceProgressDebug.rocket1.id && (
        <div className={styles.progression}>
          {raceProgressDebug.rocket1.progress}
        </div>
      )}
      {raceProgressDebug.rocket2.progress && rocketInfo.id == raceProgressDebug.rocket2.id && (
        <div className={styles.progression}>
          {raceProgressDebug.rocket2.progress}
        </div>
      )}
      {!destroy ? (
        <div className={`${styles.rocket} ${launch ? styles.launch : ''}`}>
            <Image 
              src={rocketInfo.image} 
              alt={rocketInfo.name} 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.rocket_image}
            />
          <div className={styles.exhaust_flame_high}></div>
          <div className={styles.exhaust_flame}></div>
          <div className={styles.exhaust_flame_middle}></div>
          {showWinner && (
            <div className={`${styles.rocket} ${launch ? styles.launch : ''}`}>
              <Image
                src="/winner.png"
                alt="winner"
                fill
                sizes="(max-width: 600px)"
                className={styles.winner}
              />
            </div>
          )}
        </div>
      ):
      showExplosion && (
        <div className={`${styles.rocket} ${launch ? styles.launch : ''}`}>
            <Image 
              src="/explosion.png" 
              alt="explosion" 
              fill
              sizes="(max-width: 600px)"
              className={styles.explosion}
            />
        </div>
      )}
    </div>
  );
} 