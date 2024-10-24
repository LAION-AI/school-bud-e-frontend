// https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition#events
interface SpeechRecognitionEventMap {
  audioend: Event;
  audiostart: Event;
  end: Event;
  error: SpeechRecognitionErrorEvent;
  nomatch: SpeechRecognitionEvent;
  result: SpeechRecognitionEvent;
  soundend: Event;
  soundstart: Event;
  speechend: Event;
  speechstart: Event;
  start: Event;
}

// Adding a construct signature
interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

// https://wicg.github.io/speech-api/#speechreco-section
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  abort(): void;
  start(): void;
  stop(): void;
  // deno-lint-ignore no-explicit-any
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

// https://wicg.github.io/speech-api/#speechrecognitionevent
interface SpeechRecognitionEventInit extends EventInit {
  resultIndex?: number;
  results: SpeechRecognitionResultList;
}

// https://wicg.github.io/speech-api/#dictdef-speechrecognitioneventinit
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

// https://wicg.github.io/speech-api/#enumdef-speechrecognitionerrorcode
type SpeechRecognitionErrorCode =
  | "aborted"
  | "audio-capture"
  | "bad-grammar"
  | "language-not-supported"
  | "network"
  | "no-speech"
  | "not-allowed"
  | "service-not-allowed";

// https://wicg.github.io/speech-api/#speechrecognitionerrorevent
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode;
  readonly message: string;
}

interface Window {
  SpeechRecognition: SpeechRecognitionConstructor;
  webkitSpeechRecognition: SpeechRecognitionConstructor;
}

interface Image {
  type: string;
  image_url: {
    url: string;
    detail: string;
  };
  preview: string;
}

interface TextEvent {
  data: string;
}

interface Message {
  role: string;
  content: string | string[];
}

interface Image {
  type: string;
  image_url: {
    url: string;
    detail: string;
  };
  preview: string;
}

interface AudioFileDict {
  [key: string]: HTMLAudioElement[];
}

interface HeaderContent {
  [key: string]: {
    [key: string]: string;
  };
}

interface InternalizationContent {
  [key: string]: {
    [key: string]: string;
  };
}

interface TextEvent {
  data: string;
}