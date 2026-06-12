export type VersionItem = {
    minApi: number;
    maxApi: number;
    eggName: string;
    verName: string;
    iconUrl: string;
}

export type VersionGroup = VersionItem[];
