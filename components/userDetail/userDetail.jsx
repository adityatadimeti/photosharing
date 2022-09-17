import React from 'react';
import {
  Typography, 
} from '@material-ui/core';
import './userDetail.css';
import {Link } from 'react-router-dom';
import axios from 'axios';

/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      user: null,
    };
  }

  componentDidMount() {
    axios.get('/user/' + this.props.match.params.userId.substring(1))
      .then(response => {
        if (response.status === 200) {
          // console.log(response.data);
          axios.get('test/info')
              .then(versionResponse => {
                if (versionResponse.status === 200) {
                  this.props.onNewInfo(response.data.first_name + ' ' + response.data.last_name + ' | Version: ' + versionResponse.data.version);
                }
              })
              .catch(err => {
                this.props.onNewInfo(response.data.first_name + ' ' + response.data.last_name);
                console.log(err);
              });
          //this.props.onNewInfo(response.data.first_name + ' ' + response.data.last_name);
          this.setState({
            user: response.data
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      axios.get('/user/' + this.props.match.params.userId.substring(1))
        .then(response => {
          if (response.status === 200) {
            // console.log(response.data);
            axios.get('test/info')
              .then(versionResponse => {
                if (versionResponse.status === 200) {
                  this.props.onNewInfo(response.data.first_name + ' ' + response.data.last_name + ' | Version: ' + versionResponse.data.version);
                }
              })
              .catch(err => {
                console.log(err);
                this.props.onNewInfo(response.data.first_name + ' ' + response.data.last_name);
              });
            this.props.onNewInfo(response.data.first_name + ' ' + response.data.last_name);
            this.setState({
              user: response.data,
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
  render() {  
      return (
        <div>
          {
            this.state.user && (
            <div>
                <Typography variant="body1">
                  {
                    'Name: ' + this.state.user.first_name + ' ' + this.state.user.last_name 
                  }
                </Typography>

                <Typography variant="body1">
                  {
                    'Location: ' + this.state.user.location
                  }
                </Typography>

                <Typography variant="body1">
                  {
                    'Description: ' + this.state.user.description
                  }
                </Typography>

                <Typography variant="body1">
                  {
                    'Occupation: ' + this.state.user.occupation
                  }
                </Typography>


                <Link to={"/photos/:" + this.state.user._id}>{'Photos'}</Link>
            </div>
          )
}
        </div>
      );
    }
    
}

export default UserDetail;
