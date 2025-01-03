'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import { RocketLaunchProps } from '@/types/rocket';
import RocketAudio from './RocketAudio';
import styles from './RocketLaunch.module.css';

export default function RocketLaunch({ rocketInfo, raceProgressDebug}: RocketLaunchProps) {
  const router = useRouter();
  const { command, setCommand } = useStore(); // Access Zustand store
  const [launch, setLaunch] = useState(false);
  const [destroy, setDestroy] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const explosionAudioRef = useRef<HTMLAudioElement>(new Audio());
  const winnerAudioRef = useRef<HTMLAudioElement>(new Audio());

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
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const destroyed = () => {
    setDestroy(true);
    setShowExplosion(true);
    if (explosionAudioRef.current) {
      explosionAudioRef.current.play().catch(() => {
        console.log('Explosion sound autoplay prevented');
      });
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    // Hide explosion after animation
    const timer = setTimeout(() => {
      setShowExplosion(false);
    }, 3000);
    return () => clearTimeout(timer);
  }

  const winnerIs = () => {
    setShowWinner(true);
    if (winnerAudioRef.current) {
      winnerAudioRef.current.play().catch(() => {
        console.log('Winner sound autoplay prevented');
      });
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    // Hide explosion after animation
    const timer = setTimeout(() => {
      setShowWinner(false);
      setCommand("retry"); // Update command in Zustand store
    }, 5000);
    return () => clearTimeout(timer);
  }

  useEffect(() => {
    if(raceProgressDebug){
      if(rocketInfo.id == raceProgressDebug.rocket1.id){
        if(raceProgressDebug.rocket1.exploded === true){
          destroyed();
        }
        if(raceProgressDebug.rocket1.progress > 99 || raceProgressDebug.rocket2.exploded === true){
          winnerIs();
        }
      }
      if(rocketInfo.id == raceProgressDebug.rocket2.id){
        if(raceProgressDebug.rocket2.exploded === true){
          destroyed();
        }
        if(raceProgressDebug.rocket2.progress > 99 || raceProgressDebug.rocket1.exploded === true){
          winnerIs();
        }
      }
    }
  }, [raceProgressDebug]);

  return (
    <div className={`${styles.scene} ${launch ? styles.launch : ''}`}>
      <RocketAudio 
        audioRef={audioRef}
        explosionAudioRef={explosionAudioRef}
        winnerAudioRef={winnerAudioRef}
      />
      <div className={styles.nameButton}>
          {rocketInfo.name}
      </div>
      {raceProgressDebug && raceProgressDebug.rocket1.progress && rocketInfo.id == raceProgressDebug.rocket1.id && (
        <div className={styles.progression}>
          {raceProgressDebug.rocket1.progress}
        </div>
      )}

      {raceProgressDebug && raceProgressDebug.rocket2.progress && rocketInfo.id == raceProgressDebug.rocket2.id && (
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