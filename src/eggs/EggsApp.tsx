import styled from "@emotion/styled";
import { Fullscreen, FullscreenExit, KeyboardArrowDown } from "@mui/icons-material";
import { AppBar, Backdrop, Box, Button, ButtonBase, Card, CardContent, CircularProgress, Container, createTheme, CssBaseline, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Snackbar, ThemeProvider, Toolbar, Typography, useMediaQuery } from "@mui/material";
import { memo, MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import { API_LEVELS, VERSIONS } from "./VersionData";
import { VersionGroup, VersionItem } from "./VersionType";
import { VERSION_CODES } from "./VersionCode";

const NO_EGG = "NO_EGG";

const eggMap = {
    [VERSION_CODES.BASE]: NO_EGG,
    [VERSION_CODES.BASE_1_1]: NO_EGG,
    [VERSION_CODES.CUPCAKE]: NO_EGG,
    [VERSION_CODES.DONUT]: NO_EGG,
    [VERSION_CODES.ECLAIR]: NO_EGG,
    [VERSION_CODES.FROYO]: NO_EGG,
    [VERSION_CODES.GINGERBREAD]: "Gingerbread",
    [VERSION_CODES.HONEYCOMB]: "Honeycomb",
    [VERSION_CODES.ICE_CREAM_SANDWICH]: "IceCreamSandwich",
    [VERSION_CODES.JELLY_BEAN]: "JellyBean",
    [VERSION_CODES.KITKAT]: "KitKat",
    [VERSION_CODES.UPSIDE_DOWN_CAKE]: "UpsideDownCake",
    [VERSION_CODES.VANILLA_ICE_CREAM]: "VanillaIceCream",
    [VERSION_CODES.BAKLAVA]: "Baklava",
}

const iframeMap = {
    "UpsideDownCake": "/eggs/UpsideDownCake/PlatLogoActivity.html",
    "VanillaIceCream": "/eggs/VanillaIceCream/PlatLogoActivity.html",
    "UpsideDownCakePlayer": "/player.html",
    "VanillaIceCreamPlayer": "/player15.html",
    "Baklava": "/player15.html",
    "Gingerbread": "/eggs/Gingerbread/PlatLogoActivity.html",
    "Honeycomb": "/eggs/Honeycomb/PlatLogoActivity.html",
    "IceCreamSandwich": "/eggs/IceCreamSandwich/PlatLogoActivity.html",
    "Nyandroid": "/eggs/IceCreamSandwich/Nyandroid.html",
    "JellyBean": "/eggs/JellyBean/PlatLogoActivity.html",
}

const iframeNoOverlayList = new Set([
    "UpsideDownCake",
    "VanillaIceCream",
    "UpsideDownCakePlayer",
    "VanillaIceCreamPlayer",
    "Baklava",
    "Nyandroid",
]);

const iframe3List = new Set([
    "UpsideDownCakePlayer",
    "VanillaIceCreamPlayer",
    "Nyandroid",
]);

let currentEgg: string | null = null;
let currentIframe: HTMLIFrameElement | null = null;
let currentIframe3: HTMLIFrameElement | null = null;
const switchToEgg = (name: string | null, setLoad: (loading: boolean) => void, setMask: (mask: boolean) => void) => {
    const rootEl = document.getElementById("root") as HTMLDivElement;
    const eggContentEl = document.getElementById("egg-content") as HTMLDivElement;
    const eggContent3El = document.getElementById("egg-content3") as HTMLDivElement;
    if (name !== null && iframeMap[name] !== undefined) {
        // open iframe
        if (name === currentEgg) return;
        currentEgg = name;
        let iframe: HTMLIFrameElement;
        if (currentIframe !== null && currentIframe.src === iframeMap[name]) {
            iframe = currentIframe;
            if (!iframeNoOverlayList.has(name)) {
                setMask(false);
                rootEl.className = "animatable-mid";
                eggContentEl.className = "animatable-mid";
                eggContent3El.className = "animatable-right";
            } else {
                setMask(false);
                rootEl.className = "animatable-left";
                eggContentEl.className = "animatable-mid";
                eggContent3El.className = "animatable-right";
            }
        } else {
            iframe = document.createElement("iframe");
            iframe.width = iframe.height = "100%";
            iframe.frameBorder = "0";
            iframe.style.display = "block";
            iframe.src = iframeMap[name];
            iframe.onload = () => {
                setLoad(false);
                if (iframe3List.has(name)) {
                    setMask(true);
                    rootEl.className = "animatable-left";
                    eggContentEl.className = "animatable-left";
                    eggContent3El.className = "animatable-mid";
                } else if (!iframeNoOverlayList.has(name)) {
                    setMask(true);
                    rootEl.className = "animatable-mid";
                    eggContentEl.className = "animatable-mid";
                    eggContent3El.className = "animatable-right";
                } else {
                    setMask(false);
                    rootEl.className = "animatable-left";
                    eggContentEl.className = "animatable-mid";
                    eggContent3El.className = "animatable-right";
                }
                try {
                    iframe.contentWindow!.postMessage({ type: "setHashEnabled" });
                } catch (e) {
                    console.error(e);
                }
            }
            iframe.onerror = (e) => {
                setLoad(false);
                setMask(false);
                console.error(e);
            }
        }
        if (iframe3List.has(name)) {
            eggContent3El.innerHTML = "";
            eggContent3El.appendChild(iframe);
            if (currentIframe3 !== null) {
                currentIframe3.onload = null;
                currentIframe3.onerror = null;
            }
            currentIframe3 = iframe;
        } else {
            eggContentEl.innerHTML = "";
            eggContentEl.appendChild(iframe);
            if (currentIframe !== null) {
                currentIframe.onload = null;
                currentIframe.onerror = null;
            }
            currentIframe = iframe;
            if (currentIframe3 !== null) {
                currentIframe3.onload = null;
                currentIframe3.onerror = null;
                currentIframe3 = null;
                setTimeout(() => {
                    if (currentIframe3 === null) eggContent3El.innerHTML = "";
                }, 200);
            }
        }
        setLoad(true);
        setMask(false);
        return;
    }

    // null or default
    if (null === currentEgg) return;
    currentEgg = name;
    if (currentIframe !== null) {
        currentIframe.onload = null;
        currentIframe.onerror = null;
    }
    if (currentIframe3 !== null) {
        currentIframe3.onload = null;
        currentIframe3.onerror = null;
    }
    setLoad(false);
    setMask(false);
    currentIframe = null;
    rootEl.className = "animatable-mid";
    eggContentEl.className = "animatable-right";
    eggContent3El.className = "animatable-right";
    setTimeout(() => {
        if (currentIframe === null) eggContentEl.innerHTML = "";
        if (currentIframe3 === null) eggContent3El.innerHTML = "";
    }, 200);
}

onmessage = (e: MessageEvent) => {
    if (e.origin === location.origin) {
        if (e.data.type === "setHash") {
            location.hash = e.data.hash;
        }
    }
}

const getItemDesc = (item: VersionItem) => (
    "Android " +
    (item.minApi === item.maxApi ? API_LEVELS[item.minApi] : API_LEVELS[item.minApi] + "-" + API_LEVELS[item.maxApi]) +
    " (" + item.verName + ")"
);

const FillScrollDiv = styled.div({
    overflow: "auto",
    width: "100%",
    height: "100%",
})

const EggMenuButton = memo(({ group, index, setIndex }: { group: VersionGroup, index: number, setIndex: (index: number) => void }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    }, []);
    const close = useCallback(() => setAnchorEl(null), []);
    const item = group[index];
    const onIndexClick = useCallback((index: number) => {
        setAnchorEl(null);
        setIndex(index);
    }, []);
    return (<>
        <Button
            variant="text"
            endIcon={<KeyboardArrowDown />}
            sx={{ padding: "0", textTransform: "none" }}
            onClick={open}>
            <Typography component="span" variant="subtitle1" color="text.primary">
                {getItemDesc(item)}
            </Typography>
        </Button>
        <Menu
            anchorEl={anchorEl}
            open={!!anchorEl}
            onClose={close}>
            {group.map((item: VersionItem, index: number) => (
                <MenuItem key={index} onClick={(e) => { e.stopPropagation(); onIndexClick(index); }}>
                    <ListItemIcon>
                        <img src={item.iconUrl} style={{ height: "1.5em" }} />
                    </ListItemIcon>
                    <ListItemText>{getItemDesc(item)}</ListItemText>
                </MenuItem>
            ))}
        </Menu>
    </>);
});

const EggGroupCard = memo(({ P, group, index, click }: { P?: boolean, group: VersionGroup, index: number, click: (item: VersionItem) => void }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const item = group[selectedIndex];
    const onClick = useCallback(() => click(item), [selectedIndex]);
    return (<ButtonBase component="div" sx={{ borderRadius: "32px", display: "block" }} onClick={onClick}>
        <Card component="div" variant="outlined" sx={{ borderRadius: "32px", margin: "8px 0 8px 0", padding: "0 16px 0 16px", display: "flex" }}>
            <Box sx={{ flex: "1" }}>
                <CardContent>
                    <Typography component="div" variant="h5">
                        {item.eggName}
                    </Typography>
                    <div>
                        {group.length > 1 ? (
                            <EggMenuButton group={group} index={selectedIndex} setIndex={setSelectedIndex} />
                        ) : (
                            <Typography component="span" variant="subtitle1" color="text.primary">
                                {getItemDesc(item)}
                            </Typography>
                        )}
                    </div>
                </CardContent>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!P && <img src={item.iconUrl} style={{ height: "4rem" }}></img>}
            </Box>
        </Card>
    </ButtonBase>);
});

const EggsPart = memo(({ P }: { P?: boolean }) => {
    const [message, setMessage] = useState<string | null>(null);
    const closeSnackbar = useCallback(() => setMessage(null), []);
    const onItemClick = useCallback((item: VersionItem) => {
        const mapEgg = eggMap[item.minApi];
        if (typeof mapEgg === "string") {
            if (mapEgg === NO_EGG) {
                setMessage("🤖🚫🥚");
            } else {
                location.hash = "#" + mapEgg;
            }
        }
    }, []);
    return (<Box>
        {VERSIONS.map((group: VersionGroup, index: number) => (<EggGroupCard key={index} P={P} group={group} index={index} click={onItemClick} />))}
        <Snackbar
            open={message !== null}
            autoHideDuration={2000}
            onClose={closeSnackbar}
            message={message}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </Box>);
})

export default memo(({ P }: { P?: boolean }) => {
    const darkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const theme = useMemo(() => createTheme({
        palette: {
            mode: (darkMode || P) ? "dark" : "light"
        }
    }), [darkMode]);
    const [loading, setLoading] = useState(false);
    const [showMask, setShowMask] = useState(false);
    const [fsEl, setFsEl] = useState<Element | null>(null);
    const toggleFs = useCallback(() => {
        try {
            if (fsEl !== null) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen();
            }
        } catch (e) {
            console.error(e);
        }
    }, [fsEl]);
    useEffect(() => {
        document.getElementById("iframe-backdrop")!.hidden = !loading;
    }, [loading]);
    useEffect(() => {
        const hashChange = () => {
            const newHash = location.hash;
            if (newHash.length <= 1) {
                switchToEgg(null, setLoading, setShowMask);
            } else {
                switchToEgg(newHash.substring(1), setLoading, setShowMask);
            }
        };
        const fsChange = () => {
            setFsEl(document.fullscreenElement);
        };
        addEventListener("hashchange", hashChange);
        document.addEventListener("fullscreenchange", fsChange);
        hashChange();
        fsChange();
        return () => {
            removeEventListener("hashchange", hashChange)
            document.removeEventListener("fullscreenchange", fsChange);
        };
    }, []);
    return (
        <FillScrollDiv>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AppBar>
                    <Toolbar>
                        <div style={{ flexGrow: 1 }}>
                            <Typography variant="h6" component="h1">
                                Android Easter Eggs Online
                            </Typography>
                        </div>
                        <IconButton onClick={toggleFs} color="inherit">
                            {fsEl !== null ? <FullscreenExit /> : <Fullscreen />}
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Toolbar />
                <Container>
                    <EggsPart P={P} />
                    <p>
                        This project contains different versions of Android Easter eggs,
                        intended to organize the various versions of Android Easter eggs.
                        The goal is to allow most devices to experience different versions of the Easter eggs on the web.
                    </p>
                </Container>
                <Backdrop
                    sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1, opacity: "1 !important", backdropFilter: "blur(4px)" })}
                    open={showMask} />
            </ThemeProvider>
        </FillScrollDiv>
    )
});
