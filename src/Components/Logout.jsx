import React, { useState, useEffect, useRef } from 'react';
import { Button, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';

function Logout() {
    const [loginTime, setLoginTime] = useState(null);
    const [expectedLogoutTime, setExpectedLogoutTime] = useState(null);
    const [breakStart, setBreakStart] = useState(null);
    const [breakEnd, setBreakEnd] = useState(null);
    const [breaks, setBreaks] = useState([]);
    const [isBreakInProgress, setIsBreakInProgress] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const timerRef = useRef(null);
    const [breakStartedAt, setBreakStartedAt] = useState(null);

    useEffect(() => {
        const savedLoginTime = localStorage.getItem('loginTime');
        const savedBreaks = JSON.parse(localStorage.getItem('breaks')) || [];
        const savedExpectedLogoutTime = localStorage.getItem('expectedLogoutTime');
        const breakExists = localStorage.getItem('breakStartTime');
        if (breakExists) {
            setBreakStartedAt(breakExists);
            setIsBreakInProgress(true);
            setBreakStart(new Date(breakExists));
        }

        if (savedLoginTime) {
            const loginDate = new Date(savedLoginTime);
            setLoginTime(loginDate);
            const hoursToAdd = loginDate.getDay() === 6 ? 5 : 8; // Saturday or not
            const logoutTime = new Date(loginDate.getTime() + hoursToAdd * 60 * 60 * 1000);
            setExpectedLogoutTime(logoutTime);
        }

        if (savedExpectedLogoutTime) {
            setExpectedLogoutTime(new Date(savedExpectedLogoutTime));
        }

        const formattedBreaks = savedBreaks.map(b => ({
            start: new Date(b.start),
            end: new Date(b.end),
            duration: b.duration
        }));
        setBreaks(formattedBreaks);

        // Calculate total break duration and update expected logout time
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

    const handleLogin = () => {
        const now = new Date();
        setLoginTime(now);
        localStorage.setItem('loginTime', now.toISOString());

        const isSaturday = now.getDay() === 6; // 6 corresponds to Saturday
        const hoursToAdd = isSaturday ? 5 : 8;
        const logoutTime = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
        setExpectedLogoutTime(logoutTime);
        localStorage.setItem('expectedLogoutTime', logoutTime.toISOString());
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
            localStorage.clear();
            setLoginTime(null);
            setExpectedLogoutTime(null);
            setBreaks([]);
        }
        setOpenDialog(false);
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

        return `${totalMinutes}m ${totalSeconds}s`;
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                {loginTime ? `Date: ${formatDate(loginTime)}` : 'No login time recorded'}
            </Typography>
            {loginTime && (
                <Typography variant="p">
                    Logged In Time: {loginTime.toLocaleTimeString('en-US', timeOptions)}<br />
                    Expected Logout Time: {expectedLogoutTime?.toLocaleTimeString('en-US', timeOptions)}
                </Typography>
            )}
            <Stack p={2} justifyContent='center' alignItems='center'>
                <Button variant="contained" color='success' onClick={handleLogin} sx={{ display: !!loginTime ? 'none' : 'block', height: '8rem', width: '8rem', borderRadius: '50%' }} disabled={!!loginTime}>Login</Button>
                <Button sx={{ display: !loginTime || isBreakInProgress ? 'none' : 'block', height: '8rem', width: '8rem', borderRadius: '50%' }} variant="contained" onClick={handleBreakStart} disabled={!loginTime || isBreakInProgress}>Break Start</Button>
                <Button sx={{ display: !isBreakInProgress ? 'none' : 'block', height: '8rem', width: '8rem', borderRadius: '50%' }} variant="contained" color='error' onClick={handleBreakEnd} disabled={!isBreakInProgress}>Break End</Button>
            </Stack>

            {isBreakInProgress && (
                <Typography variant="h6" style={{ marginTop: 20 }}>
                    Break Timer: {Math.floor(elapsedTime)} seconds
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
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {breaks.map((breakRecord, index) => (
                                <TableRow key={index}>
                                    <TableCell>{new Date(breakRecord.start).toLocaleTimeString('en-US', timeOptions)}</TableCell>
                                    <TableCell>{new Date(breakRecord.end).toLocaleTimeString('en-US', timeOptions)}</TableCell>
                                    <TableCell>{breakRecord.duration}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={2} style={{ fontWeight: 'bold' }}>Total Break Duration</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>{calculateTotalBreakDuration()}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Button variant="outlined" color="error" onClick={handleClearData} style={{ marginTop: 20 }}>
                Clear Data
            </Button>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Clear Data</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to clear all data?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleDialogClose(false)} color="secondary">No</Button>
                    <Button onClick={() => handleDialogClose(true)} color="primary">Yes</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Logout;
