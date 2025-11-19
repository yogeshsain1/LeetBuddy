import React from 'react';

const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
  'Gestures': ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
  'Symbols': ['✅', '❌', '⭐', '🌟', '✨', '💫', '🔥', '💯', '💢', '💥', '💨', '👀', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉'],
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = React.useState<string>('Smileys');

  return (
    <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Pick an emoji</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          ✕
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
        {Object.keys(EMOJI_CATEGORIES).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition ${
              activeCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
        {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, index) => (
          <button
            key={index}
            onClick={() => onSelect(emoji)}
            className="text-2xl hover:bg-gray-100 rounded p-1 transition"
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Quick Reactions */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Quick reactions</p>
        <div className="flex gap-2">
          {['👍', '❤️', '😂', '😮', '😢', '🎉'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="text-2xl hover:bg-gray-100 rounded-full p-2 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
