import React from 'react';
import './LogoutRegister.css';
import {
  Button,
} from "@material-ui/core";
import axios from 'axios';
/**
 * Define TopBar, a React componment of CS142 project #5
 */
class LogoutRegister extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          username: '',
          password : '',
        };
        this.handleSubmit = this.handleSubmit.bind(this);
      }

      handleSubmit() {
        // event.preventDefault();
        axios.post('/admin/logout', {
          login_name: this.state.username,
          password: this.state.password,
          })
          .then(response => {
            if (response.status === 200) {
              this.props.logOnNewInfo('Please Login', '');
            }
          })
          .catch(error => {
            console.log(error);
          });
      }
  
  render() {
    return (
      <div>
        <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick = {() => {this.handleSubmit();}}
                >
                  Logout
        </Button>
      </div>
    );
  }
}

export default LogoutRegister;

