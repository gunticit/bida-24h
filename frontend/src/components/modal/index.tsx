import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  borderRadius: '8px',
  border: '1px solid #ccc',
  boxShadow: 24,
  p: 4,
};

export default function BasicModal({
  open,
  setOpen,
  children
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const handleClose = () => setOpen(false);
  return <Modal
    open={open}
    onClose={handleClose}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
    disableEnforceFocus
    disableAutoFocus
  >
    <Box sx={style}>
      {children}
    </Box>
  </Modal>
}
