// ============================================================
// Valorantclutch — Core TypeScript Types
// ============================================================

// --- User & Profile ---
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  main_game: string | null;
  rank: string | null;
  region: string | null;
  social_links: SocialLinks | null;
  is_verified: boolean;
  is_online: boolean;
  last_seen: string | null;
  created_at: string;
  // Computed / joined
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  is_following?: boolean;
}

export interface SocialLinks {
  discord?: string;
  twitch?: string;
  youtube?: string;
  twitter?: string;
  steam?: string;
}

// --- Posts ---
export type PostType = 'text' | 'image' | 'clip' | 'lfg_share';
export type Visibility = 'public' | 'followers' | 'private';

export interface Post {
  id: string;
  author_id: string;
  content: string;
  media_urls: string[];
  post_type: PostType;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  trending_score: number;
  visibility: Visibility;
  created_at: string;
  // Joined
  author?: Profile;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export interface CreatePostInput {
  content: string;
  media_urls?: string[];
  post_type?: PostType;
  visibility?: Visibility;
}

// --- Comments ---
export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  likes_count: number;
  created_at: string;
  // Joined
  author?: Profile;
  replies?: Comment[];
  is_liked?: boolean;
}

// --- Likes ---
export interface Like {
  id: string;
  user_id: string;
  post_id: string | null;
  comment_id: string | null;
  created_at: string;
}

// --- Follows ---
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  // Joined
  follower?: Profile;
  following?: Profile;
}

// --- Conversations & Messages ---
export type ConversationType = 'direct' | 'group';
export type MessageType = 'text' | 'image' | 'system';

export interface Conversation {
  id: string;
  name: string | null;
  type: ConversationType;
  avatar_url: string | null;
  created_by: string;
  last_message_at: string;
  created_at: string;
  // Joined
  members?: Profile[];
  last_message?: Message;
  unread_count?: number;
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media_urls: string[];
  message_type: MessageType;
  created_at: string;
  // Joined
  sender?: Profile;
}

// --- LFG (Looking for Group) ---
export type LFGStatus = 'open' | 'full' | 'in_progress' | 'completed' | 'cancelled';
export type PlayStyle = 'competitive' | 'casual' | 'practice' | 'tournament';
export type Region = 'NA' | 'EU' | 'APAC' | 'KR' | 'BR' | 'LATAM' | 'OCE';

export interface LFGListing {
  id: string;
  creator_id: string;
  game_id: string;
  title: string;
  description: string;
  rank_required: string | null;
  region: Region;
  play_style: PlayStyle;
  slots_total: number;
  slots_filled: number;
  status: LFGStatus;
  scheduled_at: string | null;
  created_at: string;
  // Joined
  creator?: Profile;
  game?: Game;
  members?: LFGMember[];
}

export interface LFGMember {
  id: string;
  listing_id: string;
  user_id: string;
  status: 'accepted' | 'pending' | 'rejected';
  joined_at: string;
  // Joined
  user?: Profile;
}

export interface LFGFilters {
  game_id?: string;
  region?: Region;
  play_style?: PlayStyle;
  rank?: string;
  status?: LFGStatus;
  search?: string;
}

// --- Games ---
export interface Game {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  banner_url: string | null;
  genre: string;
  is_featured: boolean;
}

export interface GameAccount {
  id: string;
  user_id: string;
  game_id: string;
  platform: string;
  gamertag: string;
  stats: GameStats | null;
  synced_at: string | null;
  // Joined
  game?: Game;
}

export interface GameStats {
  rank?: string;
  rank_icon?: string;
  level?: number;
  kd_ratio?: number;
  win_rate?: number;
  hours_played?: number;
  matches_played?: number;
  top_agents?: AgentStats[];
  recent_matches?: MatchSummary[];
}

export interface AgentStats {
  agent_name: string;
  agent_icon: string;
  games_played: number;
  win_rate: number;
  kd_ratio: number;
}

export interface MatchSummary {
  match_id: string;
  map: string;
  agent: string;
  result: 'win' | 'loss' | 'draw';
  score: string;
  kills: number;
  deaths: number;
  assists: number;
  played_at: string;
}

// --- Clips ---
export type ClipStatus = 'processing' | 'ready' | 'failed';

export interface Clip {
  id: string;
  user_id: string;
  game_id: string | null;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  mux_asset_id: string | null;
  mux_playback_id: string | null;
  views_count: number;
  likes_count: number;
  status: ClipStatus;
  created_at: string;
  // Joined
  user?: Profile;
  game?: Game;
}

// --- Notifications ---
export type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'mention'
  | 'lfg_invite'
  | 'lfg_join'
  | 'message'
  | 'clip_ready'
  | 'achievement';

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotificationType;
  message: string;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
  // Joined
  actor?: Profile;
}

// --- Pagination ---
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

// --- UI State ---
export type ModalType =
  | 'create_post'
  | 'create_lfg'
  | 'edit_profile'
  | 'settings'
  | 'media_viewer'
  | null;

export type ThemeMode = 'dark' | 'midnight' | 'amoled';
