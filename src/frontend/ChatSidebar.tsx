import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Users, 
  Archive, 
  Pin,
  Check,
  CheckCheck,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Room {
  id: string;
  name: string;
  type: 'direct' | 'group';
  avatar?: string;
  lastMessage?: {
    content: string;
    senderId: string;
    senderName: string;
    timestamp: string;
    status?: 'sent' | 'delivered' | 'read';
  };
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  members?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

interface ChatSidebarProps {
  rooms: Room[];
  activeRoomId?: string;
  currentUserId: string;
  onRoomSelect: (roomId: string) => void;
  onCreateRoom: () => void;
  onSearch: (query: string) => void;
}

export default function ChatSidebar({
  rooms,
  activeRoomId,
  currentUserId,
  onRoomSelect,
  onCreateRoom,
  onSearch,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'groups' | 'archived'>('all');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const filteredRooms = rooms.filter((room) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = room.name.toLowerCase().includes(query);
      const matchesMessage = room.lastMessage?.content.toLowerCase().includes(query);
      if (!matchesName && !matchesMessage) return false;
    }

    // Type filter
    if (filter === 'unread' && room.unreadCount === 0) return false;
    if (filter === 'groups' && room.type !== 'group') return false;
    // Add archived logic if needed

    return true;
  });

  // Sort rooms: pinned first, then by last message time
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    const aTime = a.lastMessage?.timestamp || '0';
    const bTime = b.lastMessage?.timestamp || '0';
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getStatusIcon = (status?: 'sent' | 'delivered' | 'read') => {
    switch (status) {
      case 'sent': return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
          <div className="flex gap-2">
            <button
              onClick={onCreateRoom}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="New chat"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="More options"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 py-3 border-b border-gray-100 overflow-x-auto">
        {[
          { key: 'all', label: 'All Chats' },
          { key: 'unread', label: 'Unread' },
          { key: 'groups', label: 'Groups' },
          { key: 'archived', label: 'Archived' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key as any)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition ${
              filter === item.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {sortedRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Users className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No conversations found</p>
            <p className="text-sm text-gray-400 mt-2">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Start a new chat to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => onRoomSelect(room.id)}
                className={`relative flex items-center gap-3 p-4 cursor-pointer transition ${
                  activeRoomId === room.id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {room.type === 'group' ? (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {room.name.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <img
                      src={room.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.name)}&background=random`}
                      alt={room.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  
                  {/* Online indicator */}
                  {room.isOnline && room.type === 'direct' && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {room.name}
                      </h3>
                      {room.isPinned && (
                        <Pin className="w-3 h-3 text-blue-500 transform rotate-45" />
                      )}
                      {room.isMuted && (
                        <VolumeX className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    {room.lastMessage && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(room.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>

                  {room.lastMessage && (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        {room.lastMessage.senderId === currentUserId && (
                          <div className="flex-shrink-0">
                            {getStatusIcon(room.lastMessage.status)}
                          </div>
                        )}
                        <p className={`text-sm truncate ${
                          room.unreadCount > 0 
                            ? 'text-gray-900 font-medium' 
                            : 'text-gray-500'
                        }`}>
                          {room.type === 'group' && room.lastMessage.senderId !== currentUserId && (
                            <span className="font-medium">{room.lastMessage.senderName}: </span>
                          )}
                          {room.lastMessage.content}
                        </p>
                      </div>

                      {room.unreadCount > 0 && (
                        <div className="flex-shrink-0 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {room.unreadCount > 99 ? '99+' : room.unreadCount}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Group members preview */}
                  {room.type === 'group' && room.members && room.members.length > 0 && !room.lastMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {room.members.slice(0, 3).map(m => m.name).join(', ')}
                      {room.members.length > 3 && ` +${room.members.length - 3}`}
                    </p>
                  )}

                  {/* Last seen for direct chats */}
                  {room.type === 'direct' && !room.isOnline && room.lastSeen && !room.lastMessage && (
                    <p className="text-xs text-gray-400">
                      Last seen {formatTime(room.lastSeen)}
                    </p>
                  )}
                </div>

                {/* Context Menu Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(showMenu === room.id ? null : room.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded-full transition opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>

                {/* Context Menu */}
                {showMenu === room.id && (
                  <div className="absolute right-4 top-16 z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[180px]">
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
                      <Pin className="w-4 h-4" />
                      {room.isPinned ? 'Unpin' : 'Pin'} chat
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
                      {room.isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      {room.isMuted ? 'Unmute' : 'Mute'} notifications
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
                      <Archive className="w-4 h-4" />
                      Archive chat
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
                      <CheckCheck className="w-4 h-4" />
                      Mark as read
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{rooms.length} conversations</span>
          <span>{rooms.reduce((sum, room) => sum + room.unreadCount, 0)} unread</span>
        </div>
      </div>
    </div>
  );
}
