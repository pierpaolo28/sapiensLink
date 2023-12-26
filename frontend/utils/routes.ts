import { makeGet } from "./requests";

interface HomeResponse {
  pagination: {
    next_page: string | null;
    previous_page: string | null;
    total_pages: number;
    current_page: number;
  };
  lists: [];
  users: [];
  list_count: number;
  topic_counts: [];
  all_list_count: number;
}

export const getHome = makeGet<HomeResponse>("/home_page/");
