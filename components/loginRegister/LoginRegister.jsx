import React from 'react';
import './LoginRegister.css';
import {
  Button,
  TextField,
  Grid,
  Paper,
  AppBar,
  Typography,
  Toolbar,
} from "@material-ui/core";
import axios from 'axios';

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class LoginRegister extends React.Component {
    constructor(props) {
        super(props);
    
        this.state = {
          username: '',
          password : '',
          loginCaption: 'Login | Errors: none!',

          registerUsername: '',
          registerPassword: '',
          confirmPassword: '',

          registerCaption: 'Register | Errors: none!',

          registerFirstName: '',
          registerLastName: '',
          registerLocation: '',
          registerDescription:  '',
          registerOccupation: '',
        };
        //this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this);
      }

      handleChange(event) {
        this.setState({ username: event.state.username, password: event.state.password });
      }
  handleSubmit(event) {
    event.preventDefault();
    // console.log('entered submit')
    // console.log(this.state.username);
    axios.post('/admin/login', {
      login_name: this.state.username,
      password: this.state.password,
    })
      .then(response => {
        if (response.status === 200) {
          // console.log(response.data)
          this.props.onNewInfo('Hi ' + response.data.first_name);
          this.props.updateSession(response.data._id);
        }
      })
      .catch(error => {
        if (error.response.data === 'Wrong password') {
          this.setState({
            loginCaption: 'Login | Wrong password',
          });
        }
        if (error.response.data === 'No user with specified login') {
          this.setState({
            loginCaption: 'Login | No user with specified login',
          });
        }
        console.log(error.response.data);
      });
  }
  handleRegisterSubmit(event) {
    console.log(this);
    if (this.state.registerPassword !== this.state.confirmPassword) {
      this.setState({
        registerCaption: 'Register | Passwords do not match',
      });
      return;
    } 
    event.preventDefault();
    axios.post('/user', {
      login_name: this.state.registerUsername,
      password: this.state.registerPassword,
      first_name: this.state.registerFirstName,
      last_name: this.state.registerLastName,
      location: this.state.registerLocation,
      description: this.state.registerDescription,
      occupation: this.state.registerOccupation,
    })
      .then(response => {
        if (response.status === 200) {
          this.setState({
            registerFirstName: '',
            registerLastName: '',
            registerLocation: '',
            registerDescription: '',
            registerOccupation: '',
            registerUsername: '',
            registerPassword: '',
            confirmPassword: '',
            registerCaption: 'Register | Success!',
          });
        }
        console.log(response);
      })
      .catch(error => {
        console.log(error.response.data);
        if (error.response.data === 'User with specified username already exists') {
          this.setState({
            registerCaption: 'Register | User with specified username already exists',
          });
        }
      });
  }
  render() {
    return (
      <div>
        <AppBar className="cs142-topbar-appBar" position="absolute">
          <Toolbar>
            <Grid container justifyContent="center" wrap="wrap">
              <Grid item>
                <Typography variant="h6">Please Login</Typography>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        <Grid container spacing={0} justifyContent="center" direction="row">
          <Grid item>
            <Grid
              container
              direction="column"
              justifyContent="center"
              spacing={2}
              className="login-form"
            >
              <Paper
                variant="elevation"
                elevation={2}
                className="login-background"
              >
                <Grid item>
                  <form onSubmit={this.handleSubmit}>
                    <Grid container direction="column" spacing={2}>
                      <Grid item>
                        <TextField
                          type="username"
                          placeholder="username"
                          fullWidth
                          name="username"
                          variant="outlined"
                          value={this.state.username}
                          onChange={(event) => this.setState({
                              [event.target.name]: event.target.value,
                            })}
                          required
                          autoFocus
                        />
                      </Grid>
                      <Grid item>
                        <TextField
                          type="password"
                          placeholder="Password"
                          fullWidth
                          name="password"
                          variant="outlined"
                          value={this.state.password}
                          onChange={(event) => this.setState({
                              [event.target.name]: event.target.value,
                            })}
                          required
                        />
                      </Grid>
                      <Grid item>
                        <Button
                          variant="contained"
                          color="primary"
                          type="submit"
                          className="button-block"
                        >
                          Submit
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Grid>
                <Grid item>
                </Grid>
                  <Grid item>
                  </Grid>
                <Grid item>
                  <Typography component="h3" variant="h6">
                    {
                      this.state.loginCaption
                    } 
                  </Typography>
                </Grid>
                <Grid item>
                  <form onSubmit={this.handleRegisterSubmit}>
                    <Grid container direction="column" spacing={2}>
                      <Grid item>
                        <TextField
                          type="username"
                          placeholder="username"
                          fullWidth
                          name="username"
                          variant="outlined"
                          value={this.state.registerUsername}
                          onChange={(event) => this.setState({
                             registerUsername: event.target.value,
                            })}
                          required
                          autoFocus
                        />
                      </Grid>
                      <Grid item>
                        <TextField
                          type="password"
                          placeholder="Password"
                          fullWidth
                          name="password"
                          variant="outlined"
                          value={this.state.registerPassword}
                          onChange={(event) => this.setState({
                              registerPassword: event.target.value,
                            })}
                          required
                        />
                      </Grid>
                      <Grid item>
                        <TextField
                          type="password"
                          placeholder="Confirm Password"
                          fullWidth
                          name="confirmpassword"
                          variant="outlined"
                          value={this.state.confirmPassword}
                          onChange={(event) => this.setState({
                              confirmPassword: event.target.value,
                            })}
                          required
                        />
                      </Grid>
                      <Grid item>
                        <TextField
                          type="username"
                          placeholder="First Name"
                          fullWidth
                          name="firstname"
                          variant="outlined"
                          value={this.state.registerFirstName}
                          onChange={(event) => this.setState({
                             registerFirstName: event.target.value,
                            })}
                          required
                          autoFocus
                        />
                      </Grid>


                      <Grid item>
                        <TextField
                          type="username"
                          placeholder="Last Name"
                          fullWidth
                          name="lastname"
                          variant="outlined"
                          value={this.state.registerLastName}
                          onChange={(event) => this.setState({
                             registerLastName: event.target.value,
                            })}
                          required
                          autoFocus
                        />
                      </Grid>



                      <Grid item>
                        <TextField
                          type="username"
                          placeholder="Location"
                          fullWidth
                          name="location"
                          variant="outlined"
                          value={this.state.registerLocation}
                          onChange={(event) => this.setState({
                             registerLocation: event.target.value,
                            })}
                          required
                          autoFocus
                        />
                      </Grid>



                      <Grid item>
                        <TextField
                          type="username"
                          placeholder="Description"
                          fullWidth
                          name="description"
                          variant="outlined"
                          value={this.state.registerDescription}
                          onChange={(event) => this.setState({
                             registerDescription: event.target.value,
                            })}
                          required
                          autoFocus
                        />
                      </Grid>

                      <Grid item>
                        <TextField
                          type="username"
                          placeholder="Occupation"
                          fullWidth
                          name="occupation"
                          variant="outlined"
                          value={this.state.registerOccupation}
                          onChange={(event) => this.setState({
                             registerOccupation: event.target.value,
                            })}
                          required
                          autoFocus
                        />
                      </Grid>




                      <Grid item>
                        <Button
                          variant="contained"
                          color="primary"
                          type="submit"
                          className="button-block"
                        >
                          Register Me
                        </Button>
                      </Grid>

                      <Grid item>
                        <Typography component="h3" variant="h6">
                          {
                            this.state.registerCaption
                          }
                        </Typography>
                      </Grid>


                    </Grid>
                  </form>
                </Grid>
                <Grid item>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default LoginRegister;

// render() {
  //   return (
  //     <div>
  //         <AppBar className="cs142-topbar-appBar" position="absolute">
  //           <Toolbar>
  //           <Grid container justifyContentContent="space-between">  
  //             <Typography variant="h5" align="center">{this.state.loginText}</Typography>
  //           </Grid>
  //           </Toolbar>
  //         </AppBar>
  //         <Typography variant="h5" align="center">asdkfljhasdfasdf</Typography>
  //         <TextField 
  //             id="outlined-password-input"
  //             label="Password"
  //             type="password"
  //             autoComplete="current-password"
  //         />
  //         <TextField 
  //             id="outlined-password-input"
  //             label="Password"
  //             type="password"
  //             autoComplete="current-password"
  //         />
  //     </div>

      
      
  //   );
  // }