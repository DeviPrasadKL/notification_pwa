import React, { useState, useEffect, useRef } from 'react';
import { Button, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stack, TextField, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LoginHoursSettings from './Components/SettingsSection';
import CloseConfirm from './UIComponents/ConfirmationDialog';
import SettingsIcon from '@mui/icons-material/Settings';
import XLDownload from './Components/XLDownload';

function Logout({ darkMode, handleThemeToggle }) {
    const [loginTime, setLoginTime] = useState(null);
    const [expectedLogoutTime, setExpectedLogoutTime] = useState(null);
    const [breakStart, setBreakStart] = useState(null);
    const [breakEnd, setBreakEnd] = useState(null);
    const [breaks, setBreaks] = useState([]);
    const [isBreakInProgress, setIsBreakInProgress] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [manualBreakDuration, setManualBreakDuration] = useState('');
    const [loginHoursDialogOpen, setLoginHoursDialogOpen] = useState(false);
    const [loginHours, setLoginHours] = useState({ weekday: 8, saturday: 5 });
    const [logoutTime, setLogoutTime] = useState(null);
    const timerRef = useRef(null);
    const [breakStartedAt, setBreakStartedAt] = useState(null);

    useEffect(() => {
        // Load saved data from localStorage on component mount
        const savedLoginTime = localStorage.getItem('loginTime');
        const savedBreaks = JSON.parse(localStorage.getItem('breaks')) || [];
        const savedExpectedLogoutTime = localStorage.getItem('expectedLogoutTime');
        const savedLogoutTime = localStorage.getItem('logoutTime');
        const savedLoginHours = JSON.parse(localStorage.getItem('loginHours')) || { weekday: 8, saturday: 5 };
        const breakExists = localStorage.getItem('breakStartTime');

        if (breakExists) {
            setBreakStartedAt(breakExists);
            setIsBreakInProgress(true);
            setBreakStart(new Date(breakExists));
        }

        if (savedLoginTime) {
            const loginDate = new Date(savedLoginTime);
            setLoginTime(loginDate);
            if (!savedExpectedLogoutTime) {
                updateExpectedLogoutTime(loginDate, savedLoginHours);
            } else {
                setExpectedLogoutTime(new Date(savedExpectedLogoutTime));
            }
        }

        const formattedBreaks = savedBreaks.map(b => ({
            start: new Date(b.start),
            end: new Date(b.end),
            duration: b.duration
        }));
        setBreaks(formattedBreaks);

        updateTotalBreakDuration(formattedBreaks);
        setLoginHours(savedLoginHours);

        if (savedLogoutTime) {
            setLogoutTime(new Date(savedLogoutTime));
        }
    }, []);

    useEffect(() => {
        // Timer for tracking elapsed time during a break
        if (isBreakInProgress) {
            timerRef.current = setInterval(() => {
                const timeStartedAt = new Date(breakStartedAt);
                const secondsPassed = (new Date().getTime() - timeStartedAt.getTime()) / 1000;
                setElapsedTime(secondsPassed);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
            setElapsedTime(0);
        }

        return () => clearInterval(timerRef.current);
    }, [isBreakInProgress]);

    // Additional helper function to calculate total logged-in hours
    const calculateTotalLoggedInHours = () => {
        if (!loginTime || !logoutTime) return 'N/A';

        const loginDate = new Date(loginTime);
        const logoutDate = new Date(logoutTime);
        const totalDuration = logoutDate - loginDate;

        const totalBreakDurationMs = breaks.reduce((acc, b) => {
            const [minutes, seconds] = b.duration.split('m').map(part => parseInt(part, 10));
            const durationInMs = (minutes || 0) * 60 * 1000 + (seconds || 0) * 1000;
            return acc + durationInMs;
        }, 0);

        const totalLoggedInMs = totalDuration - totalBreakDurationMs;
        const totalHours = Math.floor(totalLoggedInMs / (1000 * 60 * 60));
        const totalMinutes = Math.floor((totalLoggedInMs % (1000 * 60 * 60)) / (1000 * 60));
        const totalSeconds = Math.floor((totalLoggedInMs % (1000 * 60)) / 1000);

        return `${totalHours}h ${totalMinutes}m ${totalSeconds}s`;
    };

    const handleLogin = () => {
        const now = new Date();
        setLoginTime(now);
        localStorage.setItem('loginTime', now.toISOString());
        updateExpectedLogoutTime(now);
    };

    const handleBreakStart = () => {
        const now = new Date();
        setBreakStart(now);
        setIsBreakInProgress(true);
        localStorage.setItem('breakStartTime', now.toISOString());
        setBreakStartedAt(now.toISOString());
    };

    const handleBreakEnd = () => {
        localStorage.removeItem('breakStartTime');
        setBreakStartedAt(null);
        if (isBreakInProgress && breakStart) {
            const now = new Date();
            setBreakEnd(now);
            setIsBreakInProgress(false);

            const duration = now - breakStart;
            const durationInMinutes = Math.floor(duration / (1000 * 60));
            const durationInSeconds = Math.floor(duration / 1000) % 60;

            const newBreak = {
                start: breakStart.toISOString(),
                end: now.toISOString(),
                duration: `${durationInMinutes}m ${durationInSeconds}s`
            };

            const newBreaks = [...breaks, newBreak];
            setBreaks(newBreaks);

            // Update expected logout time if it's already set
            if (expectedLogoutTime) {
                const updatedLogoutTime = new Date(expectedLogoutTime.getTime() + duration);
                setExpectedLogoutTime(updatedLogoutTime);
                localStorage.setItem('expectedLogoutTime', updatedLogoutTime.toISOString());
            }

            localStorage.setItem('breaks', JSON.stringify(newBreaks));
        }
    };

    // New logout function
    const handleLogout = () => {
        const now = new Date();
        setLogoutTime(now);
        localStorage.setItem('logoutTime', now.toISOString());
    };

    const handleClearData = () => {
        setOpenDialog(true);
    };

    const handleDialogClose = (confirm) => {
        if (confirm) {
            const themeMode = localStorage.getItem('themeMode');
            const savedLoginHours = localStorage.getItem('loginHours');

            localStorage.clear();

            if (themeMode) {
                localStorage.setItem('themeMode', themeMode);
            }

            if (savedLoginHours) {
                localStorage.setItem('loginHours', savedLoginHours);
            }

            setLoginTime(null);
            setExpectedLogoutTime(null);
            setLogoutTime(null);
            setBreaks([]);
        }
        setOpenDialog(false);
    };

    const handleAddManualBreak = () => {
        const minutes = parseInt(manualBreakDuration, 10);
        if (isNaN(minutes) || minutes <= 0) {
            alert("Please enter a valid number of minutes.");
            return;
        }

        const now = new Date();
        const durationInMs = minutes * 60 * 1000;

        const newBreak = {
            start: now.toISOString(),
            end: now.toISOString(),
            duration: `${minutes}m 0s`
        };

        const newBreaks = [...breaks, newBreak];
        setBreaks(newBreaks);

        // Update expected logout time if it's already set
        if (expectedLogoutTime) {
            const updatedLogoutTime = new Date(expectedLogoutTime.getTime() + durationInMs);
            setExpectedLogoutTime(updatedLogoutTime);
            localStorage.setItem('expectedLogoutTime', updatedLogoutTime.toISOString());
        }

        localStorage.setItem('breaks', JSON.stringify(newBreaks));
        setManualBreakDuration(''); // Clear input field
    };

    const handleDeleteBreak = (index) => {
        const breakToRemove = breaks[index];
        const durationToRemove = breakToRemove.duration.split('m').map(part => parseInt(part, 10));
        const durationToRemoveMs = (durationToRemove[0] || 0) * 60 * 1000 + (durationToRemove[1] || 0) * 1000;

        const newBreaks = breaks.filter((_, i) => i !== index);
        setBreaks(newBreaks);

        // Update expected logout time if it's already set
        if (expectedLogoutTime) {
            const updatedLogoutTime = new Date(expectedLogoutTime.getTime() - durationToRemoveMs);
            setExpectedLogoutTime(updatedLogoutTime);
            localStorage.setItem('expectedLogoutTime', updatedLogoutTime.toISOString());
        }

        localStorage.setItem('breaks', JSON.stringify(newBreaks));
    };

    const updateExpectedLogoutTime = (loginDate, hours = loginHours) => {
        const today = new Date(loginDate);
        const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
        const hoursToAdd = dayOfWeek === 6 ? hours.saturday : hours.weekday;
        const logoutTime = new Date(today.getTime() + hoursToAdd * 60 * 60 * 1000);
        setExpectedLogoutTime(logoutTime);
        localStorage.setItem('expectedLogoutTime', logoutTime.toISOString());
    };

    const updateTotalBreakDuration = (breaks) => {
        const totalBreakDuration = breaks.reduce((acc, b) => {
            const [minutes, seconds] = b.duration.split('m').map(part => parseInt(part, 10));
            const durationInMs = (minutes || 0) * 60 * 1000 + (seconds || 0) * 1000;
            return acc + durationInMs;
        }, 0);

        // Store total break duration in localStorage if needed
        localStorage.setItem('totalBreakDuration', totalBreakDuration);
    };

    return (
        <Container>
            <Stack spacing={2}>
                <Typography variant="h4">Logout and Break Tracker</Typography>
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" onClick={handleLogin}>Log In</Button>
                    <Button variant="contained" onClick={handleBreakStart} disabled={isBreakInProgress}>Start Break</Button>
                    <Button variant="contained" onClick={handleBreakEnd} disabled={!isBreakInProgress}>End Break</Button>
                    <Button variant="contained" onClick={handleLogout}>Log Out</Button>
                    <Button variant="contained" color="error" onClick={handleClearData}>Clear Data</Button>
                </Stack>
                <Stack spacing={2}>
                    <Typography variant="h6">Breaks</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Start</TableCell>
                                    <TableCell>End</TableCell>
                                    <TableCell>Duration</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {breaks.map((b, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{new Date(b.start).toLocaleTimeString()}</TableCell>
                                        <TableCell>{new Date(b.end).toLocaleTimeString()}</TableCell>
                                        <TableCell>{b.duration}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleDeleteBreak(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Stack>
                <TextField
                    label="Manual Break Duration (minutes)"
                    type="number"
                    value={manualBreakDuration}
                    onChange={(e) => setManualBreakDuration(e.target.value)}
                />
                <Button variant="contained" onClick={handleAddManualBreak}>Add Manual Break</Button>

                {loginTime && (
                    <Stack spacing={1}>
                        <Typography>Login Time: {loginTime.toLocaleTimeString()}</Typography>
                        <Typography>Expected Logout Time: {expectedLogoutTime ? expectedLogoutTime.toLocaleTimeString() : 'N/A'}</Typography>
                        <Typography>Logged Out Time: {logoutTime ? logoutTime.toLocaleTimeString() : 'N/A'}</Typography>
                        <Typography>Total Break Duration: {breaks.reduce((acc, b) => {
                            const [minutes, seconds] = b.duration.split('m').map(part => parseInt(part, 10));
                            return acc + (minutes || 0) * 60 * 1000 + (seconds || 0) * 1000;
                        }, 0)} ms</Typography>
                        <Typography>Total Logged In Hours: {calculateTotalLoggedInHours()}</Typography>
                    </Stack>
                )}

                <XLDownload
                    loginTime={loginTime}
                    expectedLogoutTime={expectedLogoutTime}
                    logoutTime={logoutTime}
                    breaks={breaks}
                    formatDate={() => loginTime ? loginTime.toLocaleDateString() : ''}
                />
                <LoginHoursSettings
                    open={loginHoursDialogOpen}
                    onClose={() => setLoginHoursDialogOpen(false)}
                    loginHours={loginHours}
                    onSave={setLoginHours}
                />
                <CloseConfirm open={openDialog} onClose={handleDialogClose} />
            </Stack>
        </Container>
    );
}

export default Logout;
