import { useEffect, useRef, useState } from "preact/hooks";

const buildCode = (scriptRef:any, code: string) => {
  let finalCode = '';
  if (scriptRef.current) {
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
  }
  return finalCode;
}
interface GameProps {
  gameUrl: {
    code: string
  }
}

export function Game({ gameUrl: gameData }: GameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);
  const phaserScriptRef = useRef<HTMLScriptElement>(null);
  const phaserRexScriptRef = useRef<HTMLScriptElement>(null);
  const scriptRef = useRef<HTMLScriptElement>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [gameName, setGameName] = useState('');
  let code = ''
  try {
    code = gameData.code;
  } catch (e) { console.error(e); }
  const [editableCode, setEditableCode] = useState(code);


  useEffect(() => {
    if(code === "") return;
    if (!containerRef.current) return;
    setEditableCode(code);

    // Create Shadow DOM if it doesn't exist
    if (!shadowRootRef.current) {
      // shadowRootRef.current = containerRef.current.attachShadow({ mode: 'open' });

      // Create container for the game
      const gameContainer = document.createElement('div');
      gameContainer.id = 'phaser-game';
      gameContainer.style.cssText = 'width: 800px; height: 600px; border: 1px solid #ccc; border-radius: 0.5rem; overflow: hidden;';

      // Create and append scripts to shadow DOM
      const phaserScript = document.createElement('script');
      phaserScript.src = 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js';
      phaserScriptRef.current = phaserScript;

      const phaserRexScript = document.createElement('script');
      phaserRexScript.src = '/games/rexuiplugin.min.js';
      phaserRexScriptRef.current = phaserRexScript;

      const gameScript = document.createElement('script');
      gameScript.type = 'module';
      scriptRef.current = gameScript;

      containerRef.current.appendChild(phaserScript);
      containerRef.current.appendChild(phaserRexScript);
      containerRef.current.appendChild(gameScript);
      containerRef.current.appendChild(gameContainer);



      let rexLoaded = false;
      phaserRexScript.onload = () => {
        rexLoaded = true;
      }
      // Set up script loading sequence
      phaserScript.onload = () => {
        console.log("Phaser Script loaded")
        if (rexLoaded) {
          console.log("Rex loaded before phaser")
          gameScript.innerHTML = buildCode(scriptRef, code);
        } else {
          console.log("Waiting for Rex to Load")
          phaserRexScript.addEventListener('load', () => {
            console.log("Rex loaded after phaser")
            gameScript.innerHTML = buildCode(scriptRef, code);
          });
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
            const codeToSave = showRaw ? editableCode : code;
            const name = gameName || gameData.name;

            if (!name) {
              alert('Please enter a game name');
              return;
            }
            try {
              const response = await fetch('/api/game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, code: codeToSave})
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
        <textarea
          class="w-full h-[400px] border rounded-lg overflow-auto bg-gray-50 p-4 font-mono text-sm"
          value={editableCode}
          onChange={(e) => setEditableCode((e.target as HTMLTextAreaElement).value)}
        />
      ) : (
        <div ref={containerRef} class="w-full h-[400px]" />
      )}
    </div>
  );
}