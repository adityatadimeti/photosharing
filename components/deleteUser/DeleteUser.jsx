import React from 'react';
import './DeleteUser.css';
import {
  Button,
} from "@material-ui/core";
import axios from 'axios';
/**
 * Define TopBar, a React componment of CS142 project #5
 */
class DeleteUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          username: '',
          password : '',
        };
        this.handleSubmit = this.handleSubmit.bind(this);
      }

    handleSubmit() {
        if (window.confirm('Are you sure you want to delete your account?')) {
            axios.post('/deleteUser')
            .then(response => {
                if (response.status === 200) {
                    console.log(response.data);
                    //this.updateState('Hi ' + response.data.first_name, response.data._id);
                    axios.post('/admin/logout', {
                        login_name: this.state.username,
                        password: this.state.password,
                    })
                        .then(responseLog => {
                            if (responseLog.status === 200) {
                                this.props.logOnNewInfo('Please Login', '');
                            }
                        })
                        .catch(error => {
                            console.log(error);
                        });
                }
            }
            );
        }
        // event.preventDefault();
        
    }
  
  render() {
    return (
      <div>
        <Button variant="contained" color="secondary" onClick = {
            
            () => {this.handleSubmit();}
            // if (confirm('Are you sure you want to delete your account?')) {
            //     this.handleSubmit();
            // }
            // confirm('Are you sure you want to delete your account?') ? this.handleSubmit() : null

        } >
            Delete User
        </Button>
      </div>
    );
  }
}

export default DeleteUser;

