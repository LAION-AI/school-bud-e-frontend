// Format configuration interfaces and types

// Base interface for all format types
export interface BaseFormat {
  type: string;
}

// Game JSON format
export interface GameJson extends BaseFormat {
  type: 'game';
  content: {
    topic: string;
    description: string;
    explanation: string;
    code: string;
  };
}

// Graph JSON format
export interface GraphJson extends BaseFormat {
  type: 'graph';
  nodes: Array<{
    id: string;
    label: string;
    type?: string;
    properties?: Record<string, unknown>;
  }>;
  edges: Array<{
    source: string;
    target: string;
    label?: string;
    properties?: Record<string, unknown>;
  }>;
}

// Web result JSON format
export interface WebResultJson extends BaseFormat {
  type: 'webresult';
  url: string;
  title: string;
  snippet: string;
  metadata?: {
    lastUpdated?: string;
    source?: string;
    [key: string]: unknown;
  };
}

// Flashcards JSON format
export interface FlashcardsJson extends BaseFormat {
  type: 'flashcards';
  cards: Array<{
    id: string;
    front: string;
    back: string;
    tags?: string[];
    metadata?: {
      created?: string;
      lastReviewed?: string;
      difficulty?: number;
      [key: string]: unknown;
    };
  }>;
}

// Union type of all supported formats
export type SupportedFormat = GraphJson | WebResultJson | FlashcardsJson | GameJson;

// Format templates and metadata
export const formatTemplates = {
  webresult: {
    template: `\`\`\`webresultjson
{
  "type": "webResults",
  "results": [
    {
      "url": "string",
      "title": "string",
      "description": "string",
    }
  ]
}
endwebresultjson\`\`\``,
    description: 'For search results (webResults) it\'s important to write the webresults type',
    requirements: [],
  },
  graph: {
    template: `\`\`\`json
{
  "type": "graph",
  "nodes": [
    {
      "id": "string",
      "label": "string",
      "type": "string",
      "properties": {}
    }
  ],
  "edges": [
    {
      "source": "string",
      "target": "string",
      "label": "string",
      "properties": {}
    }
  ]
}
\`\`\``,
    description: 'For graph data it\'s important to write the grapjson type',
    requirements:[]
  },
  flashcards: {
    template: `\`\`\`flashcardsjson
{
  "type": "flashcards",
  "cards": [
    {
      "id": "string",
      "front": "string",
      "back": "string",
      "tags": ["string"],
      "metadata": {
        "created": "string",
        "lastReviewed": "string",
        "difficulty": 0
      }
    }
  ]
}
\`\`\``,
    description: 'For flashcards it\'s important to write the flashcardsjson type',
    requirements:[]
  },
  game: {
    template: `\`\`\`json
{ "type": "game", "content": { "topic": "string", "description": "string", "explanation": "string", "code": "string" } }
\`\`\``,
    description: 'For game content it\'s important to write the json type',
    requirements: [
      'Game must use Phaser.js and JavaScript.',
      'The json must not have any comments or linebreaks.',
      'Background should be white',
      'Do not use HTML.',
      'Should initialize and increment globalThis on correct answers',
      'Remove text when displaying right/wrong outputs',
      'Position game within container, not at end of body',
      'Should not include external assets',
    ],
    defaultConfig: {
      type: 'Phaser.AUTO',
      width: 800,
      height: 600,
      backgroundColor: '#fff'
    }
  }
};

// Type guard functions
export const isGraphJson = (format: BaseFormat): format is GraphJson => {
  return format.type === 'graph';
};

export const isWebResultJson = (format: BaseFormat): format is WebResultJson => {
  return format.type === 'webresult';
};

export const isFlashcardsJson = (format: BaseFormat): format is FlashcardsJson => {
  return format.type === 'flashcards';
};

export const isGameJson = (format: BaseFormat): format is GameJson => {
  return format.type === 'game';
};