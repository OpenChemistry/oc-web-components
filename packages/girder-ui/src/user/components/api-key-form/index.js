import React, { useState } from 'react';
import { 
  TextField, DialogActions, DialogContent, DialogTitle, Typography, FormControl,
  RadioGroup, FormControlLabel, Checkbox, Radio, FormGroup, Button 
} from '@material-ui/core';

const ApiKeyForm = props => {
  const {onClose, apiKey, newKey} = props;
  const [value, setValue] = useState(apiKey.scope ? 'restricted' : 'full');
  const [formValues, setValues] = useState({ name: apiKey.name, days: apiKey.tokenDuration });
  const [state, setState] = useState({
    user_info: !newKey && apiKey.scope.includes('core.user_info.read'),
    read: !newKey && apiKey.scope.includes('core.data.read'),
    write: !newKey && apiKey.scope.includes('core.data.write'),
    own: !newKey && apiKey.scope.includes('core.data.own'),
    plugins: !newKey && apiKey.scope.includes('core.plugins.read'),
    setting: !newKey && apiKey.scope.includes('core.setting.read'),
    assetstore: !newKey && apiKey.scope.includes('core.assetstore.read'),
    partial_upload: !newKey && apiKey.scope.includes('core.partial_upload.read'),
    clean: !newKey && apiKey.scope.includes('core.partial_upload.clean')
  });

  if (!apiKey) { 
    apiKey = {name: '', scope: null, tokenDuration: '', active: true} 
  }
  const { user_info, read, write, own, plugins, setting, assetstore, partial_upload, clean } = state;

  const handleRadioChange = event => {
    setValue(event.target.value);
  };

  const handleCheckChange = name => event => {
    setState({ ...state, [name]: event.target.checked });
  };

  const handleClickClose = (choice) => {
    if (value == 'restricted') {
      createJson();
    } else {
      apiKey.scope = null;
    }
    createKey();
    onClose(apiKey, choice);
  };

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
    console.log(json_list)
    apiKey.scope = json_list.length > 0 ? json_list : null;
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
    <div>
      <DialogTitle style={{textAlign:'center'}}>API Key Information</DialogTitle>
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
        <Typography variant="h6">Permission Scope</Typography>
        <FormControl>
          <RadioGroup value={value} onChange={handleRadioChange}>
            <FormControlLabel value='full' control={<Radio />} label='Allow all actions' />
            <FormControlLabel value='restricted' control={<Radio />} label='Allow specific permissions' />
          </RadioGroup>
          <FormGroup row>
            <FormGroup>
              <FormControlLabel
                disabled={value == 'full'}
                control={<Checkbox checked={user_info} onChange={handleCheckChange('user_info')} value='user_info' />}
                label='Read user information'
              />
              <FormControlLabel
                disabled={value == 'full'}
                control={<Checkbox checked={read} onChange={handleCheckChange('read')} value='read' />}
                label='Read data'
              />
              <FormControlLabel
                disabled={value == 'full'}
                control={<Checkbox checked={write} onChange={handleCheckChange('write')} value='write' />}
                label='Write data'
              />
              <FormControlLabel
                disabled={value == 'full'}
                control={<Checkbox checked={own} onChange={handleCheckChange('own')} value='own' />}
                label='Data ownership'
              />
              <FormControlLabel
                disabled={value == 'full'}
                control={<Checkbox checked={plugins} onChange={handleCheckChange('plugins')} value='plugins' />}
                label='See installed plugins'
              />
              </FormGroup>
              <FormGroup>
              <FormControlLabel
                disabled={value == 'full'}
                control={<Checkbox checked={setting} onChange={handleCheckChange('setting')} value='setting' />}
                label='See system setting values'
              />
              <FormControlLabel
                disabled={value == 'full'}
                control={<Checkbox checked={assetstore} onChange={handleCheckChange('assetstore')} value='assetstore' />}
                label='View assetstores'
              />
              <FormControlLabel
                disabled={value == 'full'}
                control={<Checkbox checked={partial_upload} onChange={handleCheckChange('partial_upload')} value='partial_upload' />}
                label='View unfinished uploads'
              />
              <FormControlLabel
                disabled={value == 'full'}
                control={<Checkbox checked={clean} onChange={handleCheckChange('clean')} value='clean' />}
                label='Remove unfinished uploads'
              />
            </FormGroup>
          </FormGroup>
        </FormControl>
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

export default ApiKeyForm;
