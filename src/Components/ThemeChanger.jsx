import React, { useState } from 'react'
import { Box, Switch, Typography, CssBaseline, createTheme, ThemeProvider, Stack } from '@mui/material';
import Logout from './Logout';

export default function ThemeChanger() {

    // Retrieve the theme mode from local storage or default to light mode
    const getInitialMode = () => {
        const savedMode = localStorage.getItem('themeMode');
        return savedMode ? JSON.parse(savedMode) : false; // false = light mode
    };

    const [darkMode, setDarkMode] = useState(getInitialMode);

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    const handleThemeToggle = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('themeMode', JSON.stringify(newMode));
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2
                }}
            >
                <Logout />

                <Stack flexDirection='row' gap={2}>
                    <Typography variant="h6" gutterBottom>
                        {darkMode ? 'Dark Mode' : 'Light Mode'}
                    </Typography>
                    <Switch
                        checked={darkMode}
                        onChange={handleThemeToggle}
                        inputProps={{ 'aria-label': 'toggle theme' }}
                    />
                </Stack>
            </Box>
        </ThemeProvider>
    )
}
