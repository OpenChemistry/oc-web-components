import React, { useState } from 'react';
import { 
  TextField, DialogActions, DialogContent, DialogTitle, Typography, FormControl,
  RadioGroup, FormControlLabel, Checkbox, Radio, FormGroup, Button, withStyles
} from '@material-ui/core';

const styles = () => ({
  checkForm: {
    display: 'inline'
  },
  checkBoxes: {
    width: '50%',
    minWidth: 'fit-content',
    boxSizing: 'border-box',
    marginRight: '10px'
  },
  title: {
    textAlign: 'center'
  },
  root: {
    width: 'fit-content'
  }
});

const ApiKeyForm = props => {
  const {onClose, apiKey, newKey, scopeOptions, classes} = props;
  if (!apiKey) {
    apiKey = {name: '', scope: null, tokenDuration: '', active: true}
  }

  const [value, setValue] = useState(apiKey.scope && apiKey.scope.length == scopeOptions.length ? 'full' : 'restricted');
  const [formValues, setValues] = useState({
    name: newKey ? '' : apiKey.name,
    days: newKey ? '' : apiKey.tokenDuration
  });
  const [state, setState] = useState({
    user_info:apiKey.scope && apiKey.scope.includes('core.user_info.read'),
    read:apiKey.scope && apiKey.scope.includes('core.data.read'),
    write:apiKey.scope && apiKey.scope.includes('core.data.write'),
    own:apiKey.scope && apiKey.scope.includes('core.data.own'),
    plugins:apiKey.scope && apiKey.scope.includes('core.plugins.read'),
    setting:apiKey.scope && apiKey.scope.includes('core.setting.read'),
    assetstore:apiKey.scope && apiKey.scope.includes('core.assetstore.read'),
    partial_upload:apiKey.scope && apiKey.scope.includes('core.partial_upload.read'),
    clean:apiKey.scope && apiKey.scope.includes('core.partial_upload.clean')
  });

  /*
    scopeOptions are optional and can be used to limit the permissions available.

    user_info:
      Allows clients to look up your user information, including private fields such
      as email address.
    read:
      Allows clients to read all data that you have access to.
    write:
      Allows clients to edit data in the hierarchy and create new data anywhere you
      have write access.
    own:
      Allows administrative control on data you own, including setting access control
      and deletion.
    plugins:
      Allows clients to see the list of plugins installed on the server.
    setting:
      Allows clients to view the value of any system setting.
    assetstore:
      Allows clients to see all assetstore information.
    partial_upload:
      View unfinished uploads. Allows clients to see all partial uploads.
    clean:
      Allows clients to remove unfinished uploads.
  */
  if (!scopeOptions) {
    var properties = ['user_info', 'read', 'write', 'own', 'plugins', 'setting', 'assetstore', 'partial_upload', 'clean']
  } else {
    var properties = scopeOptions;
  }

  const { user_info, read, write, own, plugins, setting, assetstore, partial_upload, clean } = state;

  const handleRadioChange = event => {
    setValue(event.target.value);
  };

  const handleCheckChange = name => event => {
    setState({ ...state, [name]: event.target.checked });
  };

  const handleClickClose = (choice) => {
    if (choice != 'cancel') {
      if (!apiKey.scope) {
        createScope();
      }
      createJson();
      createKey();
    }
    onClose(apiKey, choice);
  };

  const createScope = () => {
    properties.forEach((element) => {
      state[element]=true;
    });
  }
  const createJson = () => {
    var json_list = []
    for (var key in state) {
      if (state[key]) {
        if (key == 'read' || key == 'write' || key == 'own') {
          json_list.push('core.data.' + key);
        } else if (key == 'clean') {
          json_list.push('core.partial_upload.clean');
        } else {
          json_list.push('core.' + key + '.read');
        }
      }
    }
    apiKey.scope = json_list;
  };

  const createKey = () => {
    apiKey.name = formValues.name;
    apiKey.tokenDuration = formValues.days;
    apiKey.active = true;
  };

  const updateFields = e => {
    setValues({
      ...formValues,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={classes.root}>
      <DialogTitle className={classes.title}>API Key Information</DialogTitle>
      <DialogContent>
        <Typography variant="h6">API Key Name</Typography>
        <TextField
          margin='dense'
          name='name'
          placeholder='Name'
          type='text'
          value={formValues.name}
          fullWidth
          onChange={updateFields}
        />
        <Typography variant="h6">Token Duration (days)</Typography>
        <TextField
          margin='dense'
          name='days'
          placeholder='Number of days'
          type='number'
          value={formValues.days}
          fullWidth
          onChange={updateFields}
        />
        {properties.length > 1
          ? <div>
          <Typography variant="h6">Permission Scope</Typography>
          <FormControl>
            <RadioGroup value={value} onChange={handleRadioChange}>
              <FormControlLabel value='full' control={<Radio />} label='Allow all actions' />
              <FormControlLabel value='restricted' control={<Radio />} label='Allow specific permissions' />
            </RadioGroup>
            <FormGroup className={classes.checkForm}>
              {properties.includes('user_info')
                ? <FormControlLabel
                    className={classes.checkBoxes}
                    disabled={value == 'full'}
                    control={<Checkbox checked={user_info} onChange={handleCheckChange('user_info')} value='user_info' />}
                    label='Read user information'
                  />
                : null}

              {properties.includes('read')
                ? <FormControlLabel
                    className={classes.checkBoxes}
                    disabled={value == 'full'}
                    control={<Checkbox checked={read} onChange={handleCheckChange('read')} value='read' />}
                    label='Read data'
                  />
                : null}

              {properties.includes('write')
                ? <FormControlLabel
                    className={classes.checkBoxes}
                    disabled={value == 'full'}
                    control={<Checkbox checked={write} onChange={handleCheckChange('write')} value='write' />}
                    label='Write data'
                  />
                : null}

              {properties.includes('own')
                ? <FormControlLabel
                    className={classes.checkBoxes}
                    disabled={value == 'full'}
                    control={<Checkbox checked={own} onChange={handleCheckChange('own')} value='own' />}
                    label='Data ownership'
                  />
                : null}

              {properties.includes('plugins')
                ? <FormControlLabel
                    className={classes.checkBoxes}
                    disabled={value == 'full'}
                    control={<Checkbox checked={plugins} onChange={handleCheckChange('plugins')} value='plugins' />}
                    label='See installed plugins'
                  />
                : null}

              {properties.includes('setting')
                ? <FormControlLabel
                    className={classes.checkBoxes}
                    disabled={value == 'full'}
                    control={<Checkbox checked={setting} onChange={handleCheckChange('setting')} value='setting' />}
                    label='See system setting values'
                  />
                : null}

              {properties.includes('assetstore')
                ? <FormControlLabel
                    className={classes.checkBoxes}
                    disabled={value == 'full'}
                    control={<Checkbox checked={assetstore} onChange={handleCheckChange('assetstore')} value='assetstore' />}
                    label='View assetstores'
                  />
                : null}

              {properties.includes('partial_upload')
                ? <FormControlLabel
                    className={classes.checkBoxes}
                    disabled={value == 'full'}
                    control={<Checkbox checked={partial_upload} onChange={handleCheckChange('partial_upload')} value='partial_upload' />}
                    label='View unfinished uploads'
                  />
                : null}

              {properties.includes('clean')
                ? <FormControlLabel
                    className={classes.checkBoxes}
                    disabled={value == 'full'}
                    control={<Checkbox checked={clean} onChange={handleCheckChange('clean')} value='clean' />}
                    label='Remove unfinished uploads'
                  />
                : null}
            </FormGroup>
          </FormControl>
          </div>
          : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {handleClickClose('cancel')}} color="primary">
          Cancel
        </Button>
        <Button  onClick={() => {handleClickClose(newKey ? 'create' : 'edit')}} color="primary">
          Submit
        </Button>
      </DialogActions>
    </div>
  );
}

export default withStyles(styles)(ApiKeyForm);
