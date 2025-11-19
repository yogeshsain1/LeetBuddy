import React from 'react';

interface Reaction {
  emoji: string;
  userIds: string[];
  users?: { id: string; name: string; avatar?: string }[];
}

interface MessageReactionsProps {
  reactions: Reaction[];
  currentUserId: string;
  onToggleReaction: (emoji: string) => void;
}

export default function MessageReactions({ 
  reactions, 
  currentUserId, 
  onToggleReaction 
}: MessageReactionsProps) {
  const [showTooltip, setShowTooltip] = React.useState<string | null>(null);

  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {reactions.filter(r => r.userIds.length > 0).map((reaction) => {
        const hasReacted = reaction.userIds.includes(currentUserId);
        const count = reaction.userIds.length;

        return (
          <div
            key={reaction.emoji}
            className="relative"
            onMouseEnter={() => setShowTooltip(reaction.emoji)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <button
              onClick={() => onToggleReaction(reaction.emoji)}
              className={`text-sm px-2 py-0.5 rounded-full border transition-all ${
                hasReacted
                  ? 'bg-blue-100 border-blue-300 scale-110'
                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{reaction.emoji}</span>
              <span className={`text-xs font-medium ${hasReacted ? 'text-blue-600' : 'text-gray-600'}`}>
                {count}
              </span>
            </button>

            {/* Tooltip */}
            {showTooltip === reaction.emoji && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                  {reaction.users && reaction.users.length > 0 ? (
                    <div>
                      {reaction.users.slice(0, 3).map((user, idx) => (
                        <div key={user.id}>
                          {user.name}
                          {idx < Math.min(reaction.users!.length, 3) - 1 && ', '}
                        </div>
                      ))}
                      {reaction.users.length > 3 && (
                        <div className="text-gray-400">
                          and {reaction.users.length - 3} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {count} {count === 1 ? 'person' : 'people'} reacted with {reaction.emoji}
                    </div>
                  )}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
