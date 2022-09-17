import React from 'react';
import './userPhotos.css';
import {Link } from 'react-router-dom';
import {
  Button,
  Divider,
  ListItem,
  Grid,
  TextField,
  Typography,
}
from '@material-ui/core';
import axios from 'axios';

/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dataArray: null,
      user:this.props.match.params.userId.substring(1),
      comment: '',
      photoID: '',
      liked: false,
      likesDictionary: {},
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.convertArrayToDictionary = this.convertArrayToDictionary.bind(this);
    
  }

  convertArrayToDictionary(array) {
    let dictionary = {};
    for (let i = 0; i < array.length; i++) {
      dictionary[array[i]._id] = array[i].likes;
    }
    return dictionary;
  }

  static getLikes(photoID) {
    axios.get('/numberOfLikes/' + photoID)
    .then(information => {
      if (information.status === 200) {
        // console.log(information.data);
        return information.data;
      } else {
        return 0;
      }
    })
    .catch(err => {
      console.log(err);
      return 0;
    });
  }

  handleDeleteComment(photoID, commentID) {
    // event.preventDefault();
    console.log(commentID);
    axios.post('/deleteComment/', {
      photo_id: photoID,
      comment_id: commentID,
    })
    .then(response => {
      if (response.status === 200) {
        console.log(response.data);
        axios.get('photosOfUser/' + this.props.match.params.userId.substring(1))
            .then(information => {
              if (information.status === 200) {
                this.setState({
                  dataArray: information.data,
                });
              }
            })
            .catch(err => {
              console.log(err);
            });
      }
    })
    .catch(error => {
      console.log(error);
      console.log(error.response.data);
    });
  }

  handleDeletePhoto(photoID) {
    // event.preventDefault();
    console.log(photoID);
    axios.post('/deletePhoto/', {
      photo_id: photoID,
    })
    .then(response => {
      if (response.status === 200) {
        console.log(response.data);
        axios.get('photosOfUser/' + this.props.match.params.userId.substring(1))
            .then(information => {
              if (information.status === 200) {
                this.setState({
                  dataArray: information.data,
                });
              }
            })
            .catch(err => {
              console.log(err);
            });
      }
    })
    .catch(error => {
      console.log(error);
      console.log(error.response.data);
    });
  }

  componentDidMount() {
    // console.log(this.props);
    // console.log("Mounted state likes: " + this.state.likes);
  //   app.get('/request/session', function (request, response) {
  //     console.log('in session');
  //     console.log(JSON.stringify(request.session));
  //     response.send(JSON.stringify(request.session));
  //     response.end();
  // });

  
    axios.get('/user/' + this.state.user)
    .then(response => {
      if (response.status === 200) {
        // console.log(this.state.user);
        this.props.onNewInfo('Photos of ' + response.data.first_name + ' ' + response.data.last_name);
        axios.get('photosOfUser/' + this.props.match.params.userId.substring(1), {
          userSession: this.props.userSession,
        })
        .then(information => {
          if (information.status === 200) {
            // console.log('INFORMATION DATA')
            // console.log(information.data);
            // console.log(information.data[0].likes.length);
            this.setState({
              dataArray: information.data,
              likesDictionary: this.convertArrayToDictionary(information.data),
            });
            console.log(information.data);
            console.log(this.state.likesDictionary);
            // console.log(information.data);
            // console.log(this.state.likesDictionary)
          }
        })
        .catch(err => {
          console.log(err);
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
  }

  componentDidUpdate(prevProps) {
    // console.log("Updated state likes: " + this.state.likes);
    // console.log('INSIDE UPDATE');
    // console.log(this.props.photoUploaded);
    // console.log(prevProps.photoUploaded);
    if (this.props.photoUploaded !== prevProps.photoUploaded) {
      axios.get('photosOfUser/' + this.props.match.params.userId.substring(1))
        .then(information => {
          if (information.status === 200) {
            this.setState({
              dataArray: information.data,
              likesDictionary: this.convertArrayToDictionary(information.data),
            });
            this.props.uploadPhotoState(false);
            // console.log(this.state.likesDictionary);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }


  handleSubmit(event) {
    event.preventDefault();
    // console.log(this.state.photoID);
    axios.post('/commentsOfPhoto/' + this.state.photoID, {
      comment: this.state.comment,
    })
      .then(response => {
        if (response.status === 200) {
          // console.log(response.data);
          axios.get('photosOfUser/' + this.props.match.params.userId.substring(1))
            .then(information => {
              if (information.status === 200) {
                this.setState({
                  dataArray: information.data,
                });
              }
            })
            .catch(err => {
              console.log(err);
            });
          this.setState({
            comment: '',
          });
          // this.props.onNewInfo('Hi ' + response.data.first_name, response.data._id);
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  handleLike(photoID) {
    // event.preventDefault();
    this.setState({liked: !this.state.liked});
    // console.log('handleLike entered');
    // console.log(photoID);

    axios.post('/likePhoto/' + photoID, {
      photoID: photoID,
    })
      .then(response => {
        if (response.status === 200) {
          // console.log(response.data);
          // axios.get('/numberOfLikes/' + photoID)
          //   .then(information => {
          //     if (information.status === 200) {
          //       this.setState({
          //         likes: information.data,
          //       });
          //     }
          //   })
          //   .catch(err => {
          //     console.log(err);
          //   });

          // this.props.onNewInfo('Hi ' + response.data.first_name, response.data._id);
          axios.get('photosOfUser/' + this.props.match.params.userId.substring(1))
            .then(information => {
              if (information.status === 200) {
                this.setState({
                  // dataArray: information.data,
                  // likes: information.data[0].likes.length,
                  likesDictionary: this.convertArrayToDictionary(information.data),
                });
                // this.props.uploadPhotoState(false);
                // console.log(this.state.likesDictionary);
              }
            })
            .catch(err => {
              console.log(err);
            });
        }
      })
      .catch(error => {
        console.log(error);
      });
  }
  

  render() {
    return (
      <div>
        {/* {
          console.log(this.state.dataArray)
        } */}
         <Typography component={'div'} variant="body1">
          {
            this.state.dataArray &&
            this.state.dataArray.sort(function (a, b) {
              if (a.likes.length === b.likes.length) {
                // console.log("B Date is: " + new Date(b.date_time));
                // console.log("A Date is: " + new Date(a.date_time));
                return new Date(b.date_time) - new Date(a.date_time);
              } else {
                return b.likes.length - a.likes.length;
              }
            }
            ).map((photo, index) => {
            // this.state.dataArray.map((photo, index) => {
              return (
                <div key={index}>
                  <Divider />

                  <Grid container direction="column" spacing={2}>
                    <Grid item>
                      <ListItem key={index}>
                        <img src={"/images/" + photo.file_name} />
                        <button
                          onClick={() => {
                            this.handleLike(photo._id);
                            this.setState({
                              liked: !this.state.liked,
                            });
                          }}>
                          <div className="like-button">
                            {
                              this.state.likesDictionary[photo._id].includes(this.props.userSession) ? 'Unlike' : 'Like'
                              // this.state.likesDictionary[photo._id].indexOf(this.props.userSession.user._id) !== -1 ?
                              //   <span> Unlike </span> :
                              //   <span> Like </span>
                              // !this.state.liked ? <span>Like </span> :
                              //   <span> Unlike </span>
                            }
                            {/* <span> like  </span> */}
                            {/* {this.state.likesDictionary[photo._id].indexOf(this.props.userSession)} */}

                            {/* <span>{'liked'  }</span> */}
                          </div>

                        </button>
                      </ListItem>

                      <ListItem>
                              <Divider />
                              {
                              photo.user_id === this.props.userSession ? (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={() => {
                                    this.handleDeletePhoto(photo._id);
                                  }}>
                                  Delete Photo
                                </Button>
                              ) : (
                                <div>
                                </div>
                              )
}
                      </ListItem>


                    </Grid>

                    <Grid item>
                      <Typography>
                        Count: {this.state.likesDictionary[photo._id].length || 0}
                      </Typography>
                      <Divider />
                      <Typography>
                        {this.state.likesDictionary[photo._id].includes(this.props.userSession) ? 'liked' : 'Not liked'}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item>

                  <form onSubmit={this.handleSubmit}>
                    <Grid container direction="column" spacing={2}>
                      <Grid item>
                        <TextField
                          type="comment"
                          placeholder="comment"
                          fullWidth
                          name="comment"
                          variant="outlined"
                          value={this.state.comment}
                          onChange={(event) => this.setState({
                              // [event.target.name]: event.target.value,
                              comment: event.target.value,
                              photoID: photo._id,
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
                          Add Comment
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                  </Grid>
                  <Typography variant="caption">
                    {'Creation date: ' + photo.date_time}
                    {
                      photo.comments &&
                      
                      photo.comments.map((comment, indexVar) => {
                        return (
                          <div key = {indexVar}>
                            
                            <ListItem>
                              {
                                (comment && comment.user) ? (
                                <Typography>
                                  {"Comment by "} <Link to={"/users/:" + comment.user._id}>{comment.user.first_name + ' ' + comment.user.last_name}</Link> {'created on ' + comment.date_time + ': ' + comment.comment}
                                </Typography>
                              ) :

                                <Typography/>
                              }
                              
                            </ListItem>

                            <ListItem>
                              <Divider />
                              {
                              comment.user._id === this.props.userSession ? (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={() => {
                                    this.handleDeleteComment(photo._id, comment._id);
                                  }}>
                                  Delete Comment
                                </Button>
                              ) : (
                                <div>
                                </div>
                              )
}
                            </ListItem>
                          </div>
                        );
                      })
                    }  
                  </Typography>
                </div>
              );
            })
          }
          <Link to={"/photos/:" + this.state.user}>{'Photos'}</Link>
         </Typography>
      </div>

    );
  }
}

export default UserPhotos;
