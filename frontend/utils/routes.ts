import { makeGet } from "./requests";
import { HomeResponse, RankHomeResponse, RankTopicsPage, WhoToFollowPage, ListTopicsPage } from "./types";

export const getHome = makeGet<HomeResponse>("/home_page/");
export const getRankHome = makeGet<RankHomeResponse>("/rank_home/");
export const getRankTopics = makeGet<RankTopicsPage>("/rank_topics_page/");
export const getWhoToFollow = makeGet<WhoToFollowPage>("/who_to_follow_page/");
export const getListTopics = makeGet<ListTopicsPage>("/topics_page/");
