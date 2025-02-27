import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";

/**
 * Feature capabilities that Bud-E can provide based on API keys
 */
interface Capability {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export default function FloatingToolGuide({ lang = "en" }: { lang?: string }) {
  const isExpanded = useSignal(false);
  const capabilities = useSignal<Capability[]>([
    {
      id: "chat",
      title: lang === "de" ? "Text-Chat" : "Text Chat",
      description: lang === "de" 
        ? "Bud-E kann mit dir über Text kommunizieren." 
        : "Bud-E can communicate with you through text.",
      icon: "💬",
      enabled: true // Always enabled
    },
    {
      id: "vision",
      title: lang === "de" ? "Bild-Verständnis" : "Image Understanding",
      description: lang === "de" 
        ? "Bud-E kann Bilder sehen und verstehen, die du hochlädst." 
        : "Bud-E can see and understand images you upload.",
      icon: "👁️",
      enabled: false
    },
    {
      id: "speak",
      title: lang === "de" ? "Sprachausgabe" : "Voice Output",
      description: lang === "de" 
        ? "Bud-E kann mit dir sprechen und Text in gesprochene Sprache umwandeln." 
        : "Bud-E can speak to you and convert text to speech.",
      icon: "🔊",
      enabled: false
    },
    {
      id: "listen",
      title: lang === "de" ? "Spracherkennung" : "Voice Recognition",
      description: lang === "de" 
        ? "Bud-E kann zuhören und deine gesprochene Sprache verstehen." 
        : "Bud-E can listen and understand your spoken words.",
      icon: "🎤",
      enabled: false
    }
  ]);
  const tourSteps = useSignal([
    { id: 'basics', title: lang === "de" ? "Grundlagen" : "Basics", completed: false },
    { id: 'chat', title: lang === "de" ? "Chat-Funktionen" : "Chat Features", completed: false },
    { id: 'api-setup', title: lang === "de" ? "API-Einrichtung" : "API Setup", completed: false },
    { id: 'voice', title: lang === "de" ? "Sprachfunktionen" : "Voice Features", completed: false }
  ]);
  
  // Check for enabled capabilities on component mount
  useEffect(() => {
    if (!IS_BROWSER) return;
    
    const checkCapabilities = () => {
      const settings = JSON.parse(localStorage.getItem("settings") || "{}");
      
      // Update capabilities based on available API keys
      capabilities.value = capabilities.value.map(cap => {
        let enabled = cap.id === "chat"; // Chat is always enabled
        
        if (settings.universalApiKey) {
          // Universal key may enable multiple capabilities based on its format/provider
          enabled = true;
        } else {
          // Check individual keys
          switch (cap.id) {
            case "vision":
              enabled = !!settings.vlmKey;
              break;
            case "speak":
              enabled = !!settings.ttsKey;
              break;
            case "listen":
              enabled = !!settings.sttKey;
              break;
          }
        }
        
        return { ...cap, enabled };
      });
    };
    
    checkCapabilities();
    
    // Listen for storage changes to update capabilities
    const handleStorageChange = () => {
      checkCapabilities();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [capabilities]);
  
  // Calculate progress
  const progress = tourSteps.value.filter(step => step.completed).length / tourSteps.value.length * 100;
  
  const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value;
  };
  
  const startTour = (tourId: string) => {
    // In a real implementation, this would be connected to a tour system
    console.log(`Starting tour: ${tourId}`);
    
    // For now, we'll just mark it as completed after a delay
    setTimeout(() => {
      tourSteps.value = tourSteps.value.map(step => 
        step.id === tourId ? { ...step, completed: true } : step
      );
    }, 1000);
    
    // Navigate to appropriate page based on tour
    if (tourId === 'api-setup') {
      window.location.href = '/settings';
    }
  };
  
  const navigateToSettings = () => {
    window.location.href = '/settings';
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-lg transition-all duration-300 z-40 max-w-md ${isExpanded.value ? 'w-80' : 'w-12'}`}
    >
      <button 
        onClick={toggleExpanded}
        className="absolute -top-3 -left-3 bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-indigo-700 transition-colors"
        aria-label={isExpanded.value ? "Collapse guide" : "Expand guide"}
        type="button"
      >
        {isExpanded.value ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
            <title>Close</title>
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
            <title>Help</title>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      
      {isExpanded.value ? (
        <div className="p-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-indigo-900">
              {lang === "de" ? "Bud-E Assistent" : "Bud-E Assistant"}
            </h3>
            <span className="text-xs text-gray-500">{Math.round(progress)}% {lang === "de" ? "abgeschlossen" : "complete"}</span>
          </div>
          
          {/* Capability Section */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {lang === "de" ? "Verfügbare Fähigkeiten" : "Available Capabilities"}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {capabilities.value.map(cap => (
                <div 
                  key={cap.id}
                  className={`p-2 rounded-lg border ${cap.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} flex items-start`}
                >
                  <span className="text-xl mr-2">{cap.icon}</span>
                  <div>
                    <div className="text-sm font-medium">
                      {cap.title}
                      {cap.enabled ? (
                        <span className="ml-1 text-green-600 text-xs">✓</span>
                      ) : (
                        <span className="ml-1 text-gray-400 text-xs">✗</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cap.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {!capabilities.value.every(cap => cap.enabled) && (
              <button
                onClick={navigateToSettings}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
                  <title>Settings</title>
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                {lang === "de" ? "Alle Funktionen aktivieren" : "Enable all capabilities"}
              </button>
            )}
          </div>
          
          {/* Tour Guide Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {lang === "de" ? "Bud-E Kennenlernen" : "Learn Bud-E"}
            </h4>
            <div className="space-y-2 mb-3">
              {tourSteps.value.map(step => (
                <div key={step.id} className="flex items-center justify-between">
                  <span className={`text-sm ${step.completed ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                    {step.title}
                  </span>
                  {step.completed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
                      <title>Completed</title>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <button 
                      onClick={() => startTour(step.id)}
                      className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-800 py-1 px-2 rounded transition-colors"
                      type="button"
                    >
                      {lang === "de" ? "Starten" : "Start"}
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
              <div 
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {progress === 100 ? (
              <div className="bg-green-50 border border-green-200 rounded p-2 text-green-800 text-xs">
                🎉 {lang === "de" ? "Herzlichen Glückwunsch! Du hast alle Einführungen abgeschlossen." : "Congratulations! You've completed all tours."}
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 text-blue-800 text-xs">
                {lang === "de" ? "Entdecke alle Funktionen, um das Beste aus Bud-E herauszuholen!" : "Discover all features to get the most out of Bud-E!"}
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={toggleExpanded}
          onKeyUp={(e) => e.key === 'Enter' && toggleExpanded()}
          className="p-2 w-full h-full cursor-pointer focus:outline-none"
          aria-label={lang === "de" ? "Assistenten erweitern" : "Expand assistant"}
          type="button"
        >
          <div className="w-full bg-gray-200 rounded-full h-8 flex items-center justify-center">
            <div 
              className="bg-indigo-600 h-8 rounded-full transition-all duration-500 flex items-center justify-center" 
              style={{ width: `${progress}%` }}
            />
            <span className="absolute text-xs font-bold text-white">{Math.round(progress)}%</span>
          </div>
        </button>
      )}
    </div>
  );
} 