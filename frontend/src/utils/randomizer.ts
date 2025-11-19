import type { Person } from '../types';

/**
 * Fisher-Yates shuffle algorithm
 * Randomly shuffles an array in place
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get a randomized list of people for learning mode
 * Ensures all people are shown equally before reshuffling
 */
export function getRandomizedPeople(people: Person[]): Person[] {
  return shuffleArray(people);
}

/**
 * Get full name display for a person
 */
export function getFullName(person: Person): string {
  const parts = [];

  if (person.first_name) parts.push(person.first_name);
  if (person.middle_name) parts.push(person.middle_name);
  if (person.last_name) parts.push(person.last_name);
  if (person.suffix) parts.push(person.suffix);

  return parts.join(' ');
}

/**
 * Get display name (nickname if available, otherwise full name)
 */
export function getDisplayName(person: Person): string {
  if (person.nickname) {
    return `${person.first_name} "${person.nickname}" ${person.last_name || ''}`.trim();
  }
  return getFullName(person);
}
