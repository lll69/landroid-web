import { AppBar, Box, Button, ButtonBase, Card, CardContent, Container, createTheme, CssBaseline, ListItemIcon, ListItemText, Menu, MenuItem, ThemeProvider, Toolbar, Typography, useMediaQuery } from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { memo, MouseEvent, useCallback, useMemo, useState } from "react";
import { API_LEVELS, VERSIONS } from "./VersionData";
import { VersionGroup, VersionItem } from "./VersionType";

const getItemDesc = (item: VersionItem) => (
    "Android " +
    (item.minApi === item.maxApi ? API_LEVELS[item.minApi] : API_LEVELS[item.minApi] + "-" + API_LEVELS[item.maxApi]) +
    " (" + item.verName + ")"
);

const EggMenuButton = memo(({ group, index, setIndex }: { group: VersionGroup, index: number, setIndex: (index: number) => void }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = useCallback((e: MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget), []);
    const close = useCallback(() => setAnchorEl(null), []);
    const item = group[index];
    const onIndexClick = useCallback((index: number) => {
        setAnchorEl(null);
        setIndex(index);
    }, []);
    return (<>
        <Button
            variant="text"
            endIcon={<KeyboardArrowDownIcon />}
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
                <MenuItem onClick={() => onIndexClick(index)}>
                    <ListItemIcon>
                        <img src={item.iconUrl} style={{ height: "1.5em" }} />
                    </ListItemIcon>
                    <ListItemText>{getItemDesc(item)}</ListItemText>
                </MenuItem>
            ))}
        </Menu>
    </>);
});

const EggGroupCard = memo(({ P, group }: { P?: boolean, group: VersionGroup }) => {
    const [index, setIndex] = useState(0);
    const item = group[index];
    return (<ButtonBase component="div" sx={{ borderRadius: "32px", display: "block" }}>
        <Card key={item.minApi} component="div" variant="outlined" sx={{ borderRadius: "32px", margin: "8px 0 8px 0", padding: "0 16px 0 16px", display: "flex" }}>
            <Box sx={{ flex: "1" }}>
                <CardContent>
                    <Typography component="div" variant="h5">
                        {item.eggName}
                    </Typography>
                    <div>
                        {group.length > 1 ? (
                            <EggMenuButton group={group} index={index} setIndex={setIndex} />
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
    return (<Box>
        {VERSIONS.map((group: VersionGroup) => (<EggGroupCard P={P} group={group} />))}
    </Box>);
})

export default memo(({ P }: { P?: boolean }) => {
    const darkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const theme = useMemo(() => createTheme({
        palette: {
            mode: (darkMode || P) ? "dark" : "light"
        }
    }), [darkMode]);
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar>
                <Toolbar>
                    <Typography variant="h6" component="h1">
                        Android Easter Eggs Online
                    </Typography>
                </Toolbar>
            </AppBar>
            <Toolbar />
            <Container>
                <EggsPart P={P} />
            </Container>
        </ThemeProvider>
    )
});
