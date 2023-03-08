import { useStreamerbot, UseStreamerbotOptions } from "@streamerbot/vue";
import { onMounted, onUnmounted, Ref } from "vue";

export interface TwitchUser {
  id: number;
  login: string;
  display_name: string;
  subscribed: boolean;
  role: 1 | 2 | 3 | 4;
}

export interface StreamerbotEvent<T = unknown> {
  timeStamp: string;
  event: {
    source: string;
    type: string;
  };
  data: T;
}

export type FirstWordEvent = StreamerbotEvent<{
  message: string;
  action: boolean;
  user: TwitchUser;
}>;

export type AdRunEvent = StreamerbotEvent<{
  length: number;
  scheduled: boolean;
}>;

export type ChatMessageEvent = StreamerbotEvent<{
  message: {
    internal: boolean;
    msgId: string;
    userId: string;
    username: string;
    role: 1 | 2 | 3 | 4;
    subscriber: boolean;
    displayName: string;
    color: string;
    channel: string;
    message: string;
    isHighlighted: boolean;
    isMe: boolean;
    isCustomReward: boolean;
    isAnonymous: boolean;
    isReply: boolean;
    bits: number;
    firstMessage: boolean;
    hasBits: boolean;
    emotes: unknown[];
    cheerEmotes: unknown[];
    badges: unknown[];
    monthsSubscribed: number;
    isTest: boolean;
  };
}>;

export type StreamElementsTipEvent = StreamerbotEvent<{
  id: string;
  username: string;
  amount: number;
  currency: string;
  message: string;
  isTest: boolean;
}>;

export function defineHandler<T extends StreamerbotEvent>(handler: (data: T) => void) {
  return handler as (data: unknown) => void;
}

export function useStreamerbotClient(options?: Partial<UseStreamerbotOptions>) {
  const { client, status, data, connect, disconnect, error } = useStreamerbot({
    autoReconnect: true,
    ...options
  });

  onMounted(() => connect());
  onUnmounted(() => disconnect());

  return { client, status, data: data as Ref<StreamerbotEvent | undefined>, error };
}