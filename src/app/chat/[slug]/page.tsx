'use client';

import { useParams } from 'next/navigation';
import ChatRoom from '@/components/chat/ChatRoom';

export default function ChatRoomPage() {
  const params = useParams();
  const roomSlug = params.slug as string;

  return <ChatRoom roomSlug={roomSlug} />;
}
