import React from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent } from '@material-ui/core';

const AccountsDialog = props => {
  const {title, onSubmit, userInfo} = props
  const [open, setOpen] = React.useState(false);

  function handleClickOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(false);
    onSubmit(userInfo._id, user_id.value, title);
  }

  function handleChange(e) {
    if (title=='Orcid' && e.nativeEvent.inputType != 'deleteContentBackward') {
      if (user_id.value.length == 4) {
        user_id.value = user_id.value+'-'
      } else if (user_id.value.length == 9) {
        user_id.value = user_id.value+'-'
      } else if (user_id.value.length == 14) {
        user_id.value = user_id.value+'-'
      }
    }
  }

  return (
    <span style={{margin:'10px'}}>
      <Button variant='outlined' color='primary' onClick={handleClickOpen}>
        Update {title} Id
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Link to {title} Account</DialogTitle>
        <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            inputProps={{maxLength:(title=='Twitter') ? 15 : 19}}
            autoFocus
            margin='dense'
            id='user_id'
            label='User Id'
            type='text'
            fullWidth
            onChange={handleChange}
          />
          <Button onClick={handleClose} color='primary'>
            Cancel
          </Button>
          <Button type='submit' color='primary'>
            Submit
          </Button>
        </form>
        </DialogContent>
      </Dialog>
    </span>
  );
};

export default AccountsDialog;
