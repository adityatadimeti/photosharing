import React from 'react';
import './UploadPhoto.css';
import {
  Button, TextField,
} from "@material-ui/core";
import axios from 'axios';





/**
 * Define TopBar, a React componment of CS142 project #5
 */
class UploadPhoto extends React.Component {
    constructor(props) {
        super(props);
        this.handleUploadButtonClicked = this.handleUploadButtonClicked.bind(this);

        this.state = {
          list: false,
          allUsers: [],
          viewableUsers: [],
          userText: '',
          finalUploadPressed: false
        };
      }


      getUsers() {
        axios.get('/userList')
            .then(response => {
                if (response.status === 200) {
                  console.log('entered userlist');
                    this.setState({
                        allUsers: response.data,
                    });
                    console.log(this.state.allUsers);
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    handleUploadNoList() {
      if (this.uploadInput.files.length > 0) {
        console.log('viewable users');
        let viewableIDs = this.state.allUsers.map(user => user._id);
        // if (this.state.viewableUsers.length > 0) {
        //   viewableIDs = this.state.viewableUsers.map(user => user._id);
        // }
        console.log(viewableIDs);

        // Create a DOM form and add the file to it under the name uploadedphoto
        const domForm = new FormData();
        
        domForm.append('viewableUsers', viewableIDs);
        domForm.append('uploadedphoto', this.uploadInput.files[0]);
        
        // axios.post('/photos/new', domForm)
        //   .then((res) => {
        //     console.log(res);
        //     this.props.uploadNewInfo(true); 
        //   })
        //   .catch(err => console.log(`POST ERR: ${err}`));
        // axios.post('/photos/new', {domForm: domForm, viewableUsers: this.state.viewableUsers})
        axios.post('/photos/new', domForm)
          .then((res) => {
            console.log(res);
            this.props.uploadNewInfo(true); 
          })
          .catch(err => console.log(`POST ERR: ${err}`));
    }
    }
    handleFinalUpload() {
      if (this.uploadInput.files.length > 0) {
        console.log('viewable users');
        // let viewableIDs = this.state.allUsers.map(user => user._id);
        // if (this.state.viewableUsers.length > 0) {
          let viewableIDs = this.state.viewableUsers.map(user => user._id);
        // }
        console.log(viewableIDs);

        // Create a DOM form and add the file to it under the name uploadedphoto
        const domForm = new FormData();
        
        domForm.append('viewableUsers', viewableIDs);
        domForm.append('uploadedphoto', this.uploadInput.files[0]);
        
        // axios.post('/photos/new', domForm)
        //   .then((res) => {
        //     console.log(res);
        //     this.props.uploadNewInfo(true); 
        //   })
        //   .catch(err => console.log(`POST ERR: ${err}`));
        // axios.post('/photos/new', {domForm: domForm, viewableUsers: this.state.viewableUsers})
        axios.post('/photos/new', domForm)
          .then((res) => {
            console.log(res);
            this.props.uploadNewInfo(true); 
          })
          .catch(err => console.log(`POST ERR: ${err}`));
    }
    }
      handleUploadButtonClicked = () => {

        if (window.confirm('Would you like to specify sharing list? Click Cancel for no.')){
            this.setState({list: true});
            // this.setState({allUsers: this.getUsers()});
            this.getUsers();
        }
        else {
            this.handleUploadNoList();
        }
    };
   


  componentDidMount() {
    console.log('componentDidMount');
    this.getUsers();
  }
  
  render() {
    return (
      <div>
        <input type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} />
        <Button 
            variant="contained" 
            color="secondary" 
            onClick = {() => {
              this.setState({finalUploadPressed: true});
              this.handleUploadButtonClicked();}}>
            Upload Photo
        </Button>
        {(this.state.list && this.state.finalUploadPressed) ? (
        <div>
            <TextField label = "Enter User" onInput={event => this.setState({userText: event.target.value})} />
            <Button
                variant="contained"
                color="secondary"
                onClick = {() => {
                    console.log(this.state.allUsers);
                    // let tempViewableUsers = [];
                    for (let i = 0; i < this.state.allUsers.length; i++) {
                      console.log(this.state.userText);
                      let fullName = this.state.allUsers[i].first_name + ' ' + this.state.allUsers[i].last_name;
                      console.log(fullName);
                        if (fullName === this.state.userText) {
                            this.state.viewableUsers.push(this.state.allUsers[i]);
                        }
                    }
                    // this.setState({viewableUsers: tempViewableUsers});
                    // this.setState({viewableUsers: this.state.allUsers.filter(user => user.login_name === (this.state.userText))});
                }}> 
                Add User
            </Button>
            <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  this.setState({ finalUploadPressed: false });
                  this.handleFinalUpload();
                }}>
                Complete Upload Pic
            </Button> 
        </div>
      )
        : null}
        {/* <FormGroup>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={this.state.list}
                        onChange={() => {this.setState({list: !this.state.list})}}
                        value="checkedB"
                    />
                }
                label="Check to specify sharing list"
            />
        </FormGroup> */}

      </div>
    );
  }
}

export default UploadPhoto;

