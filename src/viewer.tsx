import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { sprintf } from 'sprintf-js';
import { AppBar, Avatar, Box, Button, Card, CardHeader, Container, CssBaseline, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, Radio, RadioGroup, Slide, Toolbar, Typography, useScrollTrigger } from '@mui/material';
import { CalendarPicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { red, blue } from '@mui/material/colors';
import StarIcon from '@mui/icons-material/Star';
import { Moment } from 'moment';
import * as moment from 'moment';
import { VisibleUniverse15 } from './VisibleUniverse15';
import { Namer15 } from './Namer15';
import { Planet, Star, StarClassNames } from './Universe';

let lastSeed = 0n;
let lastUniverse: VisibleUniverse15 | null = null;

if (navigator.language !== "en") {
    let dateLocalized = false;
    const localizeDate = (lang: string) => {
        if (!dateLocalized) {
            dateLocalized = moment.locale(lang) !== "en";
        }
    }
    localizeDate(navigator.language);
    navigator.languages.forEach(localizeDate);
}

const momentToSeed = (moment: Moment) => {
    const date = moment.toDate();
    return BigInt(date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate());
}

const HideOnScroll = ({ children }) => {
    const trigger = useScrollTrigger();

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

const PlanetCard = ({ planet, index, count }: { planet: Planet, index: number, count: number }) => {
    const isStar = planet instanceof Star;
    return (
        <Card raised style={{ margin: "12px 0 12px 0" }}>
            <CardHeader
                avatar={
                    isStar ? (
                        <Avatar sx={{ bgcolor: red[500] }}>
                            <StarIcon />
                        </Avatar>
                    ) : (
                        <Avatar sx={{ bgcolor: blue[500] }}>
                            {index + 1}
                        </Avatar>
                    )
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
                            {Math.floor(planet.radius)}
                        </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2">Mass</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {sprintf("%.3e", planet.mass)}
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

const AppContent = () => {
    const [date, setDate] = React.useState(moment());
    const [showDialog, setShowDialog] = React.useState(false);
    const [version, setVersion] = React.useState("v15");
    const seed = momentToSeed(date);
    const universe = (lastSeed === seed && lastUniverse !== null) ? lastUniverse : (() => {
        const u = new VisibleUniverse15(new Namer15(), seed);
        u.initRandom();
        lastSeed = seed;
        lastUniverse = u;
        return u;
    })();
    const count = universe.planets.length;
    const closeDialog = () => setShowDialog(false);
    const play = () => {
        setShowDialog(false);
        location.href = "player" + (version === "v15" ? "15" : "") + ".html#seed=" + String(seed);
    }
    return (
        <React.Fragment>
            <Box textAlign="center">
                <div style={{ display: "inline-block" }}>
                    <Card>
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                            <CalendarPicker
                                dayOfWeekFormatter={x => x}
                                minDate={moment("2020-01-01")}
                                date={date}
                                onChange={(date) => { setDate(date!) }}
                            />
                        </LocalizationProvider>
                    </Card>
                </div>
            </Box>
            <Box>
                <p>
                    Number of planets: <b>{count}</b>
                    <Button style={{ margin: "0 8px 0 8px" }} variant="contained" onClick={() => setShowDialog(true)}>Play Online</Button>
                </p>
            </Box>
            <Box>
                <PlanetCard planet={universe.star} index={0} count={count} />
                {universe.planets.map((planet, index) => (<PlanetCard planet={planet} index={index} count={count} />))}
            </Box>
            <Dialog
                open={showDialog}
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
                    <Button onClick={play} autoFocus>Play</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

const App = () => {
    return (
        <React.Fragment>
            <CssBaseline />
            <HideOnScroll>
                <AppBar>
                    <Toolbar>
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
                    <p>
                        We use a generation method similar to the original Easter egg, but the content is not guaranteed to match the original.
                    </p>
                    <p>
                        <Typography variant="h5" gutterBottom>
                            <center>↓ SELECT A DATE BELOW TO VIEW THE CONTENT ↓</center>
                        </Typography>
                    </p>
                    <AppContent />
                </Box>
            </Container>
        </React.Fragment>
    );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
    <>
        <App />
        <script defer={true} async={true} src="/counter.js" />
    </>
);
