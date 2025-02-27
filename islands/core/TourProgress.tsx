import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { startTour, addTour, tours } from "../../utils/tourGuide.ts";

interface TourStep {
  id: string;
  title: string;
  completed: boolean;
}

export default function TourProgress() {
  const tourSteps = useSignal<TourStep[]>([
    { id: 'basics', title: 'Basics', completed: false },
    { id: 'apiSetup', title: 'API Setup', completed: false },
    { id: 'chat', title: 'Chat Basics', completed: false },
    { id: 'voice', title: 'Voice Features', completed: false },
    { id: 'images', title: 'Image Features', completed: false },
    { id: 'advanced', title: 'Advanced Features', completed: false },
  ]);
  
  const isExpanded = useSignal(false);
  
  useEffect(() => {
    // Register all tours - addTour expects (id, title, description)
    for (const [tourId, tourTitle] of [
      ['apiSetup', 'API Setup', 'Learn how to set up API keys'],
      ['voice', 'Voice Features', 'Explore voice input and output features'],
      ['images', 'Image Features', 'Learn how to use image recognition'],
      ['advanced', 'Advanced Features', 'Discover advanced capabilities']
    ]) {
      // Only register if not already registered in the initialization
      if (tourId !== 'basics' && tourId !== 'chat') {
        addTour(tourId, tourTitle, 'Learn about Bud-E features');
      }
    }
    
    // Listen for tour completion events
    const handleTourComplete = (event: CustomEvent) => {
      const { tourId } = event.detail;
      // Mark the completed tour
      tourSteps.value = tourSteps.value.map(step => 
        step.id === tourId ? { ...step, completed: true } : step
      );
    };
    
    window.addEventListener('tourguide:complete', handleTourComplete as EventListener);
    
    return () => {
      window.removeEventListener('tourguide:complete', handleTourComplete as EventListener);
    };
  }, [tourSteps]);

  const totalCompleted = tourSteps.value.filter(step => step.completed).length;
  const progress = (totalCompleted / tourSteps.value.length) * 100;
  
  const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value;
  };
  
  const handleStartTour = (tourId: string) => {
    startTour(tourId);
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-lg transition-all duration-300 z-40 ${isExpanded.value ? 'w-64' : 'w-12'}`}
      data-tour="tour-progress"
    >
      <button 
        onClick={toggleExpanded}
        className="absolute -top-3 -left-3 bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-indigo-700 transition-colors"
        type="button"
        aria-label={isExpanded.value ? "Collapse tour progress" : "Expand tour progress"}
      >
        {isExpanded.value ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
            <title>Close</title>
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
            <title>Tour Help</title>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      
      {isExpanded.value ? (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 text-indigo-900">Tour Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <ul className="space-y-2 mb-4">
            {tourSteps.value.map(step => (
              <li key={step.id} className="flex items-center justify-between">
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
                    onClick={() => handleStartTour(step.id)}
                    className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-800 py-1 px-2 rounded transition-colors"
                    type="button"
                  >
                    Start
                  </button>
                )}
              </li>
            ))}
          </ul>
          
          <div className="text-xs text-gray-500 mb-2">
            {totalCompleted} of {tourSteps.value.length} completed
          </div>
          
          {progress === 100 ? (
            <div className="bg-green-50 border border-green-200 rounded p-2 text-green-800 text-xs">
              🎉 Congratulations! You've mastered all the basics.
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-blue-800 text-xs">
              Continue exploring to unlock your full potential!
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={toggleExpanded}
          className="p-2 w-full h-full cursor-pointer focus:outline-none"
          type="button"
          aria-label="Expand tour progress"
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