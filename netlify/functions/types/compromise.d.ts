// Type declarations for compromise (no official types exist)

declare module 'compromise' {
  interface CompromiseDoc {
    sentences(): CompromiseSentences;
    nouns(): CompromiseNouns;
    verbs(): CompromiseVerbs;
    adjectives(): CompromiseAdjectives;
    places(): CompromisePlaces;
    people(): CompromisePeople;
    organizations(): CompromiseOrganizations;
    out(format: 'array'): string[];
    out(format: 'text'): string;
  }

  interface CompromiseSentences {
    out(format: 'array'): string[];
    out(format: 'text'): string;
  }

  interface CompromiseNouns {
    out(format: 'array'): string[];
    out(format: 'text'): string;
  }

  interface CompromiseVerbs {
    out(format: 'array'): string[];
    out(format: 'text'): string;
  }

  interface CompromiseAdjectives {
    out(format: 'array'): string[];
    out(format: 'text'): string;
  }

  interface CompromisePlaces {
    out(format: 'array'): string[];
    out(format: 'text'): string;
  }

  interface CompromisePeople {
    out(format: 'array'): string[];
    out(format: 'text'): string;
  }

  interface CompromiseOrganizations {
    out(format: 'array'): string[];
    out(format: 'text'): string;
  }

  function compromise(text: string): CompromiseDoc;
  export default compromise;
}