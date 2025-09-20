'use client';

import Image from 'next/image';

interface SlackUser {
  id: string;
  name: string;
  real_name: string;
  display_name: string;
  is_admin: boolean;
  is_owner: boolean;
  is_bot: boolean;
  deleted: boolean;
  tz: string;
}

interface SlackConversation {
  id: string;
  name: string;
  is_private: boolean;
  is_archived: boolean;
  is_member: boolean;
}

interface SlackProfile {
  real_name?: string;
  display_name?: string;
  email?: string;
  image_72?: string;
  phone?: string;
  title?: string;
  status_text?: string;
  status_emoji?: string;
}

interface SaoMessage {
  id: string;
  text: string;
  time: string;
  channel: string;
  status: boolean;
  output: {
    severity: string;
    rationale_short: string;
    violence?: boolean;
    hate?: boolean;
    self_harm?: boolean;
    sexual_content?: boolean;
    sexual_minors?: boolean;
    extremism?: boolean;
  };
}

interface SaoData {
  ok: boolean;
  user: string | SaoMessage[];
}

interface UserDataProps {
  user?: SlackUser;
  profile?: SlackProfile;
  conversations?: SlackConversation[];
  saoData?: SaoData;
}

export default function UserData({ user, profile, conversations, saoData }: UserDataProps) {
  let saoMessages: SaoMessage[] = [];
  if (saoData?.user) {
    saoMessages = typeof saoData.user === 'string' ? JSON.parse(saoData.user) : saoData.user;
  }

  return (
    <div className="space-y-6">
      {saoData && (
        <div className="bg-black/95 border border-red-600 p-4">
          <h3 className="text-red-400 font-mono mb-3">bad shit found ({Array.isArray(saoMessages) ? saoMessages.length : 0})</h3>
          
          {Array.isArray(saoMessages) && saoMessages.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              {saoMessages.map((msg: SaoMessage, index: number) => (
                <div key={index} className="p-3 border border-gray-700 bg-gray-900/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-400 font-mono text-xs">{msg.id}</span>
                    <div className="flex gap-2">
                      <span className={`text-xs font-mono px-2 py-1 border ${
                        msg.output?.severity === 'high' 
                          ? 'text-red-400 border-red-600 bg-red-900/20' 
                          : msg.output?.severity === 'medium'
                          ? 'text-yellow-400 border-yellow-600 bg-yellow-900/20'
                          : 'text-gray-400 border-gray-600 bg-gray-900/20'
                      }`}>
                        {msg.output?.severity || 'low'}
                      </span>
                      <span className={`text-xs font-mono px-2 py-1 border ${
                        msg.status 
                          ? 'text-green-400 border-green-600 bg-green-900/20' 
                          : 'text-yellow-400 border-yellow-600 bg-yellow-900/20'
                      }`}>
                        {msg.status ? 'done' : 'open'}
                      </span>
                    </div>
                  </div>
                  <div className="text-white text-sm mb-2 break-words">&quot;{msg.text}&quot;</div>
                  {msg.output?.rationale_short && (
                    <div className="text-orange-400 text-xs mb-2">{msg.output.rationale_short}</div>
                  )}
                  <div className="text-gray-500 text-xs mb-2">
                    {new Date(msg.time).toLocaleString()} in #{msg.channel}
                  </div>
                  {msg.output && (
                    <div className="flex gap-1">
                      {msg.output.violence && <span className="text-red-400 text-xs bg-red-900/20 px-1 border border-red-600">V</span>}
                      {msg.output.hate && <span className="text-red-400 text-xs bg-red-900/20 px-1 border border-red-600">H</span>}
                      {msg.output.self_harm && <span className="text-red-400 text-xs bg-red-900/20 px-1 border border-red-600">SH</span>}
                      {msg.output.sexual_content && <span className="text-red-400 text-xs bg-red-900/20 px-1 border border-red-600">S</span>}
                      {msg.output.sexual_minors && <span className="text-red-400 text-xs bg-red-900/20 px-1 border border-red-600">M</span>}
                      {msg.output.extremism && <span className="text-red-400 text-xs bg-red-900/20 px-1 border border-red-600">E</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 font-mono text-sm">user is clean</div>
          )}
        </div>
      )}

      {user && (
        <div className="bg-black/95 border border-gray-600 p-4">
          <h3 className="text-green-400 font-mono mb-3">slack basic info</h3>
          <div className="grid grid-cols-2 gap-4 text-sm font-mono">
            <div className="text-gray-300">id: <span className="text-white">{user.id}</span></div>
            <div className="text-gray-300">username: <span className="text-white">{user.name}</span></div>
            <div className="text-gray-300">real name: <span className="text-white">{user.real_name}</span></div>
            <div className="text-gray-300">display name: <span className="text-white">{user.display_name || 'none'}</span></div>
            <div className="text-gray-300">admin: <span className={user.is_admin ? 'text-red-400' : 'text-gray-500'}>{user.is_admin ? 'yes' : 'no'}</span></div>
            <div className="text-gray-300">owner: <span className={user.is_owner ? 'text-red-400' : 'text-gray-500'}>{user.is_owner ? 'yes' : 'no'}</span></div>
            <div className="text-gray-300">bot: <span className={user.is_bot ? 'text-yellow-400' : 'text-gray-500'}>{user.is_bot ? 'yes' : 'no'}</span></div>
            <div className="text-gray-300">deleted: <span className={user.deleted ? 'text-red-400' : 'text-green-400'}>{user.deleted ? 'yes' : 'no'}</span></div>
            <div className="text-gray-300">timezone: <span className="text-white">{user.tz}</span></div>
          </div>
        </div>
      )}

      {profile && (
        <div className="bg-black/95 border border-gray-600 p-4">
          <h3 className="text-green-400 font-mono mb-3">slack profile info</h3>
          <div className="grid grid-cols-1 gap-2 text-sm font-mono">
            {profile.email && <div className="text-gray-300">email: <span className="text-white">{profile.email}</span></div>}
            {profile.phone && <div className="text-gray-300">phone: <span className="text-white">{profile.phone}</span></div>}
            {profile.title && <div className="text-gray-300">title: <span className="text-white">{profile.title}</span></div>}
            {profile.status_text && <div className="text-gray-300">status: <span className="text-white">{profile.status_emoji} {profile.status_text}</span></div>}
            {profile.image_72 && (
              <div className="mt-2">
                <Image src={profile.image_72} alt="avatar" width={64} height={64} className="border border-gray-600" />
              </div>
            )}
          </div>
        </div>
      )}

      {conversations && conversations.length > 0 && (
        <div className="bg-black/95 border border-gray-600 p-4">
          <h3 className="text-green-400 font-mono mb-3">slack channels ({conversations.length})</h3>
          <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
            {conversations.map((conv) => (
              <div key={conv.id} className="text-sm font-mono p-2 border border-gray-700">
                <div className="flex justify-between">
                  <span className="text-white">#{conv.name}</span>
                  <div className="flex gap-2 text-xs">
                    {conv.is_private && <span className="text-red-400">private</span>}
                    {conv.is_archived && <span className="text-gray-500">archived</span>}
                    {conv.is_member && <span className="text-green-400">member</span>}
                  </div>
                </div>
                <div className="text-gray-400 text-xs">{conv.id}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!user && !saoData && (
        <div className="bg-black/95 border border-gray-600 p-4">
          <div className="text-gray-400 font-mono text-sm">no user data found</div>
        </div>
      )}
    </div>
  );
}