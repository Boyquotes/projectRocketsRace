'use client';

import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import io, { Socket } from 'socket.io-client';
import { useMutation } from '@apollo/client';
import { START_RACE_MUTATION } from '@/graphql/queries';

interface RocketRaceGameProps {
  rocketIds: string[];
  onGameEnd?: (winner: string | null) => void;
}

interface RocketPosition {
  id: string;
  x: number;
  y: number;
}

const RocketRaceGame: React.FC<RocketRaceGameProps> = ({ 
  rocketIds, 
  onGameEnd = () => {} 
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const rocketsRef = useRef<{[key: string]: Phaser.Physics.Arcade.Sprite}>({});
  const [gameStatus, setGameStatus] = useState<'playing' | 'ended'>('playing');
  const [gameOverText, setGameOverText] = useState<string | null>(null);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceError, setRaceError] = useState<string | null>(null);

  // GraphQL mutation for starting the race
  const [startRace, { data: raceData, error: apolloRaceError }] = useMutation(START_RACE_MUTATION, {
    onCompleted: (data) => {
      if (data && data.startRace) {
        setRaceStarted(true);
        console.log('Race started:', data.startRace);
      }
    },
    onError: (error) => {
      console.error('Race start error:', error);
      setRaceError(error.message);
    }
  });

  useEffect(() => {
    // Start the race when component mounts
    if (rocketIds.length === 2 && !raceStarted) {
      try {
        startRace({
          variables: {
            rocket1: rocketIds[0],
            rocket2: rocketIds[1]
          }
        });
      } catch (error) {
        console.error('Failed to start race:', error);
        setRaceError(error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }, [rocketIds, startRace, raceStarted]);

  useEffect(() => {
    // Log any race start errors
    if (apolloRaceError) {
      console.error('Apollo Race Error:', apolloRaceError);
      setRaceError(apolloRaceError.message);
    }
  }, [apolloRaceError]);

  useEffect(() => {
    // Ensure we're on the client side and race has started
    if (typeof window !== 'undefined' && gameStatus === 'playing' && raceStarted) {
      // Socket.IO connection
      socketRef.current = io('http://localhost:3001', {
        transports: ['websocket']
      });

      // Phaser game configuration
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: gameRef.current!,
        scene: {
          preload: preload,
          create: create,
          update: update
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        }
      };

      gameInstanceRef.current = new Phaser.Game(config);

      useEffect(() => {
        // Ensure we're on the client side and race has started
        if (typeof window !== 'undefined' && gameStatus === 'playing' && raceStarted) {
          // Socket.IO connection
          socketRef.current = io('http://localhost:3001', {
            transports: ['websocket']
          });
    
          // Listen for race launch event
          socketRef.current.on('race-launched', (data) => {
            console.log('Race launched by another player:', data);
            // Optional: Add any additional logic for handling race launch
            // For example, you might want to update game state or show a notification
          });
    
          // Emit rocket selection to other players
          socketRef.current.emit('rocket-selection', rocketIds);
    
          // Rest of the existing code...
        }
      }, [raceStarted, gameStatus, rocketIds]);

      let backgroundMusic: Phaser.Sound.BaseSound;
      let asteroids: Phaser.Physics.Arcade.Group;

      function preload(this: Phaser.Scene) {
        // Dynamically load rocket images based on selected rocket IDs
        this.load.image('rocket1', `/rocket${rocketIds[0]-1}.png`);
        this.load.image('rocket2', `/rocket${rocketIds[1]-1}.png`);
        this.load.image('asteroid', '/asteroid.png');
        this.load.image('background', '/space-background.png');
        this.load.image('explosion', '/explosion.gif');
        
        // Load background music
        this.load.audio('space-theme', '/audio/space-invaders-theme.mp3');
        this.load.audio('explosion-sound', '/audio/explosion-sound.mp3');
      }

      function create(this: Phaser.Scene) {
        // Add background
        this.add.image(400, 300, 'background');

        // Play background music
        backgroundMusic = this.sound.add('space-theme', { 
          loop: true,
          volume: 0.5 // Adjust volume as needed
        });
        backgroundMusic.play();

        // Create rockets using dynamically loaded images
        rocketsRef.current[rocketIds[0]] = this.physics.add.sprite(100, 300, 'rocket1');
        rocketsRef.current[rocketIds[1]] = this.physics.add.sprite(700, 300, 'rocket2');

        // Set rocket properties
        Object.values(rocketsRef.current).forEach(rocket => {
          rocket.setCollideWorldBounds(true);
          rocket.setScale(0.15);  
        });

        // Optional: Add music controls
        this.input.keyboard?.on('keydown-M', () => {
          if (backgroundMusic.isPlaying) {
            backgroundMusic.pause();
          } else {
            backgroundMusic.resume();
          }
        });

        // Create asteroid group
        asteroids = this.physics.add.group();

        // Spawn asteroids periodically
        this.time.addEvent({
          delay: 2000,
          callback: spawnAsteroid,
          callbackScope: this,
          loop: true
        });

        // Collision detection
        Object.values(rocketsRef.current).forEach(rocket => {
          this.physics.add.collider(rocket, asteroids, handleRocketAsteroidCollision);
        });

        // Collision detection between rockets
        this.physics.add.collider(
          rocketsRef.current[rocketIds[0]], 
          rocketsRef.current[rocketIds[1]], 
          handleRocketCollision
        );

        // Socket event listeners for rocket movement
        socketRef.current?.on('rocket-move', (data: RocketPosition) => {
          const rocket = rocketsRef.current[data.id];
          if (rocket) {
            rocket.setPosition(data.x, data.y);
          }
        });
      }

      function update(this: Phaser.Scene) {
        // Skip update if game has ended
        if (gameStatus === 'ended') {
          return;
        }

        // Keyboard controls for rockets
        const cursors = this.input.keyboard?.createCursorKeys();
        const wasd = {
          up: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W),
          down: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S),
          left: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A),
          right: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        // Safely get rockets
        const rocket1 = rocketsRef.current[rocketIds[0]];
        const rocket2 = rocketsRef.current[rocketIds[1]];

        // Rocket 1 controls (arrow keys)
        if (rocket1 && rocket1.body) {
          // Vertical movement
          if (cursors?.up.isDown) {
            rocket1.setVelocityY(-300);
            rocket1.setAngle(0);  // Upright position
            socketRef.current?.emit('rocket-move', { 
              id: rocketIds[0], 
              x: rocket1.x, 
              y: rocket1.y 
            });
          } else if (cursors?.down.isDown) {
            rocket1.setVelocityY(300);
            rocket1.setAngle(180);  // Upside down
            socketRef.current?.emit('rocket-move', { 
              id: rocketIds[0], 
              x: rocket1.x, 
              y: rocket1.y 
            });
          } else {
            rocket1.setVelocityY(0);
          }

          // Horizontal movement with rotation
          if (cursors?.left.isDown) {
            rocket1.setVelocityX(-300);
            rocket1.setAngle(-45);  // Tilt left
            socketRef.current?.emit('rocket-move', { 
              id: rocketIds[0], 
              x: rocket1.x, 
              y: rocket1.y 
            });
          } else if (cursors?.right.isDown) {
            rocket1.setVelocityX(300);
            rocket1.setAngle(45);  // Tilt right
            socketRef.current?.emit('rocket-move', { 
              id: rocketIds[0], 
              x: rocket1.x, 
              y: rocket1.y 
            });
          } else {
            rocket1.setVelocityX(0);
            rocket1.setAngle(0);  // Reset to upright
          }
        }

        // Rocket 2 controls (WASD)
        if (rocket2 && rocket2.body) {
          // Vertical movement
          if (wasd.up?.isDown) {
            rocket2.setVelocityY(-300);
            rocket2.setAngle(0);  // Upright position
            socketRef.current?.emit('rocket-move', { 
              id: rocketIds[1], 
              x: rocket2.x, 
              y: rocket2.y 
            });
          } else if (wasd.down?.isDown) {
            rocket2.setVelocityY(300);
            rocket2.setAngle(180);  // Upside down
            socketRef.current?.emit('rocket-move', { 
              id: rocketIds[1], 
              x: rocket2.x, 
              y: rocket2.y 
            });
          } else {
            rocket2.setVelocityY(0);
          }

          // Horizontal movement with rotation
          if (wasd.left?.isDown) {
            rocket2.setVelocityX(-300);
            rocket2.setAngle(-45);  // Tilt left
            socketRef.current?.emit('rocket-move', { 
              id: rocketIds[1], 
              x: rocket2.x, 
              y: rocket2.y 
            });
          } else if (wasd.right?.isDown) {
            rocket2.setVelocityX(300);
            rocket2.setAngle(45);  // Tilt right
            socketRef.current?.emit('rocket-move', { 
              id: rocketIds[1], 
              x: rocket2.x, 
              y: rocket2.y 
            });
          } else {
            rocket2.setVelocityX(0);
            rocket2.setAngle(0);  // Reset to upright
          }
        }
      }

      function spawnAsteroid(this: Phaser.Scene) {
        const x = Phaser.Math.Between(0, 800);
        const asteroid = asteroids.create(x, 0, 'asteroid');
        asteroid.setVelocity(0, 200);
        asteroid.setScale(0.5);
      }

      function displayGameOver(this: Phaser.Scene, message: string) {
        // Clear any existing game over text
        const existingText = this.children.getByName('game-over-text');
        if (existingText) {
          existingText.destroy();
        }

        // Create game over text
        const gameOverTextObj = this.add.text(
          400, 
          300, 
          message, 
          { 
            fontSize: '64px', 
            color: '#ff0000',
            fontStyle: 'bold',
            align: 'center'
          }
        );
        gameOverTextObj.setOrigin(0.5);
        gameOverTextObj.setName('game-over-text');

        // Optional: Add a restart button
        const restartButton = this.add.text(
          400, 
          400, 
          'Restart Game', 
          { 
            fontSize: '32px', 
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
          }
        )
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
          // Implement restart logic if needed
          this.scene.restart();
        });
      }

      function handleRocketAsteroidCollision(
        rocket: Phaser.GameObjects.GameObject, 
        asteroid: Phaser.GameObjects.GameObject
      ) {
        const scene = rocket.scene;
        
        // Prevent further updates if game has ended
        setGameStatus('ended');
        
        // Create explosion effects for rocket and asteroid
        const rocketExplosion = scene.add.sprite(
          (rocket.body as Phaser.Physics.Arcade.Body).position.x, 
          (rocket.body as Phaser.Physics.Arcade.Body).position.y, 
          'explosion'
        );
        const asteroidExplosion = scene.add.sprite(
          (asteroid.body as Phaser.Physics.Arcade.Body).position.x, 
          (asteroid.body as Phaser.Physics.Arcade.Body).position.y, 
          'explosion'
        );
        
        // Scale and animate explosions
        rocketExplosion.setScale(0.5);
        asteroidExplosion.setScale(0.5);
        
        // Add explosion animation
        scene.tweens.add({
          targets: [rocketExplosion, asteroidExplosion],
          scale: 1,
          alpha: { from: 1, to: 0 },
          duration: 500,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            rocketExplosion.destroy();
            asteroidExplosion.destroy();
          }
        });
        
        // Play explosion sound
        const explosionSound = scene.sound.add('explosion-sound');
        explosionSound.play();
        
        // Determine which rocket was hit
        const destroyedRocketId = rocket.name;
        const winnerRocketId = rocketIds.find(id => id !== destroyedRocketId);

        // Destroy rocket and asteroid
        rocket.destroy();
        asteroid.destroy();

        // Remove the destroyed rocket from rocketsRef
        if (destroyedRocketId) {
          delete rocketsRef.current[destroyedRocketId];
        }

        // Display game over
        displayGameOver.call(scene, winnerRocketId 
          ? `Rocket ${winnerRocketId} Wins!` 
          : 'Game Over - Draw!'
        );

        // Emit game end event
        socketRef.current?.emit('game-end', { 
          type: 'asteroid-collision', 
          destroyedRocketId,
          winnerRocketId
        });

        // Determine winner and end game
        onGameEnd(winnerRocketId || null);
      }

      function handleRocketCollision(
        rocket1: Phaser.GameObjects.GameObject, 
        rocket2: Phaser.GameObjects.GameObject
      ) {
        const scene = rocket1.scene;
        
        // Create explosion effects for both rockets
        const explosion1 = scene.add.sprite(
          (rocket1.body as Phaser.Physics.Arcade.Body).position.x, 
          (rocket1.body as Phaser.Physics.Arcade.Body).position.y, 
          'explosion'
        );
        const explosion2 = scene.add.sprite(
          (rocket2.body as Phaser.Physics.Arcade.Body).position.x, 
          (rocket2.body as Phaser.Physics.Arcade.Body).position.y, 
          'explosion'
        );
        
        // Scale and animate explosions
        explosion1.setScale(0.5);
        explosion2.setScale(0.5);
        
        // Add explosion animation
        scene.tweens.add({
          targets: [explosion1, explosion2],
          scale: 1,
          alpha: { from: 1, to: 0 },
          duration: 500,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            explosion1.destroy();
            explosion2.destroy();
          }
        });
        
        // Play explosion sound
        const explosionSound = scene.sound.add('explosion-sound');
        explosionSound.play();
        
        // Destroy rockets
        rocket1.destroy();
        rocket2.destroy();

        // Display game over
        displayGameOver.call(scene, 'Game Over - Draw!');

        // End game
        setGameStatus('ended');
        onGameEnd(null);  // Draw/no winner
        
        // Emit game end event
        socketRef.current?.emit('game-end', { 
          type: 'rocket-collision', 
          rocketIds: [rocket1.name, rocket2.name] 
        });
      }

      // Cleanup
      return () => {
        gameInstanceRef.current?.destroy(true);
        socketRef.current?.disconnect();
         // Stop background music if it exists
         if (backgroundMusic) {
          backgroundMusic.stop();
        }
      };
    }
  }, [rocketIds, onGameEnd, startRace, raceStarted]);

  // Render error state if race failed to start
  if (raceError) {
    return (
      <div className="text-red-500 p-4">
        <p>Failed to start race: {raceError}</p>
        <p>Please check the rocket IDs and try again.</p>
      </div>
    );
  }

  // Render loading state while race is starting
  if (!raceStarted) {
    return (
      <div className="flex justify-center items-center h-[600px]">
        <p>Starting race...</p>
      </div>
    );
  }

  return <div ref={gameRef} className="w-full h-[600px]" />;
};

export default RocketRaceGame;