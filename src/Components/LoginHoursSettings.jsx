import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box } from '@mui/material';

export default function LoginHoursSettings({ setLoginHoursDialogOpen, loginHoursDialogOpen, loginHours, handleLoginHoursSave, handleLoginHoursChange }) {
    return (
        <Box>
            {/* Dialog for Login Hours Settings */}
            <Dialog open={loginHoursDialogOpen} onClose={() => setLoginHoursDialogOpen(false)}>
                <DialogTitle>Login Hours Settings</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Weekday Hours"
                        type="number"
                        name="weekday"
                        value={loginHours.weekday}
                        onChange={handleLoginHoursChange}
                        inputProps={{ min: 0 }}
                        fullWidth
                        style={{ marginTop: 16 }}
                    />
                    <TextField
                        label="Saturday Hours"
                        type="number"
                        name="saturday"
                        value={loginHours.saturday}
                        onChange={handleLoginHoursChange}
                        inputProps={{ min: 0 }}
                        fullWidth
                        style={{ marginTop: 16 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLoginHoursDialogOpen(false)} color="secondary">Cancel</Button>
                    <Button onClick={handleLoginHoursSave} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
