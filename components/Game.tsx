import { useEffect, useRef } from "preact/hooks";

interface GameProps {
  gameUrl: string;
}

export function Game({ gameUrl }: GameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);
  const phaserScriptRef = useRef<HTMLScriptElement>(null);
  const scriptRef = useRef<HTMLScriptElement>(null);

  let code = ''
  try {
    code = JSON.parse(gameUrl).content.code;
    console.log('code', code);
  } catch { }

  useEffect(() => {
    if (!containerRef.current) return;
    if(!gameUrl.status === "complete") return;

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
          scriptRef.current.innerHTML = code;
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

  return <div ref={containerRef} />;
}