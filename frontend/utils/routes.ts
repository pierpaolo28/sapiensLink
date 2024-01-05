import { makeGet } from "./requests";
import { HomeResponse, RankHomeResponse, RankTopicsResponse, WhoToFollowResponse, ListTopicsResponse } from "./types";

export const getHome = makeGet<HomeResponse>("/home_page/");
export const getRankHome = makeGet<RankHomeResponse>("/rank_home/");
export const getRankTopics = makeGet<RankTopicsResponse>("/rank_topics_page/");
export const getWhoToFollow = makeGet<WhoToFollowResponse>("/who_to_follow_page/");
export const getListTopics = makeGet<ListTopicsResponse>("/topics_page/");
