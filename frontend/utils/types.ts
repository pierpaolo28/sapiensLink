export interface HomeResponse {
  pagination: {
    next_page?: string;
    previous_page?: string;
    total_pages: number;
    current_page: number;
  };
  lists: List[];
  users: User[];
  list_count: number;
  topic_counts: [string, number][];
  all_list_count: number;
}

export interface RankHomeResponse {
  pagination: {
    next_page?: string;
    previous_page?: string;
    total_pages: number;
    current_page: number;
  };
  ranks: Rank[];
  users: User[];
  rank_count: number;
  topic_counts: [string, number][];
  all_rank_count: number;
}

interface Element {
  element: string;
  user_id: number;
}

interface Rank {
  id: number;
  name: string;
  topic: { id: number; name: string }[];
  contributors: number[];
  content: { [key: string]: Element };
  description: string;
  score: number;
  updated: string;
  created: string;
  subscribed_users: number[];
}

interface RankContent {
  [key: string]: {
    element: string;
    user_id: number;
  };
}

interface RankContributor {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  avatar: string;
  social: string | null;
  followers: number[];
  following: number[];
}

interface RankContentScores {
  [key: string]: number;
}

export interface RankPageResponse {
  rank: {
    id: number;
    topic: { id: number; name: string }[];
    contributors: number[];
    content: RankContent;
    name: string;
    description: string;
    score: number;
    updated: string;
    created: string;
    subscribed_users: number[];
  };
  contributors: RankContributor[];
  content_scores: RankContentScores;
  has_reported: boolean;
  saved_ranks_ids: number[];
  is_subscribed: boolean;
}


export interface User {
  id: number;
  name: string;
  email: string;
  bio?: string;
  avatar: string;
  social?: string;
  followers: string[];
  following: string[];
}

export interface List {
  id: number;
  topic: Topic[];
  participants: string[];
  name: string;
  description?: string;
  content: string;
  updated: string;
  created: string;
  score: number;
  source: string;
  public: true;
  author?: number;
  subscribed_users: string[];
}

export type ListForm = {
  name: string;
  description: string;
  content: string;
  source: string;
  public: boolean;
  topic: string[];
};

export interface Topic {
  id: number;
  name: string;
}

interface SavedList {
  id: number;
  list_name: {
    name: string;
  };
  saved_at: string;
  user: number;
  list: number;
}

interface SavedRank {
  id: number;
  rank_name: {
    name: string;
  };
  saved_at: string;
  user: number;
  rank: number;
}

export interface SavedPageResponse {
  saved_lists: SavedList[];
  saved_ranks: SavedRank[];
}

export interface UserProfilePage {
  pagination: {
      next_page: null | string;
      previous_page: null | string;
      total_pages: number;
      current_page: number;
  };
  lists: List[];
  user: User;
  lists_count: number;
  is_following: boolean;
  saved_lists: SavedList[];
  saved_ranks: SavedRank[];
  lists_contributions: List[];
  ranks_contributions: Rank[];
}

export interface ContentItem {
  element: string;
  user_id: number; 
}

export interface CreateRankFormData {
  name: string;
  description: string;
  topic: string[];
  contributors: number[];
  content: { [key: string]: ContentItem };
}

export interface RankTopicsResponse {
  topic_counts: [string, number][];
  all_rank_count: number;
}

export interface WhoToFollowResponse {
  users: User[];
}

export interface ListTopicsResponse {
  topic_counts: [string, number][];
  all_list_count: number;
}

interface Participant {
  id: number;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  social: string;
  followers: { id: number; name: string }[];
  following: { id: number; name: string }[];
}

export interface ListPageResponse {
  list: List;
  list_comments: any[]; //TODO replace
  participants: Participant[];
  has_reported: boolean;
  saved_list_ids: number[];
  is_subscribed: boolean;
}

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  url: string;
}

export type UserComment = {
  id: number;
  author_id: number;
  author: string;
  text: string;
  avatar: string;
  updated: EpochTimeStamp;
};

export interface Suggestion {
  id: number;
  suggestion_text: string;
  is_accepted: boolean;
  list: number;
  suggested_by: number;
}

export interface EditComment {
  id: number;
  text: string;
  edit_suggestion: number;
  commenter: number;
}

export interface ListPrPageResponse {
  list: List;
  suggestions: Suggestion[];
  pr_comments: EditComment[]; // Define Comment interface if needed
}