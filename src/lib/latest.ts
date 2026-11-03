import { getSetting, saveSetting } from "./app-settings";
import type { LatestPick } from "./latest-rules";

export const LATEST_KEY = "latest_catalog_titles";
export const loadLatestPicks = () => getSetting<LatestPick[]>(LATEST_KEY, []);
export const saveLatestPicks = (items: LatestPick[]) => saveSetting(LATEST_KEY, items);