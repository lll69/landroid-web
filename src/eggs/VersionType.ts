export type VersionItem = {
    minApi: number;
    maxApi: number;
    verName: string;
    eggName: string;
    iconUrl: string;
}

export type VersionGroup = VersionItem[];
