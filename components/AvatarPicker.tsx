'use client';

const ANIMALS = [
  { emoji: '🦊', name: 'Rubah' },
  { emoji: '🐉', name: 'Naga' },
  { emoji: '🐯', name: 'Harimau' },
  { emoji: '🦅', name: 'Elang' },
  { emoji: '🐻', name: 'Beruang' },
  { emoji: '🐼', name: 'Panda' },
  { emoji: '🦁', name: 'Singa' },
  { emoji: '🐸', name: 'Katak' },
  { emoji: '🐬', name: 'Lumba-lumba' },
  { emoji: '🦋', name: 'Kupu-kupu' },
  { emoji: '🦜', name: 'Nuri' },
  { emoji: '🐙', name: 'Gurita' },
  { emoji: '🦄', name: 'Unicorn' },
  { emoji: '🐰', name: 'Kelinci' },
  { emoji: '🐱', name: 'Kucing' },
  { emoji: '🐶', name: 'Anjing' },
  { emoji: '🐨', name: 'Koala' },
  { emoji: '🦝', name: 'Rakun' },
];

interface Props {
  selected: string;
  onSelect: (emoji: string) => void;
}

export default function AvatarPicker({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {ANIMALS.map((a) => (
        <button
          key={a.emoji}
          onClick={() => onSelect(a.emoji)}
          title={a.name}
          className={`relative w-full aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all duration-200 border-3 ${
            selected === a.emoji
              ? 'border-primary bg-primary/10 shadow-pop scale-110 animate-wobble'
              : 'border-transparent bg-muted/40 hover:bg-muted hover:scale-105 hover:shadow-soft'
          }`}
        >
          {a.emoji}
          {selected === a.emoji && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[8px] flex items-center justify-center font-bold shadow-sm">
              ✓
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
