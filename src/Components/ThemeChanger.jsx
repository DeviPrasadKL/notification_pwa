import React, { useState } from 'react'
import { Box, CssBaseline, createTheme, ThemeProvider } from '@mui/material';
import Logout from './Logout';

/**
 * The `ThemeChanger` component manages and applies theme settings for the application.
 * It provides a toggle for switching between light and dark mode themes.
 */
export default function ThemeChanger() {

    /**
     * Retrieves the initial theme mode from local storage or defaults to light mode.
     * @returns {boolean} - The theme mode; `true` for dark mode and `false` for light mode.
     */
    const getInitialMode = () => {
        const savedMode = localStorage.getItem('themeMode');
        return savedMode ? JSON.parse(savedMode) : false; // false = light mode
    };

    // State variable to keep track of the current theme mode
    const [darkMode, setDarkMode] = useState(getInitialMode);

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    /**
     * Toggles the theme mode between light and dark and stores the new mode in local storage.
     */
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
                <Logout
                    darkMode={darkMode}
                    handleThemeToggle={handleThemeToggle}
                />
            </Box>
        </ThemeProvider>
    )
}
