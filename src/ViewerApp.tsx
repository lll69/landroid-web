import * as React from 'react';
import { sprintf } from 'sprintf-js';
import { AppBar, Avatar, Badge, BadgeProps, Box, Button, Card, CardHeader, Checkbox, CircularProgress, Container, createTheme, CssBaseline, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, Link, Radio, RadioGroup, Slide, styled, ThemeProvider, Toolbar, Typography, useScrollTrigger } from '@mui/material';
import { CalendarPicker, LocalizationProvider, PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { Moment } from 'moment';
import moment from 'moment';
import { VisibleUniverse15 } from './VisibleUniverse15';
import { Namer15 } from './Namer15';
import { Planet, Star, StarClass, StarClassNames } from './Universe';
import { setLogEnabled } from './Debug';

type StarColor = "Star_O" | "Star_B" | "Star_A" | "Star_F" | "Star_G" | "Star_K" | "Star_M";

declare module "@mui/material/styles" {
    interface Palette {
        Star_O: Palette["primary"];
        Star_B: Palette["primary"];
        Star_A: Palette["primary"];
        Star_F: Palette["primary"];
        Star_G: Palette["primary"];
        Star_K: Palette["primary"];
        Star_M: Palette["primary"];
    }

    interface PaletteOptions {
        Star_O?: PaletteOptions["primary"];
        Star_B?: PaletteOptions["primary"];
        Star_A?: PaletteOptions["primary"];
        Star_F?: PaletteOptions["primary"];
        Star_G?: PaletteOptions["primary"];
        Star_K?: PaletteOptions["primary"];
        Star_M?: PaletteOptions["primary"];
    }
}

declare module "@mui/material/Badge" {
    interface BadgePropsColorOverrides {
        Star_O: true;
        Star_B: true;
        Star_A: true;
        Star_F: true;
        Star_G: true;
        Star_K: true;
        Star_M: true;
    }
}

if (typeof navigator !== "undefined" && navigator.language !== "en") {
    let dateLocalized = false;
    const localizeDate = (lang: string) => {
        if (!dateLocalized) {
            dateLocalized = moment.locale(lang) !== "en";
        }
    }
    localizeDate(navigator.language);
    navigator.languages.forEach(localizeDate);
}

const initialDate = moment();
const minDate = moment("2020-01-01");
const universeMap = new Map<number, VisibleUniverse15>();
let lastYear = 0, lastMonth = 0;

setLogEnabled(false);

const colorTransitionStr = "background-color 250ms cubic-bezier(0.4,0,0.2,1), color 250ms cubic-bezier(0.4,0,0.2,1)";

let theme = createTheme();

theme = createTheme(theme, {
    palette: {
        Star_O: theme.palette.augmentColor({ color: { main: "#6666FF" } }),
        Star_B: theme.palette.augmentColor({ color: { main: "#CCCCFF" } }),
        Star_A: theme.palette.augmentColor({ color: { main: "#EEEEFF" } }),
        Star_F: theme.palette.augmentColor({ color: { main: "#FFFFFF" } }),
        Star_G: theme.palette.augmentColor({ color: { main: "#FFFF66" } }),
        Star_K: theme.palette.augmentColor({ color: { main: "#FFCC33" } }),
        Star_M: theme.palette.augmentColor({ color: { main: "#FF8800" } }),
    }
});

const themeB = createTheme(theme, { palette: { primary: theme.palette.Star_B } });
const themeK = createTheme(theme, { palette: { primary: theme.palette.Star_K } });
const themes = [
    createTheme(theme, { palette: { primary: theme.palette.Star_O } }),
    themeB,
    themeB,
    themeB,
    themeK,
    themeK,
    createTheme(theme, { palette: { primary: theme.palette.Star_M } }),
];

const momentToSeed = (moment: Moment) => {
    return moment.year() * 10000 + moment.month() * 100 + moment.date();
}

const getUniverse: ((moment: Moment) => VisibleUniverse15) = moment => {
    const year = moment.year();
    const month = moment.month();
    if (year !== lastYear && month !== lastMonth) {
        lastYear = year;
        lastMonth = month;
        universeMap.clear();
    }
    const seed = year * 10000 + month * 100 + moment.date();
    let cached = universeMap.get(seed);
    if (!cached) {
        cached = new VisibleUniverse15(new Namer15(), BigInt(seed));
        cached.initRandom();
        universeMap.set(seed, cached);
    }
    return cached;
}

const initialStarClass = getUniverse(initialDate).star.cls;

const borderedStyle = {
    border: "1px solid rgba(0, 0, 0, 0.87)"
};
const BorderedBadge = styled(Badge)<BadgeProps>({
    "& .MuiBadge-badge": borderedStyle
});

const HideOnScroll = ({ children }) => {
    const trigger = useScrollTrigger();

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

const PlanetCard = ({ planet, index, count, color, truncate }:
    { planet: Planet, index: number, count: number, color: StarColor, truncate: boolean }) => {
    const isStar = planet instanceof Star;
    const truncate3 = truncate ? ((n: number) => n.toFixed(3)) : ((n: number) => n);
    return (
        <Card raised sx={{ margin: "16px 0", borderRadius: "16px" }}>
            <CardHeader
                avatar={
                    <Avatar
                        sx={{ bgcolor: color + ".main", color: color + ".contrastText", transition: colorTransitionStr }}
                        style={color === "Star_F" ? borderedStyle : undefined}>
                        {String(index + 1)}
                    </Avatar>
                }
                title={planet.name}
                subheader={isStar ? "Star" : "Planet"}
            />
            <Divider />
            {isStar ? (
                <React.Fragment>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2">Class</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {StarClassNames[planet.cls]}
                        </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2">Radius</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {truncate3(planet.radius)}
                        </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2">Mass</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {truncate ? sprintf("%.3e", planet.mass) : sprintf("%e", planet.mass)}
                        </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2">Bodies</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {count}
                        </Typography>
                    </Box>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2">Radius</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {truncate3(planet.radius)}
                        </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2">Orbit radius</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {truncate3(planet.pos.distance(planet.orbitCenter))}
                        </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2">Speed</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {truncate3(planet.speed)}
                        </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2">Type</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {planet.description}
                        </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2">Atmosphere</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {planet.atmosphere}
                        </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2">Fauna</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {planet.fauna}
                        </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2">Flora</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {planet.flora}
                        </Typography>
                    </Box>
                </React.Fragment>
            )}
        </Card>
    )
}

const CalendarPart = ({ topRef, showCount, setShowCount, date, setDate, truncate, setTruncate }:
    { topRef: React.RefObject<HTMLElement>, showCount: boolean, setShowCount: (_: boolean) => void, date: Moment, setDate: (_: Moment) => void, truncate: boolean, setTruncate: (_: boolean) => void }
) => {
    const renderDay = (day: Moment, _, props: PickersDayProps<Moment>) => {
        if (!showCount || props.outsideCurrentMonth) {
            return <PickersDay {...props} />;
        }
        const universe = getUniverse(day);
        const cls = universe.star.cls;
        const color = ("Star_" + StarClassNames[cls]) as StarColor;
        const click = () => setDate(day);
        if (cls === StarClass.F) {
            return (
                <BorderedBadge
                    badgeContent={universe.planets.length}
                    onClick={click}
                    color={color}
                    overlap="circular">
                    <PickersDay {...props} />
                </BorderedBadge>
            );
        }
        return (
            <Badge
                badgeContent={universe.planets.length}
                onClick={click}
                color={color}
                overlap="circular">
                <PickersDay {...props} />
            </Badge>
        );
    }
    return (
        <Box id="top" textAlign="center" sx={{ userSelect: "none" }} ref={topRef}>
            <FormControlLabel
                control={<Checkbox checked={!truncate} onChange={e => setTruncate(!e.target.checked)} />}
                label="Show all decimal places"
                sx={{ textAlign: "left" }} />
            <br />
            <FormControlLabel
                control={<Checkbox checked={showCount} onChange={e => setShowCount(e.target.checked)} />}
                label="Show the number of planets on the calendar"
                sx={{ textAlign: "left" }} />
            <br />
            <Card elevation={4} sx={{ borderRadius: "32px", display: "inline-block" }}>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                    <CalendarPicker
                        dayOfWeekFormatter={x => x}
                        minDate={minDate}
                        date={date}
                        onChange={(date) => { setDate(date!) }}
                        reduceAnimations={false}
                        renderDay={renderDay} />
                </LocalizationProvider>
            </Card>
        </Box>
    );
};

const DialogPart = ({ seed, show, setShow }: { seed: number, show: boolean, setShow: (_: boolean) => void }) => {
    const [version, setVersion] = React.useState("v15");
    const link = "player" + (version === "v15" ? "15" : "") + ".html#seed=" + seed;
    const closeDialog = () => setShow(false);
    return (
        <Dialog
            open={show}
            onClose={closeDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">Select Version</DialogTitle>
            <DialogContent>
                <FormControl id="alert-dialog-description">
                    <RadioGroup
                        value={version}
                        onChange={e => setVersion(e.target.value)}
                        name="radio-buttons-group">
                        <FormControlLabel value="v14" control={<Radio />} label="Android 14 (Upside Down Cake)" />
                        <FormControlLabel value="v15" control={<Radio />} label="Android 15 (Vanilla Ice Cream)" />
                    </RadioGroup>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeDialog}>Cancel</Button>
                <Button href={link} onClick={closeDialog} autoFocus>Play</Button>
            </DialogActions>
        </Dialog>)
}

const AppContent = ({ setTheme }: { setTheme: (_: number) => void }) => {
    const [date, setDate] = React.useState(initialDate);
    const [showCount, setShowCount] = React.useState(false);
    const [showDialog, setShowDialog] = React.useState(false);
    const [truncateResult, setTruncateResult] = React.useState(true);
    const topRef = React.useRef<HTMLElement>(null);
    const seed = momentToSeed(date);
    const universe = getUniverse(date);
    const count = universe.planets.length;
    const starColor = ("Star_" + StarClassNames[universe.star.cls]) as StarColor;
    const setDateDispatch = (date: Moment) => {
        setDate(date);
        setTheme(getUniverse(date).star.cls);
    }
    return (
        <>
            <CalendarPart
                topRef={topRef}
                showCount={showCount}
                setShowCount={setShowCount}
                date={date}
                setDate={setDateDispatch}
                truncate={truncateResult}
                setTruncate={setTruncateResult} />
            <Box>
                <p>
                    <b>Easter egg content on {date.format("L")}:</b>
                    <Button sx={{ margin: "0 8px" }} variant="contained" onClick={() => setShowDialog(true)}>Play Online</Button>
                    <br />Number of planets: <b>{count}</b>
                </p>
            </Box>
            <Box>
                <PlanetCard key={-1} planet={universe.star} index={-1} count={count} color={starColor} truncate={truncateResult} />
                {universe.planets.map((planet, index) => (<PlanetCard key={index} planet={planet} index={index} count={count} color={starColor} truncate={truncateResult} />))}
            </Box>
            <Link href="#top" onClick={e => { if (topRef.current) { e.preventDefault(); topRef.current.scrollIntoView({ behavior: "smooth" }) } }}>Back to Top</Link>
            <DialogPart
                seed={seed}
                show={showDialog}
                setShow={setShowDialog} />
        </>
    );
}

export const ViewerApp = ({ P }: { P?: boolean }) => {
    const [themeIndex, setThemeIndex] = React.useState(initialStarClass as number);
    return (
        <ThemeProvider theme={P ? theme : themes[themeIndex]}>
            <CssBaseline />
            <HideOnScroll>
                <AppBar>
                    <Toolbar sx={{ bgcolor: "primary.main", transition: colorTransitionStr }}>
                        <Typography variant="h6" component="h1">
                            LAndroid Easter Egg Planet Viewer
                        </Typography>
                    </Toolbar>
                </AppBar>
            </HideOnScroll>
            <Toolbar />
            <Container>
                <Box sx={{ my: 2 }}>
                    <p>
                        Check the daily content of LAndroid Easter Egg (Android 14 and Android 15 Easter Egg), including the names, types, and total numbers of stars and planets.
                        You can also view the content for past or future days.
                    </p>
                    <p>We use the generation algorithm from the original Easter Egg, but the content cannot be guaranteed to match the original.</p>
                    <center>
                        <Typography variant="h5" component="p" gutterBottom>↓ SELECT A DATE BELOW TO VIEW THE CONTENT ↓</Typography>
                    </center>
                    {P ? <center><CircularProgress /></center> : <AppContent setTheme={setThemeIndex} />}
                </Box>
            </Container>
        </ThemeProvider>
    );
}
