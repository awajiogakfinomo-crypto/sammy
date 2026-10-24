// Script Analysis Service for Netlify Functions
// Ported from server/src/services/scriptAnalysis/index.ts

import compromise from 'compromise';
import type { Scene, ScriptAnalysisResult } from '../../utils/types';

const stopWords = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further',
  'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just',
  'should', 'now', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'i', 'me', 'my',
  'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her',
  'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that',
  'these', 'those', 'am', 'don', 'should', 'now'
]);

const actionVerbs = [
  'run', 'walk', 'jump', 'fly', 'swim', 'drive', 'ride', 'climb', 'fall',
  'sit', 'stand', 'lie', 'sleep', 'wake', 'eat', 'drink', 'cook', 'read',
  'write', 'speak', 'talk', 'listen', 'watch', 'look', 'see', 'find',
  'search', 'work', 'play', 'dance', 'sing', 'laugh', 'cry', 'smile',
  'fight', 'argue', 'hug', 'kiss', 'hold', 'carry', 'push', 'pull',
  'throw', 'catch', 'kick', 'hit', 'break', 'fix', 'build', 'create',
  'make', 'do', 'go', 'come', 'leave', 'arrive', 'depart', 'enter', 'exit',
  'open', 'close', 'start', 'stop', 'begin', 'end', 'change', 'move',
  'turn', 'return', 'bring', 'take', 'give', 'get', 'put', 'set', 'keep'
];

export class ScriptAnalysisService {
  analyze(script: string): ScriptAnalysisResult {
    const doc = compromise(script);
    const sentences = doc.sentences().out('array');

    const scenes: Scene[] = sentences.map((sentence, index) => {
      const s = compromise(sentence);

      // Extract nouns (objects, people, places)
      const nouns = s.nouns().out('array').map(n => n.toLowerCase());

      // Extract verbs (actions)
      const verbs = s.verbs().out('array').map(v => v.toLowerCase());

      // Extract adjectives (descriptions)
      const adjectives = s.adjectives().out('array').map(a => a.toLowerCase());

      // Extract places/locations
      const places = s.places().out('array').map(p => p.toLowerCase());

      // Extract people
      const people = s.people().out('array').map(p => p.toLowerCase());

      // Extract organizations
      const organizations = s.organizations().out('array').map(o => o.toLowerCase());

      // Combine all keywords, filter stop words
      const allKeywords = [
        ...nouns,
        ...verbs,
        ...adjectives,
        ...places,
        ...people,
        ...organizations
      ].filter(k => k.length > 2 && !stopWords.has(k));

      // Create unique keywords
      const uniqueKeywords = [...new Set(allKeywords)];

      // Generate search queries from keywords
      const searchQueries = this.generateSearchQueries(uniqueKeywords, sentence);

      return {
        id: `scene-${index}`,
        text: sentence.trim(),
        order: index,
        keywords: uniqueKeywords,
        searchQueries,
        videos: [],
        images: [],
        selectedVideoIds: [],
        selectedImageIds: [],
      };
    });

    return {
      scenes,
      originalScript: script,
      totalScenes: scenes.length,
    };
  }

  private generateSearchQueries(keywords: string[], sentence: string): string[] {
    const queries: string[] = [];

    // Priority 1: Action + Object combinations
    const actionKeywords = keywords.filter(k => actionVerbs.includes(k));
    const objectKeywords = keywords.filter(k => !actionVerbs.includes(k));

    for (const action of actionKeywords.slice(0, 2)) {
      for (const object of objectKeywords.slice(0, 3)) {
        queries.push(`${action} ${object}`);
      }
    }

    // Priority 2: Location + Action
    // (In a real implementation, we'd identify locations separately)

    // Priority 3: Top noun phrases
    const topKeywords = keywords.slice(0, 5);
    if (topKeywords.length > 0) {
      queries.push(topKeywords.join(' '));
      queries.push(topKeywords.slice(0, 3).join(' '));
    }

    // Priority 4: Full sentence (trimmed)
    const trimmedSentence = sentence.trim().slice(0, 100);
    if (trimmedSentence.length > 10) {
      queries.push(trimmedSentence);
    }

    // Remove duplicates and limit
    return [...new Set(queries)].slice(0, 5);
  }
}

// Export singleton instance
export const scriptAnalysisService = new ScriptAnalysisService();