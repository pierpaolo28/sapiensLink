import { makeGet } from "./requests";
import { HomeResponse, RankHomeResponse } from "./types";

export const getHome = makeGet<HomeResponse>("/home_page/");
export const getRankHome = makeGet<RankHomeResponse>("/rank_home/");
