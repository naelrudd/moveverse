'use client';

export const ANIMAL_AVATARS = [
  { id: 'fox', emoji: '🦊', name: 'Rubah' },
  { id: 'cat', emoji: '🐱', name: 'Kucing' },
  { id: 'dog', emoji: '🐶', name: 'Anjing' },
  { id: 'rabbit', emoji: '🐰', name: 'Kelinci' },
  { id: 'bear', emoji: '🐻', name: 'Beruang' },
  { id: 'panda', emoji: '🐼', name: 'Panda' },
  { id: 'lion', emoji: '🦁', name: 'Singa' },
  { id: 'tiger', emoji: '🐯', name: 'Harimau' },
  { id: 'elephant', emoji: '🐘', name: 'Gajah' },
  { id: 'monkey', emoji: '🐵', name: 'Monyet' },
  { id: 'penguin', emoji: '🐧', name: 'Pinguin' },
  { id: 'owl', emoji: '🦉', name: 'Burung Hantu' },
  { id: 'eagle', emoji: '🦅', name: 'Elang' },
  { id: 'dolphin', emoji: '🐬', name: 'Lumba-lumba' },
  { id: 'whale', emoji: '🐳', name: 'Paus' },
  { id: 'turtle', emoji: '🐢', name: 'Kura-kura' },
  { id: 'frog', emoji: '🐸', name: 'Katak' },
  { id: 'butterfly', emoji: '🦋', name: 'Kupu-kupu' },
  { id: 'dragon', emoji: '🐉', name: 'Naga' },
  { id: 'unicorn', emoji: '🦄', name: 'Unikorn' },
];

interface AvatarPickerProps {
  selected: string;
  onSelect: (emoji: string) => void;
}

export default function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {ANIMAL_AVATARS.map((a) => (
        <button
          key={a.id}
          onClick={() => onSelect(a.emoji)}
          className={`relative w-full aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all border-2 ${
            selected === a.emoji
              ? 'border-primary bg-primary/10 shadow-soft scale-110'
              : 'border-border hover:border-primary/40 hover:bg-muted/50'
          }`}
          title={a.name}
        >
          {a.emoji}
          {selected === a.emoji && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full gradient-grass text-white text-[8px] flex items-center justify-center font-bold">
              ✓
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
