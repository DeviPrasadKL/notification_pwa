import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, Stack, Typography, Switch } from '@mui/material';
import ThemeSwitcher from '../UIComponents/ThemeSwitcher';

export default function LoginHoursSettings({
    setLoginHoursDialogOpen,
    loginHoursDialogOpen,
    loginHours,
    handleLoginHoursSave,
    handleLoginHoursChange,
    darkMode,
    handleThemeToggle
}) {
    return (
        <Box
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: '2rem',
                    padding: '16px',
                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
                },
            }}
        >
            <Dialog open={loginHoursDialogOpen} onClose={() => setLoginHoursDialogOpen(false)}>
                <DialogTitle
                    sx={{
                        fontWeight: 'bold',
                        fontSize: '1.25rem',
                        borderBottom: '2.5px solid',
                        borderColor: 'divider',
                        paddingBottom: '16px',
                    }}
                >
                    Login Hours Settings
                </DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={{
                            marginBottom: '0.6rem',
                            marginTop:'1rem'
                        }}
                    >
                        <ThemeSwitcher
                            darkMode={darkMode}
                            handleThemeToggle={handleThemeToggle}
                        />
                    </Stack>
                    <TextField
                        label="Weekday Hours"
                        type="number"
                        name="weekday"
                        value={loginHours.weekday}
                        onChange={handleLoginHoursChange}
                        inputProps={{ min: 0 }}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '& .MuiInputLabel-root': {
                                color: 'text.primary',
                            },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                            },
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                            transition: 'all 0.3s ease',
                            ':hover': {
                                boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.3)',
                            },
                        }}
                    />
                    <TextField
                        label="Saturday Hours"
                        type="number"
                        name="saturday"
                        value={loginHours.saturday}
                        onChange={handleLoginHoursChange}
                        inputProps={{ min: 0 }}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '& .MuiInputLabel-root': {
                                color: 'text.primary',
                            },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                            },
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                            transition: 'all 0.3s ease',
                            ':hover': {
                                boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.3)',
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLoginHoursDialogOpen(false)} color="secondary">Cancel</Button>
                    <Button onClick={handleLoginHoursSave} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
