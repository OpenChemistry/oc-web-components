import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { 
  withStyles, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button,
  Tooltip, IconButton, Popper, Fade, Typography, Dialog } from '@material-ui/core';
import { Add, Delete, Edit, Assignment, Block, AddCircle } from '@material-ui/icons';
import ApiKeyForm from '../api-key-form';

const styles = () => ({
  root: {
    padding: '5px'
  },
  button: {
    display:'flex',
    justifyContent:'flex-end',
    margin:'5px',
  },
  typography: {
    padding: '5px',
  },
});

const ApiKeys = props => {
  const {apiKeys, handleEdit, handleDelete, handleSubmit, classes, scopeOptions} = props;
  const [popup, setPopup] = React.useState({visible: null, currentKey: null});
  const [openDialog, setOpenDialog] = React.useState({show: false, target: {}, create: true});

  const open = Boolean(popup.visible);
  const id = open ? 'simple-popper' : undefined;

  const handleClickOpen = (key, create) => {
    setOpenDialog({show: true, target: key, create: create});
  };

  const handleClose = (apiKey, choice) => {
    setOpenDialog({...openDialog, show: false});
    if (choice == 'edit') {
      handleEdit(apiKey, false);
    } else if (choice == 'create') {
      handleSubmit(apiKey);
    }
  };

  const handleShowKey = (e, key) => {
    setPopup({
      visible: popup.visible ? null : e.currentTarget,
      currentKey: key,
    });
  };

  const handleCopy = (event, text) => {
    const dummyEl = document.createElement('textarea');
    dummyEl.value = text;
    document.body.appendChild(dummyEl);
    dummyEl.select();
    document.execCommand('copy');
    document.body.removeChild(dummyEl);
  };

  return(
    <Paper className={classes.root}>
      <Dialog open={openDialog.show} onClose={handleClose}>
        <ApiKeyForm
          onClose={handleClose}
          apiKey={openDialog.target}
          newKey={openDialog.create}
          scopeOptions={scopeOptions}
        />
      </Dialog>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Key</TableCell>
            <TableCell>Scope</TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Token Duration</TableCell>
            <TableCell>Last Used</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {apiKeys.map((apiKey) => (
            <TableRow key={apiKey._id}>
              <TableCell>{apiKey.name}</TableCell>
              <TableCell>
                <Button color='primary' aria-describedby={id} onClick={(e) => {handleShowKey(e, apiKey.key)}}>
                  View Key
                </Button>
                <Popper id={id} open={open} anchorEl={popup.visible} placement='top' transition>
                  {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                      <Paper>
                        <Typography className={classes.typography}>{popup.currentKey}</Typography>
                      </Paper>
                    </Fade>
                  )}
                </Popper>
                <IconButton onClick={(e) => {handleCopy(e, apiKey.key)}}>
                  <Tooltip title='Copy to clipboard'>
                    <Assignment color='primary'/>
                  </Tooltip>
                </IconButton>
              </TableCell>
              <TableCell>
                {apiKey.scope == null ? 'Full Access' : 'Custom Access'}
              </TableCell>
              <TableCell>{apiKey.active ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                {apiKey.tokenDuration == null ? 'Default' : apiKey.tokenDuration}
              </TableCell>
              <TableCell>
                {apiKey.lastUse == null ? 'Never' : moment(apiKey.lastUse).fromNow()}
              </TableCell>
              <TableCell>
                <Tooltip title='Edit'>
                  <IconButton onClick={() => {handleClickOpen(apiKey, false)}}>
                    <Edit color='primary'/>
                  </IconButton>
                </Tooltip>
                {apiKey.active
                  ? <Tooltip title='Deactivate'>
                      <IconButton onClick={() => {handleEdit(apiKey, true)}}>
                        <Block color='secondary'/>
                      </IconButton>
                    </Tooltip>
                  : <Tooltip title='Activate'>
                      <IconButton onClick={() => {handleEdit(apiKey, true)}}>
                        <AddCircle color='primary'/>
                      </IconButton>
                    </Tooltip>
                }
                <Tooltip title='Delete'>
                  <IconButton onClick={() => {handleDelete(apiKey._id)}}>
                    <Delete color='secondary'/>
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className={classes.button}>
        <Button
          onClick={() => {handleClickOpen({}, true)}}
          type='submit'
          variant='contained'
          color='primary'>
          <Add/>
          Create New Key
        </Button>
      </div>
    </Paper>
  );
}

ApiKeys.propTypes = {
  apiKeys: PropTypes.array
}

ApiKeys.defaultProps = {
  apiKeys: []
}

export default withStyles(styles)(ApiKeys);
