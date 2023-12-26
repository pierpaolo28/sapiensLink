import { makeGet } from "./requests";
import { HomeResponse } from "./types";

export const getHome = makeGet<HomeResponse>("/home_page/");
