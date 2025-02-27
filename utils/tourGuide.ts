// Replace the entire file with:
import { signal } from "@preact/signals";
import Shepherd from "npm:shepherd.js@14.5.0";

// Define types for Shepherd Tour to avoid namespace errors
type ShepherdTour = any; // Using any temporarily to bypass type issues

// Define types for tours
export interface TourInfo {
  steps: any;
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

// Create a signal to track tours
export const tours = signal<TourInfo[]>([
  { 
    id: 'basics', 
    title: 'Basic Tour', 
    description: 'Learn the basic features of the application', 
    completed: false 
  },
  { 
    id: 'chat', 
    title: 'Chat Features', 
    description: 'Explore advanced chat capabilities', 
    completed: false 
  },
  { 
    id: 'api-setup', 
    title: 'API Setup', 
    description: 'Learn how to set up API keys for full functionality', 
    completed: false 
  }
]);

// Store the tour instances
const tourInstances: Record<string, ShepherdTour> = {};

// Initialize the Shepherd tour guide
export function initTourGuide() {
  if (typeof window === "undefined") return;
  
  // Set up the basic tour
  setupBasicsTour();
  
  // Set up additional tours
  setupChatTour();
  setupApiSetupTour();
}

// Function to set up the basics tour
function setupBasicsTour() {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shadow-md bg-white rounded-lg',
      scrollTo: true,
      cancelIcon: {
        enabled: true
      }
    }
  });

  tour.addStep({
    id: 'welcome',
    title: 'Welcome to Bud-E!',
    text: 'This brief tour will guide you through the basics of using Bud-E.',
    attachTo: {
      element: 'body',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Skip',
        action: tour.cancel
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    id: 'settings',
    title: 'Settings',
    text: 'Click here to open settings and configure your API keys.',
    attachTo: {
      element: '[data-tour="open-settings-button"]',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    id: 'chat-input',
    title: 'Chat Input',
    text: 'Type your messages here to chat with Bud-E.',
    attachTo: {
      element: '.message-input',
      on: 'top'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    id: 'finish',
    title: 'All Set!',
    text: 'You now know the basics. Enjoy chatting with Bud-E!',
    attachTo: {
      element: 'body',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Finish',
        action: tour.complete
      }
    ]
  });

  // On complete, mark this tour as completed
  tour.on('complete', () => {
    markTourComplete('basics');
  });

  // Store the tour
  tourInstances.basics = tour;
}

// Set up the chat tour
function setupChatTour() {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shadow-md bg-white rounded-lg',
      scrollTo: true
    }
  });

  // Add steps specific to chat features
  tour.addStep({
    id: 'chat-welcome',
    title: 'Chat Features',
    text: 'Let\'s explore the advanced chat capabilities.',
    attachTo: {
      element: 'body',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  // Add more steps as needed

  // On complete, mark this tour as completed
  tour.on('complete', () => {
    markTourComplete('chat');
  });

  // Store the tour
  tourInstances.chat = tour;
}

// Set up the API setup tour
function setupApiSetupTour() {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shadow-md bg-white rounded-lg',
      scrollTo: true
    }
  });

  // Add steps specific to API setup
  tour.addStep({
    id: 'api-welcome',
    title: 'API Setup',
    text: 'Let\'s set up your API keys for full functionality.',
    attachTo: {
      element: 'body',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  // Add more steps as needed

  // On complete, mark this tour as completed
  tour.on('complete', () => {
    markTourComplete('api-setup');
  });

  // Store the tour
  tourInstances['api-setup'] = tour;
}

// Function to add a new tour
export function addTour(id: string, title: string, description: string) {
  // Add to the tours signal
  tours.value = [...tours.value, {
    id,
    title,
    description,
    completed: false
  }];
  
  // Create a new tour instance
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shadow-md bg-white rounded-lg',
      scrollTo: true
    }
  });
  
  // Add a placeholder step
  tour.addStep({
    id: 'welcome',
    title: title,
    text: description,
    attachTo: {
      element: 'body',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Finish',
        action: tour.complete
      }
    ]
  });
  
  // On complete, mark as completed
  tour.on('complete', () => {
    markTourComplete(id);
  });
  
  // Store the tour
  tourInstances[id] = tour;
}

// Mark a tour as completed
function markTourComplete(tourId: string) {
  tours.value = tours.value.map(tour => 
    tour.id === tourId ? { ...tour, completed: true } : tour
  );
  
  // Dispatch a custom event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tour:complete', { 
      detail: { tourId } 
    }));
  }
}

// Helper to start a specific tour
export function startTour(tourId = 'basics') {
  // Initialize tour guide if needed
  if (Object.keys(tourInstances).length === 0) {
    initTourGuide();
  }
  
  // Start the requested tour if available
  const tour = tourInstances[tourId];
  if (tour) {
    // Cancel any active tours first
    for (const t of Object.values(tourInstances)) {
      if (t.isActive()) {
        t.cancel();
      }
    }
    
    // Start the requested tour
    tour.start();
  } else {
    console.warn(`Tour '${tourId}' not found`);
  }
}

// Add custom event type
declare global {
  interface WindowEventMap {
    'tour:complete': CustomEvent<{ tourId: string }>;
  }
}

// Augment the window object to recognize Shepherd
declare global {
  interface Window {
    Shepherd: typeof Shepherd;
  }
} 