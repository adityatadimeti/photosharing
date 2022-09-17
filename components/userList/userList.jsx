import React from 'react';
import {
  List,
  ListItem,
  Typography,
}
from '@material-ui/core';
import './userList.css';
import {
  Link,
} from 'react-router-dom';
import axios from 'axios';


/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dataArray: null,
    };
  }


  // componentDidMount() {
  //   axios.get('/user/' + this.props.match.params.userId.substring(1))
  //     .then(response => {
  //       if (response.status === 200) {
  //         this.props.onNewInfo(response.data.first_name + ' ' + response.data.last_name);
  //         this.setState({
  //           user: response.data
  //         });
  //       }
  //     })
  //     .catch(err => {
  //       console.log(err);
  //     });
  // }

  // componentDidUpdate(prevProps) {
  //   if (this.props.match.params.userId !== prevProps.match.params.userId) {
  //     axios.get('/user/' + this.props.match.params.userId.substring(1))
  //       .then(response => {
  //         if (response.status === 200) {
  //           this.props.onNewInfo(response.data.first_name + ' ' + response.data.last_name);
  //           this.setState({
  //             user: response.data,
  //           });
  //         }
  //       })
  //       .catch(err => {
  //         console.log(err);
  //       });
  //   }
  // }


  componentDidMount() {
    axios.get('/user/list')
    .then(response => {
      if (response.status === 200) {
        this.setState({
          dataArray: response.data,
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
  }
  //   fetchModel('/user/list').then(data => {
  //     this.setState({
  //       dataArray: data,
  //     });
  //   } 
  //   );
  // }
  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      axios.get('/user/list')
      .then(response => {
        if (response.status === 200) {
          this.setState({
            dataArray: response.data,
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
    }
  }
  //     fetchModel('/user/list').then(data => {
  //       this.setState({
  //         dataArray: data,
  //       });
  //     } 
  //     );
  //   }
  // }

  render() {
    return (
      <div>
        <Typography variant="h5">
          User List
        </Typography>
        <List component="nav">
          {
            this.state.dataArray && this.state.dataArray.map((user, index) => {
              return (
                <div key = {index}>
                <ListItem key={index}>
                  <Link to={"/users/:" + user._id}>{user.first_name + ' ' + user.last_name}</Link>
                </ListItem>  
                </div>
              );
            })
          }
        </List>
      </div>
    );
  }
}

export default UserList;
