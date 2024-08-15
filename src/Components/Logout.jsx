import React, { useState, useEffect, useRef } from 'react';
import { Button, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stack, TextField, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LoginHoursSettings from './LoginHoursSettings';
import CloseConfirm from './CloseConfirm';
import SettingsIcon from '@mui/icons-material/Settings';

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
    const timerRef = useRef(null);
    const [breakStartedAt, setBreakStartedAt] = useState(null);

    useEffect(() => {
        const savedLoginTime = localStorage.getItem('loginTime');
        const savedBreaks = JSON.parse(localStorage.getItem('breaks')) || [];
        const savedExpectedLogoutTime = localStorage.getItem('expectedLogoutTime');
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
    }, []);

    useEffect(() => {
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

    const updateExpectedLogoutTime = (loginDate, hours = loginHours) => {
        const isSaturday = loginDate.getDay() === 6; // 6 corresponds to Saturday
        const hoursToAdd = isSaturday ? hours.saturday : hours.weekday;
        const logoutTime = new Date(loginDate.getTime() + hoursToAdd * 60 * 60 * 1000);
        setExpectedLogoutTime(logoutTime);
        localStorage.setItem('expectedLogoutTime', logoutTime.toISOString());
    };

    const updateTotalBreakDuration = (formattedBreaks) => {
        const totalBreakDuration = formattedBreaks.reduce((acc, b) => {
            const [minutes, seconds] = b.duration.split('m').map(part => parseInt(part, 10));
            const durationInMs = (minutes || 0) * 60 * 1000 + (seconds || 0) * 1000;
            return acc + durationInMs;
        }, 0);

        if (expectedLogoutTime) {
            const updatedLogoutTime = new Date(expectedLogoutTime.getTime() + totalBreakDuration);
            setExpectedLogoutTime(updatedLogoutTime);
            localStorage.setItem('expectedLogoutTime', updatedLogoutTime.toISOString());
        }
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

        const updatedBreaks = breaks.filter((_, i) => i !== index);
        setBreaks(updatedBreaks);

        // Calculate new total break duration
        const totalBreakDuration = updatedBreaks.reduce((acc, b) => {
            const [minutes, seconds] = b.duration.split('m').map(part => parseInt(part, 10));
            const durationInMs = (minutes || 0) * 60 * 1000 + (seconds || 0) * 1000;
            return acc + durationInMs;
        }, 0);

        // Adjust expected logout time
        if (expectedLogoutTime) {
            const updatedLogoutTime = new Date(expectedLogoutTime.getTime() - durationToRemoveMs);
            setExpectedLogoutTime(updatedLogoutTime);
            localStorage.setItem('expectedLogoutTime', updatedLogoutTime.toISOString());
        }

        localStorage.setItem('breaks', JSON.stringify(updatedBreaks));
    };

    const handleLoginHoursChange = (event) => {
        const { name, value } = event.target;
        setLoginHours(prev => {
            const newHours = { ...prev, [name]: parseInt(value, 10) || 0 };
            localStorage.setItem('loginHours', JSON.stringify(newHours)); // Save to local storage
            return newHours;
        });
    };

    const handleLoginHoursSave = () => {
        const now = loginTime ? new Date(loginTime) : new Date();
        updateExpectedLogoutTime(now, loginHours);
        setLoginHoursDialogOpen(false);
    };

    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };

    function formatDate(date) {
        const weekdayOptions = { weekday: 'short' };
        const dayOptions = { day: '2-digit' };
        const monthOptions = { month: '2-digit' };

        const weekday = new Intl.DateTimeFormat('en-US', weekdayOptions).format(date);
        const day = new Intl.DateTimeFormat('en-US', dayOptions).format(date);
        const month = new Intl.DateTimeFormat('en-US', monthOptions).format(date);

        return `${weekday} ${day}/${month}`;
    }

    const calculateTotalBreakDuration = () => {
        const totalDuration = breaks.reduce((acc, b) => {
            const [minutes, seconds] = b.duration.split('m').map(part => parseInt(part, 10));
            const durationInMs = (minutes || 0) * 60 * 1000 + (seconds || 0) * 1000;
            return acc + durationInMs;
        }, 0);

        const totalMinutes = Math.floor(totalDuration / (1000 * 60));
        const totalSeconds = Math.floor(totalDuration / 1000) % 60;

        if (totalMinutes >= 60) {
            const totalHours = Math.floor(totalMinutes / 60);
            const minutesRemaining = totalMinutes % 60;
            return `${totalHours.toString().padStart(2, '0')}h ${minutesRemaining.toString().padStart(2, '0')}m ${totalSeconds.toString().padStart(2, '0')}s`;
        } else {
            return `${totalMinutes}m ${totalSeconds}s`;
        }
    };

    // Helper function to check if a break can be deleted
    const canDeleteBreak = (breakStartTime) => {
        const breakStartDate = new Date(breakStartTime);
        const now = new Date();
        const diffMinutes = (now - breakStartDate) / (1000 * 60);
        // Return true if less than or equal to 2 minutes
        return diffMinutes <= 2;
    };


    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Container>

            <Stack flexDirection='row' justifyContent='space-between' alignItems='baseline' pt={2}>
                <Typography variant="h5" gutterBottom>
                    {loginTime ? `${formatDate(loginTime)}` : 'No login time recorded'}
                </Typography>
                <IconButton onClick={() => setLoginHoursDialogOpen(true)} color='secondary'>
                    <SettingsIcon />
                </IconButton>
            </Stack>

            {loginTime && (
                <Typography variant="p">
                    Logged In:- {loginTime.toLocaleTimeString('en-US', timeOptions)}<br />
                    Expected Logout:- {expectedLogoutTime?.toLocaleTimeString('en-US', timeOptions)}
                </Typography>
            )}

            <Stack p={2} justifyContent='center' alignItems='center'>
                <Button variant="contained" color='success' onClick={handleLogin} sx={{ display: !!loginTime ? 'none' : 'block', height: '8rem', width: '8rem', borderRadius: '50%' }} disabled={!!loginTime}>Login</Button>
                <Button sx={{ display: !loginTime || isBreakInProgress ? 'none' : 'block', height: '8rem', width: '8rem', borderRadius: '50%' }} variant="contained" onClick={handleBreakStart} disabled={!loginTime || isBreakInProgress}>Break Start</Button>
                <Button sx={{ display: !isBreakInProgress ? 'none' : 'block', height: '8rem', width: '8rem', borderRadius: '50%' }} variant="contained" color='error' onClick={handleBreakEnd} disabled={!isBreakInProgress}>Break End</Button>
            </Stack>

            {isBreakInProgress && (
                <Typography variant="h6" style={{ marginTop: 20 }}>
                    {/* Break Timer: {Math.floor(elapsedTime)} seconds<br /> */}
                    Break Timer: {formatTime(Math.floor(elapsedTime))}
                </Typography>
            )}

            {breaks.length !== 0 && (
                <TableContainer component={Paper} style={{ marginTop: 20 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Break Start</TableCell>
                                <TableCell>Break End</TableCell>
                                <TableCell>Break Duration</TableCell>
                                <TableCell>Actions</TableCell> {/* New column for delete icon */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {breaks.map((breakRecord, index) => (
                                <TableRow key={index}>
                                    <TableCell>{new Date(breakRecord.start).toLocaleTimeString('en-US', timeOptions)}</TableCell>
                                    <TableCell>{new Date(breakRecord.end).toLocaleTimeString('en-US', timeOptions)}</TableCell>
                                    <TableCell>{breakRecord.duration}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => handleDeleteBreak(index)}
                                            color="error"
                                            disabled={!canDeleteBreak(breakRecord.start)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={2} style={{ fontWeight: 'bold' }}>Total Break Duration</TableCell>
                                <TableCell colSpan={2} style={{ fontWeight: 'bold' }}>{calculateTotalBreakDuration()}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {loginTime && (
                <Stack direction="row" spacing={2} style={{ marginTop: 20 }}>
                    <TextField
                        label="Add Break Time (minutes)"
                        type="number"
                        value={manualBreakDuration}
                        onChange={(e) => setManualBreakDuration(e.target.value)}
                        inputProps={{ min: 0 }}
                    />
                    <Button variant="contained" color="primary"
                        onClick={handleAddManualBreak}
                        disabled={manualBreakDuration === ''}
                    >
                        Add Break
                    </Button>
                </Stack>
            )}

            {loginTime &&
                <Stack pb={2}>
                    {/* <Button variant="outlined" color="secondary"
                    onClick={() => setLoginHoursDialogOpen(true)}
                    style={{ marginTop: 20 }}>
                    Login hours Settings
                </Button> */}

                    <Button variant="outlined" color="error" onClick={handleClearData} style={{ marginTop: 20 }}>
                        Clear Data
                    </Button>
                </Stack>
            }

            {/* Login Settings */}
            <LoginHoursSettings
                setLoginHoursDialogOpen={setLoginHoursDialogOpen}
                loginHoursDialogOpen={loginHoursDialogOpen}
                loginHours={loginHours}
                handleLoginHoursSave={handleLoginHoursSave}
                handleLoginHoursChange={handleLoginHoursChange}
                darkMode={darkMode}
                handleThemeToggle={handleThemeToggle}
            />

            {/* App close confirm dialog */}
            <CloseConfirm
                openDialog={openDialog}
                setOpenDialog={setOpenDialog}
                handleDialogClose={handleDialogClose}
            />
        </Container>
    );
}

export default Logout;
