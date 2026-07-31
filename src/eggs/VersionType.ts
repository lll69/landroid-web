export type VersionItem = {
    minApi: number;
    maxApi: number;
    eggName: string;
    verName: string;
    iconUrl: string;
    specialType?: boolean;
}

export type VersionGroup = VersionItem[];
