//enforce dashes in orcid id

import React, { useState } from 'react';
import { Button, TextField, Link, Typography, InputAdornment } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew'

const BasicInfoForm = props => {
  const {userInfo, onSubmit, mediaIds} = props
  const [formValues, setValues] = useState({
    firstName:userInfo.firstName,
    lastName:userInfo.lastName,
    email:userInfo.email,
    twitterId:mediaIds.twitterId,
    orcidId:mediaIds.orcidId
  });

  const updateFields = e => {
    if (e.target.name=='orcidId'
        && e.nativeEvent.inputType != 'deleteContentBackward') {
      if (orcidId.value.length == 4) {
        orcidId.value = orcidId.value+'-'
      } else if (orcidId.value.length == 9) {
        orcidId.value = orcidId.value+'-'
      } else if (orcidId.value.length == 14) {
        orcidId.value = orcidId.value+'-'
      }
    }
    setValues({
      ...formValues,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    for (var key in formValues) {
      if (!formValues[key]) {
        if (key == 'twitterId' || key == 'orcidId') {
          formValues[key] = mediaIds[key];
        } else {
          formValues[key] = userInfo[key];
        }
      }

      if (key == 'orcidId' && formValues[key].length < 19) {
        formValues[key] = mediaIds[key]
      }
    }

    onSubmit(userInfo._id, formValues);
  }

  return (
    <div style={{margin: '20px', maxWidth: '100%', padding: '5px'}}>
      <Typography variant='h4'>
        Edit Profile Information
      </Typography>
      <form style = {{padding: '5px'}} onSubmit={handleSubmit}>
        <div>
          <TextField
            style={{marginTop: '8px'}}
            name='firstName'
            helperText='First Name'
            value={
              formValues.firstName == undefined
              ? userInfo.firstName
              : formValues.firstName}
            fullWidth
            onChange={updateFields}
          />
        </div>
        <div>
          <TextField
            style={{marginTop: '8px'}}
            name='lastName'
            helperText='Last Name'
            value={
              formValues.lastName == undefined
              ? userInfo.lastName
              : formValues.lastName}
            fullWidth
            onChange={updateFields}
          />
        </div>
        <div>
          <TextField
            inputProps={{maxLength:15}}
            style={{marginTop: '8px'}}
            name='email'
            helperText='Email Address'
            value={
              formValues.email == undefined
              ? userInfo.email
              : formValues.email}
            fullWidth
            onChange={updateFields}
          />
        </div>
        <div>
          <TextField
            style={{marginTop: '8px'}}
            name='twitterId'
            helperText='Twitter Handle'
            placeholder='No Associated Handle'
            value={
              formValues.twitterId == undefined
              ? mediaIds.twitterId
              : formValues.twitterId}
            InputProps ={{
              startAdornment:
              <InputAdornment position='start'>
                {mediaIds.twitterId
                ? <Link
                    href={'http://www.twitter.com/'+mediaIds.twitterId}
                    target='_blank'
                  >
                    <OpenInNewIcon/>
                  </Link>
                : null }
              </InputAdornment>}}
            fullWidth
            onChange={updateFields}
          />
        </div>
        <div>
          <TextField
            inputProps={{maxLength:19}}
            style={{marginTop: '8px'}}
            name='orcidId'
            id='orcidId'
            helperText='Orcid ID'
            placeholder='No Associated Handle'
            value={
              formValues.orcidId == undefined
              ? mediaIds.orcidId
              : formValues.orcidId}
            InputProps ={{
              startAdornment:
              <InputAdornment position='start'>
                {mediaIds.orcidId
                ? <Link
                    href={'http://www.orcid.com/'+mediaIds.orcidId}
                    target='_blank'
                  >
                    <OpenInNewIcon color={mediaIds.orcidId ? 'primary' : 'disabled'}/>
                  </Link>
                : null }
              </InputAdornment>}}
            fullWidth
            onChange={updateFields}
          />
        </div>
        <div style={{display:'flex', justifyContent:'flex-end'}}>
          <Button type='submit' variant='contained' color='primary'>Save</Button>
        </div>
      </form>
    </div>
  );
};

export default BasicInfoForm;
