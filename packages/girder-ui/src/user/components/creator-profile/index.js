import React from 'react';

import { withStyles, TextField, Link, InputAdornment, Paper, Grid } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew'

import { TwitterTimelineEmbed } from 'react-twitter-embed';

const styles = theme => ({
  paper: {
    padding: '10px'
  },
  textField: {
    marginTop: '8px'
  },
  column: {
    padding: theme.spacing.unit * 3
  }
});

const CreatorProfile = props => {
  const {userInfo, mediaIds, classes} = props;

  return (
    <Grid container style={{height: '100%'}} alignItems='stretch'>
      <Grid
        className={classes.column}
        item
        xs={mediaIds.twitterId ? 16 : 24}
        md={mediaIds.twitterId ? 8 : 12} >
        <Paper className={classes.paper}>
          <div>
            <TextField
              className={classes.textField}
              name='name'
              helperText='Name'
              value={userInfo.firstName + ' ' + userInfo.lastName}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
          <div>
            <TextField
              className={classes.textField}
              name='email'
              helperText='Email Address'
              value={userInfo.email}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
          <div>
            <TextField
              className={classes.textField}
              name='twitterId'
              helperText='Twitter Handle'
              value={mediaIds.twitterId ? mediaIds.twitterId : 'No Associated Twitter Handle'}
              InputProps={{
                readOnly: true,
                startAdornment:
                <InputAdornment position='start'>
                  {mediaIds.twitterId != undefined
                  ? <Link
                      href={'http://www.twitter.com/' + mediaIds.twitterId}
                      target='_blank'
                    >
                      <OpenInNewIcon/>
                    </Link>
                  : null }
                </InputAdornment>}}
              fullWidth
            />
          </div>
          <div>
            <TextField
              className={classes.textField}
              name='orcidId'
              helperText='Orcid ID'
              value={mediaIds.orcidId ? mediaIds.orcidId : 'No Associated Orcid ID'}
              InputProps={{
                readOnly: true,
                startAdornment:
                <InputAdornment position='start'>
                  {mediaIds.orcidId != undefined
                  ? <Link
                      href={'http://www.orcid.com/' + mediaIds.orcidId}
                      target='_blank'
                    >
                      <OpenInNewIcon color={mediaIds.orcidId ? 'primary' : 'disabled'}/>
                    </Link>
                  : null }
                </InputAdornment>}}
              fullWidth
            />
          </div>
        </Paper>
      </Grid>
      {mediaIds.twitterId
        ? <Grid className={classes.column} item xs={8} md={4} >
          <Paper>
            <TwitterTimelineEmbed
              sourceType="profile"
              screenName={mediaIds.twitterId}
              options={{height: 500}}
            />
          </Paper>
        </Grid>
        : null}
    </Grid>
  );
};

export default withStyles(styles)(CreatorProfile);
