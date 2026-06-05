import { AVATARS } from '../types';

interface AvatarSelectProps {
  selected: string;
  onChange: (avatar: string) => void;
}

export function AvatarSelect({ selected, onChange }: AvatarSelectProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {AVATARS.map((avatar) => (
        <button
          key={avatar}
          type="button"
          onClick={() => onChange(avatar)}
          className={`text-3xl p-2 rounded-xl transition-all duration-200
            ${selected === avatar
              ? 'bg-emerald-600 scale-110 shadow-lg ring-2 ring-amber-400'
              : 'bg-emerald-900/50 hover:bg-emerald-800 hover:scale-105'
            }`}
        >
          {avatar}
        </button>
      ))}
    </div>
  );
}
