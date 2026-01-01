'use client'

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Box,
} from '@mui/material'
import { Warning as WarningIcon } from '@mui/icons-material'

export interface ConfirmDialogProps {
    open: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel: () => void
    severity?: 'warning' | 'error' | 'info'
}

const ConfirmDialog = ({
    open,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    onConfirm,
    onCancel,
    severity = 'warning',
}: ConfirmDialogProps) => {
    const getSeverityColor = () => {
        switch (severity) {
            case 'error':
                return 'error.main'
            case 'warning':
                return 'warning.main'
            case 'info':
                return 'info.main'
            default:
                return 'warning.main'
        }
    }

    const getButtonColor = () => {
        switch (severity) {
            case 'error':
                return 'error'
            case 'warning':
                return 'warning'
            case 'info':
                return 'info'
            default:
                return 'warning'
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    minWidth: 320,
                    maxWidth: 420,
                },
            }}
        >
            <DialogTitle
                id="confirm-dialog-title"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    pb: 1,
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: `${getSeverityColor()}`,
                        opacity: 0.15,
                    }}
                >
                    <WarningIcon
                        sx={{
                            color: getSeverityColor(),
                            fontSize: 24,
                        }}
                    />
                </Box>
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText
                    id="confirm-dialog-description"
                    sx={{ color: 'text.secondary' }}
                >
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                <Button
                    onClick={onCancel}
                    variant="outlined"
                    color="inherit"
                    sx={{ minWidth: 80 }}
                >
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={getButtonColor()}
                    autoFocus
                    sx={{ minWidth: 80 }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConfirmDialog
