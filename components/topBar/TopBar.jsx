import React from 'react';
import './TopBar.css';
import {
  AppBar, Grid, Toolbar, Typography
} from '@material-ui/core';
import LogoutRegister from '../logoutRegister/LogoutRegister';
import UploadPhoto from '../uploadPhoto/UploadPhoto';
import DeleteUser from '../deleteUser/DeleteUser';

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
  }


  render() {
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
        <Grid container justifyContent="space-between">  
          <Typography variant="h5" align="left">Aditya Tadimeti</Typography>
          <Typography variant="h5" align="right">{this.props.stateVar.topBarText}</Typography>
          <UploadPhoto testValue = {"sdf"} uploadNewInfo = {this.props.photoUploaded}/>
          <DeleteUser logOnNewInfo = {this.props.onNewInfo}/>
          <LogoutRegister logOnNewInfo = {this.props.onNewInfo}/>
          
        </Grid>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
