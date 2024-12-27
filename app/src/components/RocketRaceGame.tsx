'use client';

import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import io, { Socket } from 'socket.io-client';

interface RocketRaceGameProps {
  rocketIds: string[];
}

interface RocketPosition {
  id: string;
  x: number;
  y: number;
}

const RocketRaceGame: React.FC<RocketRaceGameProps> = ({ rocketIds }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const rocketsRef = useRef<{[key: string]: Phaser.Physics.Arcade.Sprite}>({});

  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window !== 'undefined') {
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

      function preload(this: Phaser.Scene) {
        // Load rocket and asteroid images using paths relative to public directory
        this.load.image('rocket1', '/rocket1.png');
        this.load.image('rocket2', '/rocket2.png');
        this.load.image('asteroid', '/asteroid.png');
        this.load.image('background', '/space-background.png');
        this.load.image('explosion', '/explosion.png');
      }

      let asteroids: Phaser.Physics.Arcade.Group;

      function create(this: Phaser.Scene) {
        // Add background
        this.add.image(400, 300, 'background');

        // Create rockets
        rocketsRef.current[rocketIds[0]] = this.physics.add.sprite(100, 300, 'rocket1');
        rocketsRef.current[rocketIds[1]] = this.physics.add.sprite(700, 300, 'rocket2');

        // Set rocket properties
        Object.values(rocketsRef.current).forEach(rocket => {
          rocket.setCollideWorldBounds(true);
          rocket.setScale(0.15);  
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

        // Socket event listeners for rocket movement
        socketRef.current?.on('rocket-move', (data: RocketPosition) => {
          const rocket = rocketsRef.current[data.id];
          if (rocket) {
            rocket.setPosition(data.x, data.y);
          }
        });
      }

      function update(this: Phaser.Scene) {
        // Keyboard controls for rockets
        const cursors = this.input.keyboard?.createCursorKeys();
        const wasd = {
          up: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W),
          down: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S),
          left: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A),
          right: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        // Rocket 1 controls (arrow keys)
        const rocket1 = rocketsRef.current[rocketIds[0]];
        const rocket2 = rocketsRef.current[rocketIds[1]];

        if (rocket1) {
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
        if (rocket2) {
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

      function handleRocketAsteroidCollision(
        rocket: Phaser.GameObjects.GameObject, 
        asteroid: Phaser.GameObjects.GameObject
      ) {
        // Emit collision event to backend
        socketRef.current?.emit('rocket-collision', {
          rocketId: rocket.name,
          asteroidId: asteroid.name
        });

        // Destroy asteroid
        asteroid.destroy();
      }

      // Cleanup
      return () => {
        gameInstanceRef.current?.destroy(true);
        socketRef.current?.disconnect();
      };
    }
  }, [rocketIds]);

  return <div ref={gameRef} className="w-full h-[600px]" />;
};

export default RocketRaceGame;