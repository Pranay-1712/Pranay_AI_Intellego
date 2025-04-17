import React from 'react';

export type CharacterType = 'dumbledore' | 'dobby' | 'snape' | 'standard';

export interface CharacterSelectorProps {
  currentCharacter: CharacterType;
  onCharacterChange: (character: CharacterType) => void;
}

export function CharacterSelector({ currentCharacter, onCharacterChange }: CharacterSelectorProps) {
  const characters = [
    {
      id: 'dumbledore',
      name: 'Dumbledore',
      icon: '🧙‍♂️',
      description: 'Wise and philosophical headmaster',
      color: 'from-blue-400 to-purple-500'
    },
    {
      id: 'dobby',
      name: 'Dobby',
      icon: '🧝',
      description: 'Enthusiastic and loyal house elf',
      color: 'from-green-400 to-teal-500'
    },
    {
      id: 'snape',
      name: 'Snape',
      icon: '⚗️',
      description: 'Sharp and sarcastic potions master',
      color: 'from-slate-600 to-gray-800'
    },
    {
      id: 'standard',
      name: 'Standard AI',
      icon: '🤖',
      description: 'Regular AI assistant',
      color: 'from-purple-400 to-pink-500'
    },
  ];

  return (
    <div className="character-selector">
      <div className="mb-3 text-sm text-gray-300">Choose who responds:</div>
      <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
        {characters.map((character) => (
          <button
            key={character.id}
            onClick={() => onCharacterChange(character.id as CharacterType)}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
              currentCharacter === character.id
                ? `bg-gradient-to-br ${character.color} shadow-lg scale-105 transform`
                : 'bg-gray-800/40 hover:bg-gray-700/40'
            }`}
            style={{ minHeight: '100px' }}
          >
            <div className="character-icon text-2xl mb-2">{character.icon}</div>
            <div className="character-name font-medium text-sm mb-1">
              {character.name}
            </div>
            <div className="character-description text-xs max-w-[120px] text-center opacity-80">
              {character.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
