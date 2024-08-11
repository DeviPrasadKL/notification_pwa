import { Box } from '@mui/material'
import React from 'react'
import { Button, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

export default function CloseConfirm({ openDialog, setOpenDialog, handleDialogClose }) {
    return (
        <Box>
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
        </Box>
    )
}
