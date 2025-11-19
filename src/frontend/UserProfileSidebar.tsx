import React, { useState } from 'react';
import {
  X,
  Phone,
  Video,
  Search,
  Bell,
  BellOff,
  Star,
  Trash2,
  LogOut,
  Image,
  FileText,
  Link as LinkIcon,
  ChevronDown,
  MapPin,
  Mail,
  Calendar,
  Users,
  Shield,
  Settings,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
  bio?: string;
  location?: string;
  joinedAt?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface ChatRoom {
  id: string;
  type: 'direct' | 'group';
  isMuted: boolean;
  isStarred: boolean;
  members?: User[];
}

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'file' | 'link';
  url: string;
  name?: string;
  timestamp: string;
}

interface UserProfileSidebarProps {
  user: User;
  room: ChatRoom;
  currentUserId: string;
  sharedMedia?: MediaItem[];
  onClose: () => void;
  onCall: (type: 'audio' | 'video') => void;
  onMute: () => void;
  onStar: () => void;
  onBlock: () => void;
  onDelete: () => void;
  onLeaveGroup?: () => void;
}

export default function UserProfileSidebar({
  user,
  room,
  currentUserId,
  sharedMedia = [],
  onClose,
  onCall,
  onMute,
  onStar,
  onBlock,
  onDelete,
  onLeaveGroup,
}: UserProfileSidebarProps) {
  const [activeTab, setActiveTab] = useState<'media' | 'files' | 'links'>('media');
  const [expandedSection, setExpandedSection] = useState<string | null>('about');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatLastSeen = (lastSeen: string): string => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Active now';
    if (diff < 3600000) return `Active ${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `Active ${Math.floor(diff / 3600000)}h ago`;
    return `Last seen ${date.toLocaleDateString()}`;
  };

  const mediaByType = {
    images: sharedMedia.filter((m) => m.type === 'image'),
    files: sharedMedia.filter((m) => m.type === 'file'),
    links: sharedMedia.filter((m) => m.type === 'link'),
  };

  return (
    <div className="w-80 h-screen bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {room.type === 'group' ? 'Group Info' : 'Contact Info'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile Section */}
        <div className="p-6 flex flex-col items-center border-b border-gray-200">
          <div className="relative mb-4">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=128&background=random`}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            {user.isOnline && (
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full"></div>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h3>
          
          <p className="text-sm text-gray-500 mb-4">
            {user.isOnline ? 'Online' : user.lastSeen ? formatLastSeen(user.lastSeen) : 'Offline'}
          </p>

          {user.bio && (
            <p className="text-sm text-gray-700 text-center mb-4 px-4">
              {user.bio}
            </p>
          )}

          {/* Quick Actions */}
          <div className="flex gap-4 w-full justify-center">
            <button
              onClick={() => onCall('audio')}
              className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="p-3 bg-green-500 rounded-full">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-gray-600">Audio</span>
            </button>
            
            <button
              onClick={() => onCall('video')}
              className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="p-3 bg-blue-500 rounded-full">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-gray-600">Video</span>
            </button>
            
            <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 rounded-lg transition">
              <div className="p-3 bg-gray-200 rounded-full">
                <Search className="w-5 h-5 text-gray-700" />
              </div>
              <span className="text-xs text-gray-600">Search</span>
            </button>
          </div>
        </div>

        {/* About Section */}
        {room.type === 'direct' && (
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('about')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <span className="font-semibold text-gray-900">About</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  expandedSection === 'about' ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {expandedSection === 'about' && (
              <div className="px-4 pb-4 space-y-3">
                {user.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{user.email}</p>
                    </div>
                  </div>
                )}
                
                {user.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}
                
                {user.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm text-gray-900">{user.location}</p>
                    </div>
                  </div>
                )}
                
                {user.joinedAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Joined</p>
                      <p className="text-sm text-gray-900">
                        {new Date(user.joinedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Group Members Section */}
        {room.type === 'group' && room.members && (
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('members')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">Members</span>
                <span className="text-sm text-gray-500">({room.members.length})</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  expandedSection === 'members' ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {expandedSection === 'members' && (
              <div className="px-4 pb-4 space-y-2">
                {room.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="relative">
                      <img
                        src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=40&background=random`}
                        alt={member.name}
                        className="w-10 h-10 rounded-full"
                      />
                      {member.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">
                        {member.isOnline ? 'Online' : member.lastSeen ? formatLastSeen(member.lastSeen) : 'Offline'}
                      </p>
                    </div>
                    {member.id === currentUserId && (
                      <span className="text-xs text-blue-500 font-medium">You</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shared Media Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('media')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">Shared Media</span>
              <span className="text-sm text-gray-500">({sharedMedia.length})</span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSection === 'media' ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {expandedSection === 'media' && (
            <div className="px-4 pb-4">
              {/* Media Tabs */}
              <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('media')}
                  className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition ${
                    activeTab === 'media'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Photos
                </button>
                <button
                  onClick={() => setActiveTab('files')}
                  className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition ${
                    activeTab === 'files'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Files
                </button>
                <button
                  onClick={() => setActiveTab('links')}
                  className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition ${
                    activeTab === 'links'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Links
                </button>
              </div>

              {/* Media Content */}
              {activeTab === 'media' && (
                <div className="grid grid-cols-3 gap-1">
                  {mediaByType.images.length > 0 ? (
                    mediaByType.images.slice(0, 9).map((item) => (
                      <div key={item.id} className="aspect-square bg-gray-100 rounded overflow-hidden">
                        <img
                          src={item.url}
                          alt={item.name || 'Media'}
                          className="w-full h-full object-cover hover:opacity-80 cursor-pointer transition"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-8 text-center">
                      <Image className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No photos shared</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'files' && (
                <div className="space-y-2">
                  {mediaByType.files.length > 0 ? (
                    mediaByType.files.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name || 'File'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No files shared</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'links' && (
                <div className="space-y-2">
                  {mediaByType.links.length > 0 ? (
                    mediaByType.links.map((item) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                      >
                        <div className="p-2 bg-green-100 rounded-lg">
                          <LinkIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {item.name || item.url}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <LinkIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No links shared</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div className="border-b border-gray-200 py-2">
          <button
            onClick={onMute}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition"
          >
            {room.isMuted ? (
              <>
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-900">Unmute notifications</span>
              </>
            ) : (
              <>
                <BellOff className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-900">Mute notifications</span>
              </>
            )}
          </button>
          
          <button
            onClick={onStar}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition"
          >
            <Star className={`w-5 h-5 ${room.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
            <span className="text-sm text-gray-900">
              {room.isStarred ? 'Unstar' : 'Star'} conversation
            </span>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="py-2">
          {room.type === 'group' && onLeaveGroup && (
            <button
              onClick={onLeaveGroup}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 text-red-600 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Leave group</span>
            </button>
          )}
          
          <button
            onClick={onBlock}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 text-red-600 transition"
          >
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Block {room.type === 'group' ? 'group' : 'user'}</span>
          </button>
          
          <button
            onClick={onDelete}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 text-red-600 transition"
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-sm font-medium">Delete conversation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
