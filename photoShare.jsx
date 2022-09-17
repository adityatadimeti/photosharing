import React from 'react';
import ReactDOM from 'react-dom';
import {
  Redirect, HashRouter, Route, Switch
} from 'react-router-dom';
import {
   Grid, Paper, 
} from '@material-ui/core';
import './styles/main.css';

// import necessary components
import axios from 'axios';
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './components/loginRegister/LoginRegister';


class PhotoShare extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // topBarText: 'PhotoShare',
      topBarText: 'Please Login',
      photoUploaded: false,
      userSession: ''
    };
  }

  updateState = (newState) =>{
    this.setState({topBarText: newState});
    // this.setState({userSession: userID});
  };

  updateSession = (userID) => {
    this.setState({userSession: userID});
  };
  uploadPhotoState = (newState) =>{
    this.setState({photoUploaded: newState});
  };

  getState = () => {
    return this.state;
  };

  // isLoggedIn = () => {
    
  //   axios.get('/request/session')
  //   .then(response => {
  //     if (response.status === 200) {
  //       console.log(response.data);
  //       //this.updateState('Hi ' + response.data.first_name, response.data._id);
  //     }
  //   }
  //   )
  //   .catch(error => {
  //     console.log(error);
  //   }
  //   );
  // };

  isLoggedIn = () => {
    axios.get('/request/session')
    .then(response => {
      if (response.status === 200) {
        // console.log(response.data);
        // this.updateState('Hi ' + response.data.first_name, response.data._id);
      }
    }
    )
    .catch(error => {
      console.log(error);
    }
    );
    return this.state.topBarText !== 'Please Login';
  };


render() {
  return (
    <HashRouter>
    <div>
      {
        !this.isLoggedIn() ? (
          <Switch>
            <Redirect path = "/users/:userId" to = "/login-register"/>
            <Redirect path = "/photos/:userId" to = "/login-register"/>
            <Redirect path = "/users" to = "/login-register"/>
            <Redirect exact path = "/" to = "/login-register"/>
            <Route path="/login-register" render={ props => (
<LoginRegister onNewInfo = {this.updateState} updateSession = {this.updateSession} 
            {...props} />
) }/>
          </Switch>
        )

          : (
            
          <Grid container spacing={8}>
              <Grid item xs={12}>
                <TopBar stateVar = {this.state} onNewInfo = {this.updateState} photoUploaded = {this.uploadPhotoState}/>
                
              </Grid>
              <div className="cs142-main-topbar-buffer"/>
              <Grid item sm={3}>
                <Paper className="cs142-main-grid-item">
                  <UserList />
                </Paper>
              </Grid>
              <Grid item sm={9}>
                <Paper className="cs142-main-grid-item">
                  <Switch>
                    {/* {
                      this.isLoggedIn()?
                        <Redirect path = "/login-register" to = {"users/:" + this.state.userIDValue}/>
                         :
                        <Route path="/login-register" render={ props => <LoginRegister onNewInfo = {this.updateState} {...props} /> }/>
                    } */}
                    {
                      this.isLoggedIn() ? (
                        <Route path="/users/:userId" 
                          render={ props => <UserDetail onNewInfo = {this.updateState} {...props} /> }
                        />
                      )
                        :
                        <Redirect path = "/users/:userId" to = "/login-register"/>
                    }

                    {
                      this.isLoggedIn() ? (
                      <Route path="/photos/:userId" 
                        render ={ props => (
                        <UserPhotos onNewInfo = {this.updateState} photoUploaded = {this.state.photoUploaded} 
                        uploadPhotoState = {this.uploadPhotoState} userSession = {this.state.userSession} tempVar = {'hi'} {...props} />
) }
                      />
                    )
                        :
                        <Redirect path = "/photos/:userId" to = "/login-register"/>
                    }


                    {
                      this.isLoggedIn() ?
                        <Route path="/users" onNewInfo = {this.updateState} component={UserList}  />
                        :
                        <Redirect path = "/users" to = "/login-register"/>
                    }

                  </Switch>
                </Paper>
              </Grid>
          </Grid>
        )
}
      
    {/* <Grid container spacing={8}>
      <Grid item xs={12}>
        <TopBar stateVar = {this.state}/>
      </Grid>
      <div className="cs142-main-topbar-buffer"/>
      <Grid item sm={3}>
        <Paper className="cs142-main-grid-item">
          <UserList />
        </Paper>
      </Grid>
      <Grid item sm={9}>
        <Paper className="cs142-main-grid-item">
          <Switch>
            

            {
              this.isLoggedIn() ?
                <Route path="/users/:userId" 
                  render={ props => <UserDetail onNewInfo = {this.updateState} {...props} /> }
                />
                :
                <Redirect path = "/users/:userId" to = "/login-register"/>
            }

            {
              this.isLoggedIn() ?
              <Route path="/photos/:userId" 
                render ={ props => <UserPhotos onNewInfo = {this.updateState} {...props} /> }
              />
                :
                <Redirect path = "/photos/:userId" to = "/login-register"/>
            }

            {
              this.isLoggedIn() ?
                <Route path="/users" onNewInfo = {this.updateState} component={UserList}  />
                :
                <Redirect path = "/users" to = "/login-register"/>
            }

          </Switch>
        </Paper>
      </Grid>
    </Grid> */}
    </div>
    </HashRouter>
  );
}
}



ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
