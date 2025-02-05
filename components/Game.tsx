import { useEffect, useRef, useState } from "preact/hooks";

interface GameProps {
  gameUrl: {
    code: string
  }
}

export function Game({ gameUrl: gameData }: GameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);
  const phaserScriptRef = useRef<HTMLScriptElement>(null);
  const scriptRef = useRef<HTMLScriptElement>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [gameName, setGameName] = useState('');

  let code = ''
  try {
    code = gameData.code;
  } catch (e) { console.error(e); }

  useEffect(() => {
    if (!containerRef.current) return;

    // Create Shadow DOM if it doesn't exist
    if (!shadowRootRef.current) {
      shadowRootRef.current = containerRef.current.attachShadow({ mode: 'open' });

      // Create container for the game
      const gameContainer = document.createElement('div');
      gameContainer.className = 'phaser-game';
      gameContainer.style.cssText = 'width: 100%; height: 400px; border: 1px solid #ccc; border-radius: 0.5rem; overflow: hidden;';

      // Create and append scripts to shadow DOM
      const phaserScript = document.createElement('script');
      phaserScript.src = 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js';
      phaserScriptRef.current = phaserScript;

      const gameScript = document.createElement('script');
      gameScript.type = 'module';
      scriptRef.current = gameScript;

      shadowRootRef.current.appendChild(phaserScript);
      shadowRootRef.current.appendChild(gameScript);
      shadowRootRef.current.appendChild(gameContainer);

      // Set up script loading sequence
      phaserScript.onload = () => {
        if (scriptRef.current) {
          let finalCode = '';
          if (!code.includes("function createButton")) {
            finalCode += `// Hilfsfunktionen für die KI zur schnellen Erweiterung
function createButton(scene, text, x, y, callback) {
  let button = scene.add.text(x, y, text, { font: '24px Arial', fill: '#000', backgroundColor: '#444' })
    .setPadding(10)
    .setInteractive()
    .on('pointerdown', callback);
  return button;
}`;
          } else if (!code.includes("function createRandomEntity")) {
            finalCode += `
function createRandomEntity(scene) {
  let x = Phaser.Math.Between(50, 750);
  let y = Phaser.Math.Between(50, 550);
  let entity = scene.add.circle(x, y, 20, 0x000);
  return entity;
}`;
          } 
          if (!code.includes("function gameScore")) {
            finalCode += `function gameScore(gameName, points) {
  fetch('/api/game-score', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gameName: gameName,
      points: points
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Score updated:', data);
    return data.totalPoints;
  })
  .catch(error => {
    console.error('Error updating score:', error);
    return null;
  });
}`;
          }

          finalCode += code;
          gameScript.innerHTML = finalCode;
        }
      };
    }

    return () => {
      if (shadowRootRef.current) {
        // Clean up scripts and container
        while (shadowRootRef.current.firstChild) {
          shadowRootRef.current.removeChild(shadowRootRef.current.firstChild);
        }
        // Clean up any existing game instance
        if ((window as any).game) {
          (window as any).game.destroy(true);
        }
      }
    };
  }, [code]);

  return (
    <div class="relative">
      <div class="absolute top-2 right-2 z-10 flex space-x-2">
        <input
          type="text"
          value={gameName}
          onChange={(e) => setGameName((e.target as HTMLInputElement).value)}
          placeholder="Game name"
          class="px-2 py-1 text-sm border rounded"
        />
        <button
          onClick={async () => {
            if (!gameName) {
              alert('Please enter a game name');
              return;
            }
            try {
              const response = await fetch('/api/saved-games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: gameName, code: code })
              });
              const data = await response.json();
              if (data.success) {
                alert('Game saved successfully!');
                setGameName('');
              } else {
                alert('Failed to save game: ' + data.error);
              }
            } catch (error) {
              console.error('Error saving game:', error);
              alert('Failed to save game');
            }
          }}
          class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
        >
          Save Game
        </button>
        <button
          onClick={() => setShowRaw(!showRaw)}
          class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          {showRaw ? 'Show Preview' : 'Show Raw'}
        </button>
      </div>
      {showRaw ? (
        <pre class="w-full h-[400px] border rounded-lg overflow-auto bg-gray-50 p-4 font-mono text-sm">
          {code}
        </pre>
      ) : (
        <div ref={containerRef} class="w-full h-[400px]" />
      )}
    </div>
  );
}