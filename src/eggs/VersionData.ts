import b_android_classic from "./imgs/b_android_classic";
import b_android_cupcake from "./imgs/b_android_cupcake";
import b_android_donut from "./imgs/b_android_donut";
import b_android_eclair from "./imgs/b_android_eclair";
import b_android_froyo from "./imgs/b_android_froyo";
import baklava_platlogo from "./imgs/baklava_platlogo";
import g_android_logo from "./imgs/g_android_logo";
import h_android_logo from "./imgs/h_android_logo";
import i_platlogo_rectangle from "./imgs/i_platlogo_rectangle";
import j_android_logo from "./imgs/j_android_logo";
import k_android_logo from "./imgs/k_android_logo";
import u_android14_patch_adaptive from "./imgs/u_android14_patch_adaptive";
import v_android15_patch_adaptive from "./imgs/v_android15_patch_adaptive";
import { VersionGroup, VersionItem } from "./VersionType";

export const enum VERSION_CODES {
    BASE = 1,
    BASE_1_1 = 2,
    CUPCAKE = 3,
    DONUT = 4,
    ECLAIR = 5,
    ECLAIR_0_1 = 6,
    ECLAIR_MR1 = 7,
    FROYO = 8,
    GINGERBREAD = 9,
    GINGERBREAD_MR1 = 10,
    HONEYCOMB = 11,
    HONEYCOMB_MR1 = 12,
    HONEYCOMB_MR2 = 13,
    ICE_CREAM_SANDWICH = 14,
    ICE_CREAM_SANDWICH_MR1 = 15,
    JELLY_BEAN = 16,
    JELLY_BEAN_MR1 = 17,
    JELLY_BEAN_MR2 = 18,
    KITKAT = 19,
    KITKAT_WATCH = 20,
    L = 21,
    LOLLIPOP = 21,
    LOLLIPOP_MR1 = 22,
    M = 23,
    N = 24,
    N_MR1 = 25,
    O = 26,
    O_MR1 = 27,
    P = 28,
    Q = 29,
    R = 30,
    S = 31,
    S_V2 = 32,
    TIRAMISU = 33,
    UPSIDE_DOWN_CAKE = 34,
    VANILLA_ICE_CREAM = 35,
    BAKLAVA = 36,
}

export const API_LEVELS = Array<string>(VERSION_CODES.BAKLAVA + 1);
API_LEVELS[VERSION_CODES.BAKLAVA] = "16"
API_LEVELS[VERSION_CODES.VANILLA_ICE_CREAM] = "15";
API_LEVELS[VERSION_CODES.UPSIDE_DOWN_CAKE] = "14";
API_LEVELS[VERSION_CODES.TIRAMISU] = "13";
API_LEVELS[VERSION_CODES.S_V2] = "12L";
API_LEVELS[VERSION_CODES.S] = "12";
API_LEVELS[VERSION_CODES.R] = "11";
API_LEVELS[VERSION_CODES.Q] = "10";
API_LEVELS[VERSION_CODES.P] = "9";
API_LEVELS[VERSION_CODES.O_MR1] = "8.1";
API_LEVELS[VERSION_CODES.O] = "8.0";
API_LEVELS[VERSION_CODES.N_MR1] = "7.1";
API_LEVELS[VERSION_CODES.N] = "7.0";
API_LEVELS[VERSION_CODES.M] = "6.0";
API_LEVELS[VERSION_CODES.LOLLIPOP_MR1] = "5.1";
API_LEVELS[VERSION_CODES.LOLLIPOP] = "5.0";
API_LEVELS[VERSION_CODES.KITKAT_WATCH] = "4.4W";
API_LEVELS[VERSION_CODES.KITKAT] = "4.4";
API_LEVELS[VERSION_CODES.JELLY_BEAN_MR2] = "4.3";
API_LEVELS[VERSION_CODES.JELLY_BEAN_MR1] = "4.2";
API_LEVELS[VERSION_CODES.JELLY_BEAN] = "4.1";
API_LEVELS[VERSION_CODES.ICE_CREAM_SANDWICH_MR1] = "4.0.3";
API_LEVELS[VERSION_CODES.ICE_CREAM_SANDWICH] = "4.0";
API_LEVELS[VERSION_CODES.HONEYCOMB_MR2] = "3.2";
API_LEVELS[VERSION_CODES.HONEYCOMB_MR1] = "3.1";
API_LEVELS[VERSION_CODES.HONEYCOMB] = "3.0";
API_LEVELS[VERSION_CODES.GINGERBREAD_MR1] = "2.3.3";
API_LEVELS[VERSION_CODES.GINGERBREAD] = "2.3";
API_LEVELS[VERSION_CODES.FROYO] = "2.2";
API_LEVELS[VERSION_CODES.ECLAIR_MR1] = "2.1";
API_LEVELS[VERSION_CODES.ECLAIR_0_1] = "2.0.1";
API_LEVELS[VERSION_CODES.ECLAIR] = "2.0";
API_LEVELS[VERSION_CODES.DONUT] = "1.6";
API_LEVELS[VERSION_CODES.CUPCAKE] = "1.5";
API_LEVELS[VERSION_CODES.BASE_1_1] = "1.1";
API_LEVELS[VERSION_CODES.BASE] = "1.0";

export const VERSIONS: VersionGroup[] = [
    [
        {
            minApi: VERSION_CODES.BAKLAVA,
            maxApi: VERSION_CODES.BAKLAVA,
            eggName: "Landroid",
            verName: "Baklava",
            iconUrl: baklava_platlogo,
        }
    ],
    [
        {
            minApi: VERSION_CODES.VANILLA_ICE_CREAM,
            maxApi: VERSION_CODES.VANILLA_ICE_CREAM,
            eggName: "Landroid",
            verName: "Vanilla Ice Cream",
            iconUrl: v_android15_patch_adaptive,
        }
    ],
    [
        {
            minApi: VERSION_CODES.UPSIDE_DOWN_CAKE,
            maxApi: VERSION_CODES.UPSIDE_DOWN_CAKE,
            eggName: "Landroid",
            verName: "Upside Down Cake",
            iconUrl: u_android14_patch_adaptive,
        }
    ],
    [
        {
            minApi: VERSION_CODES.KITKAT,
            maxApi: VERSION_CODES.KITKAT_WATCH,
            eggName: "Dessert Case",
            verName: "KitKat",
            iconUrl: k_android_logo,
        }
    ],
    [
        {
            minApi: VERSION_CODES.JELLY_BEAN,
            maxApi: VERSION_CODES.JELLY_BEAN_MR2,
            eggName: "BeanBag",
            verName: "Jelly Bean",
            iconUrl: j_android_logo,
        }
    ],
    [
        {
            minApi: VERSION_CODES.ICE_CREAM_SANDWICH,
            maxApi: VERSION_CODES.ICE_CREAM_SANDWICH_MR1,
            eggName: "Nyandroid",
            verName: "Ice Cream Sandwich",
            iconUrl: i_platlogo_rectangle,
        }
    ],
    [
        {
            minApi: VERSION_CODES.HONEYCOMB,
            maxApi: VERSION_CODES.HONEYCOMB_MR2,
            eggName: "Honeycomb",
            verName: "Honeycomb",
            iconUrl: h_android_logo,
        }
    ],
    [
        {
            minApi: VERSION_CODES.GINGERBREAD,
            maxApi: VERSION_CODES.GINGERBREAD_MR1,
            eggName: "Gingerbread",
            verName: "Gingerbread",
            iconUrl: g_android_logo,
        }
    ],
    [
        {
            minApi: VERSION_CODES.FROYO,
            maxApi: VERSION_CODES.FROYO,
            eggName: "Froyo",
            verName: "Froyo",
            iconUrl: b_android_froyo,
        },
        {
            minApi: VERSION_CODES.ECLAIR,
            maxApi: VERSION_CODES.ECLAIR_MR1,
            eggName: "Eclair",
            verName: "Eclair",
            iconUrl: b_android_eclair,
        },
        {
            minApi: VERSION_CODES.DONUT,
            maxApi: VERSION_CODES.DONUT,
            eggName: "Donut",
            verName: "Donut",
            iconUrl: b_android_donut,
        },
        {
            minApi: VERSION_CODES.CUPCAKE,
            maxApi: VERSION_CODES.CUPCAKE,
            eggName: "Cupcake",
            verName: "Cupcake",
            iconUrl: b_android_cupcake,
        },
        {
            minApi: VERSION_CODES.BASE_1_1,
            maxApi: VERSION_CODES.BASE_1_1,
            eggName: "Petit Four",
            verName: "Petit Four",
            iconUrl: b_android_classic,
        },
        {
            minApi: VERSION_CODES.BASE,
            maxApi: VERSION_CODES.BASE,
            eggName: "Base",
            verName: "Base",
            iconUrl: b_android_classic,
        },
    ],
];
