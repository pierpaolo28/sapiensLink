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
  content: string[];
  updated: string;
  created: string;
  score: number;
  source: string;
  public: true;
  author?: number;
  subscribed_users: string[];
}

export interface Topic {
  id: number;
  name: string;
}
