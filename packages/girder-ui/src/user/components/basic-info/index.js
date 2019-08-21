import React, { useState } from 'react';
import { Button, TextField, Link, Typography } from '@material-ui/core';
import AccountsDialogContainer from '../../containers/link-accts';

const BasicInfoForm = props => {
  const {userInfo, onSubmit, twitterId, orcidId} = props
  const [formValues, setValues] = useState({firstName: '', lastName: '', email: ''});

  const updateFields = e => {
    setValues({
      ...formValues,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    for (var key in formValues) {
      if (!formValues[key]) {
        formValues[key] = userInfo[key];
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
            style={{marginBottom: '8px'}}
            name='firstName'
            label='First Name'
            placeholder={userInfo.firstName}
            value={formValues.firstName}
            fullWidth
            onChange={updateFields}
          />
        </div>
        <div>
          <TextField
            style={{marginBottom: '8px'}}
            name='lastName'
            label='Last Name'
            placeholder={userInfo.lastName}
            value={formValues.lastName}
            fullWidth
            onChange={updateFields}
          />
        </div>
        <div>
          <TextField
            style={{marginBottom: '8px'}}
            name='email'
            label='Email Address'
            placeholder={userInfo.email}
            value={formValues.email}
            fullWidth
            onChange={updateFields}
          />
        </div>
        <div style={{display:'flex', justifyContent:'space-between', marginTop:'10px'}}>
          <span style={{display:'flex'}}>
            <Typography variant='h6' style={{marginRight:'10px'}}>
              {'Twitter: '} 
              {twitterId
                ? <Link href={'http://www.twitter.com/' + twitterId} target='_blank'>
                    {twitterId}
                  </Link>
                : <span style={{color:'gray'}}>No Associated Id</span>}
              <AccountsDialogContainer title={'Twitter'} />
            </Typography>
            <Typography variant='h6' color='disabled'>
              {'Orcid: '} 
              {orcidId
                ? <Link href={'http://www.orcid.com/'+orcidId} target='_blank'>
                    {orcidId}
                  </Link>
                : <span style={{color:'gray'}}>No Associated Id</span>}
              <AccountsDialogContainer title={'Orcid'} />
            </Typography>
          </span>
          <span style={{display:'flex', justifyContent:'space-between'}}>
            <Button type='submit' variant='contained' color='primary'>Submit</Button>
          </span>
        </div>
      </form>
    </div>
  );
};

export default BasicInfoForm;
