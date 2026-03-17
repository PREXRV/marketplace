'use client';

import { motion } from 'framer-motion';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const emojis = [
  '😊', '😂', '🤣', '❤️', '😍', '😘', '👍', '👏', '🙏', '🔥',
  '💯', '✨', '🎉', '🎊', '🤔', '😎', '🥳', '😇', '🤗', '🤩',
  '😋', '😜', '🤪', '😏', '😌', '😴', '🤤', '👀', '💪', '🙌'
];

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-2xl p-4 grid grid-cols-5 gap-2 z-50"
      >
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="text-2xl hover:bg-purple-50 rounded-lg p-2 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </motion.div>
    </>
  );
}
