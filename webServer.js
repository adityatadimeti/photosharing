/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

var express = require('express');
var app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
const { ContactSupportOutlined } = require('@material-ui/icons');
const fs = require("fs");
// const { FirstPage, LocalConvenienceStoreOutlined, PhotoSharp, ContactsOutlined } = require('@material-ui/icons');
// const { fstat } = require('fs');

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
//var cs142models = require('./modelData/photoApp.js').cs142models;

// mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb://127.0.0.1/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });



// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});
/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.login_name) {
        //console.error('No user with login' + login_name + 'found', err);
        response.status(401).send('Unauthorized');
        return;
    }
    User.find({}, function (err, user) {
        if (err) {
            console.error('Doing /user/list error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        response.end(JSON.stringify(user));
    }).select('_id first_name last_name');
});

app.get('/user/:id', function (request, response) {
    if (!request.session.login_name) {
        //console.error('No user with login' + login_name + 'found', err);
        response.status(401).send('Unauthorized');
        return;
    }
    var id = request.params.id;
    User.findOne({ _id: id }, function (err, user) {
        if (!user) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (err) {
            console.error('Doing /user/:id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (id.length === 0) {
            response.status(400).send('No user with id ' + id);
            return;
        }
        let jsonText = JSON.stringify(user);
        response.end(jsonText);
    }).select('_id first_name last_name location description occupation');
});


app.get('/photosOfUser/:id', function (request, response) {
    console.log(request.session.user_id)
    if (!request.session.login_name) {
        //console.error('No user with login' + login_name + 'found', err);
        response.status(401).send('Unauthorized');
        return;
    }
    var id = request.params.id;
    var photosArray = [];
    Photo.find({user_id: id }, function (err, photos) {
        console.log(photos);
        // photos = photos.filter(photo => 

        //     photo.viewableUsers.indexOf(request.session.user_id) != -1 
        //     // ||
        //     // photo.user_id == request.session.user_id
        // );

        photos = photos.filter(function (photo) {
            return (photo.viewableUsers.indexOf(request.session.user_id) != -1 || photo.user_id == request.session.user_id);
            // ||
            // photo.user_id == request.session.user_id
        }
        );
            
        console.log(photos);
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        async.eachOf(photos, function (photo, key, done_callback) {
            var commentsArray = [];
            async.eachOf(photo.comments, function (comment, keyIndex, comment_done_callback) {
                User.findOne({ _id: comment.user_id }, function (errVal, user) {
                    if (errVal) {
                        console.error('Doing /photosOfUser/:id error:', errVal);
                        response.status(400).send(JSON.stringify(errVal));
                        return;
                    }
                    if (user) {
                        comment = JSON.parse(JSON.stringify(comment));
                        let newCommentObj = {
                            _id: comment._id,
                            comment: comment.comment,
                            date_time: comment.date_time,
                            user:user
                        };
                        comment = newCommentObj;
                        commentsArray[keyIndex] = comment;
                    }
                    comment_done_callback(errVal);
                }
        ).select('_id first_name last_name likes viewableUsers');
    }, function (photoErr) {
                if (photoErr) {
                    response.status(400).send(JSON.stringify(photoErr));
                } else {
                    photo = JSON.parse(JSON.stringify(photo));
                    console.log(photo.viewableUsers);
                    console.log(photo.viewableUsers.indexOf(request.session.user_id))
                    // if (photo.viewableUsers.indexOf(request.session.user_id) != -1) {
                        photosArray[key] = photo;
                        photosArray[key].comments = commentsArray;
                        console.log(photosArray);
                    // }
                    done_callback(photoErr);
                }
            });
        }, function (lastErr) {
            if (lastErr) {
                response.status(400).send(JSON.stringify(lastErr));
            } else {
                response.end(JSON.stringify(photosArray));
            }
        });
        } ).select('_id user_id comments file_name date_time likes viewableUsers');
    });

//add app.get request

app.get('/request/session', function (request, response) {
    console.log('in session');
    console.log(JSON.stringify(request.session));
    response.send(JSON.stringify(request.session));
    response.end();
});



app.post('/photos/new', function (request, response) {
    processFormBody(request, response, function (err) {
        let viewableUsersVar = request.body.viewableUsers;
        if (!request.body.viewableUsers) {
            viewableUsersVar = [];
        } else {
            console.log('VIEWABLE USERS VAR')
           console.log(viewableUsersVar);
           console.log(viewableUsersVar.split(","));
            viewableUsersVar = viewableUsersVar.split(",");
        //    viewableUsersVar = JSON.parse(viewableUsersVar);
        }

        if (err || !request.file) {
            console.error('Doing /photos/new error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (request.file.fieldname !== 'uploadedphoto') {
            response.status(400).send('Bad field name');
            return;
        }
        if (!request.session.login_name) {
            //console.error('No user with login' + login_name + 'found', err);
            response.status(401).send('Unauthorized');
            return;
        }

        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes
    
        // XXX - Do some validation here.
        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        const timestamp = new Date().valueOf();
        const filename = 'U' +  String(timestamp) + request.file.originalname;
    
        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
            if (err) {
                console.error('Doing /photos/new error:', err);
                response.status(400).send(JSON.stringify(err));
                return;
            }
          // XXX - Once you have the file written into your images directory under the name
          // filename you can create the Photo object in the database
        //   file_name: String, // 	Name of a file containing the actual photo (in the directory project6/images).
        //     date_time: {type: Date, default: Date.now}, // 	The date and time when the photo was added to the database
        //     user_id: mongoose.Schema.Types.ObjectId, // The ID of the user who created the photo.
        //     comments: [commentSchema] // Array of comment objects representing the comments made on this photo.
          Photo.create({
            user_id: request.session.user_id,
            file_name: filename,
            date_time: new Date().toISOString(),
            comments: [],
            likes: [],
            viewableUsers: viewableUsersVar,
            }, function (err, photo) {
                console.log(photo);
                if (err) {
                    console.error('Doing /photos/new error:', err);
                    response.status(400).send(JSON.stringify(err));
                    return;
                }
                photo.save(function (err) {
                    if (err) {
                        console.error('Doing /photos/new error:', err);
                        response.status(400).send(JSON.stringify(err));
                        return;
                    }
                    console.log('Photo created:', photo);
                    response.end(JSON.stringify(photo));
                });
            });
        });
    });


   

});


app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    let newComment = {};
    console.log(request.session.user_id)
    newComment.user_id = request.session.user_id;
    newComment.date_time = new Date();
    newComment.comment = request.body.comment;

    if (!request.session.login_name) {
        //console.error('No user with login' + login_name + 'found', err);
        response.status(401).send('Unauthorized');
        return;
    }
    // console.log(newComment);

    // console.log(request.params.photo_id)
    Photo.findOne({_id: request.params.photo_id }, function (err, photo) {
            if (err) {
                response.status(400).send(JSON.stringify(err));
                return;
            }
            if (!photo) {
                response.status(400).send('No photo with id ' + request.params.photo_id);
                return;
            }
            // console.log(photo.comments);

            // console.log(photo)
            photo.comments.push(newComment);
            console.log(photo._id)
            console.log(newComment)

            photo.save(function (err) {
                if (err) {
                    response.status(400).send(JSON.stringify(err));
                    return;
                }
                response.end(JSON.stringify(photo));
            });
        });
            // console.log(jsonText);
    
});

app.get('/numberOfLikes/:photo_id', function (request, response) {
    Photo.findOne({_id: request.params.photo_id }, function (err, photo) {
            if (err) {  
                response.status(400).send(JSON.stringify(err));
                return;
            }
            if (!photo) {
                console.log('NO PHOTO')
                response.status(400).send('No photo with id ' + request.params.photo_id);
                return;
            }
            console.log(photo);
            if (!photo.likes) {
                response.end('0');
            }
            response.end(JSON.stringify(photo.likes.length));
        });
});

app.post('/test', function (request, response) {
    response.end('test');
});

app.post('/likePhoto/:photo_id', function (request, response) {
    // console.log(request.session.user_id)

    if (!request.session.login_name) {
        //console.error('No user with login' + login_name + 'found', err);
        response.status(401).send('Unauthorized');
        return;
    } else {
        Photo.findOne({_id: request.params.photo_id }, function (err, photo) {
            console.log('INSIDE PHOTO FIND')
                if (err) {
                    response.status(400).send(JSON.stringify(err));
                    return;
                }
                if (!photo) {
                    response.status(400).send('No photo with id ' + request.params.photo_id);
                    return;
                }
                if (!photo.likes) {
                    console.log('NO ARRAY')
                }
                // if (!photo.likes) {
                //     photo.likes = [];
                // }
                if (photo.likes.indexOf(request.session.user_id) == -1) {
                    photo.likes.push(request.session.user_id);
                }
                else {
                    photo.likes.splice(photo.likes.indexOf(request.session.user_id), 1);
                }
                // console.log(photo.likes);
    
                photo.save(function (err) {
                    if (err) {
                        response.status(400).send(JSON.stringify(err));
                        return;
                    }
                    response.end(JSON.stringify(photo));
                });
            });
    }

    // console.log(request.params.photo_id)
    
    // response.end('test end')
});

// app.post('/likePhoto/:photo_id', function (request, response) {
//     console.log('asdfasdfasdfasd')
//     console.log(request.session.user_id)

//     if (!request.session.login_name) {
//         //console.error('No user with login' + login_name + 'found', err);
//         response.status(401).send('Unauthorized');
//         return;
//     }
//     // console.log(newComment);

//     // console.log(request.params.photo_id)
//     Photo.findOne({_id: request.params.photo_id }, function (err, photo) {
//             if (err) {
//                 response.status(400).send(JSON.stringify(err));
//                 return;
//             }
//             if (!photo) {
//                 response.status(400).send('No photo with id ' + request.params.photo_id);
//                 return;
//             }

//             if (photo.likes.indexOf(request.session.user_id) == -1) {
//                 photo.likes.push(request.session.user_id);
//             }
//             else {
//                 photo.likes.splice(photo.likes.indexOf(request.session.user_id), 1);
//             }
//             console.log(photo._id)
//             // console.log(photo.comments);

//             // console.log(photo)
            
//             console.log(photo._id)

//             photo.save(function (err) {
//                 if (err) {
//                     response.status(400).send(JSON.stringify(err));
//                     return;
//                 }
//                 response.end(JSON.stringify(photo));
//             });
//         });
//             // console.log(jsonText);
    
// });
        
app.post('deletePhoto/:photo_id', function (request, response) {
    console.log(request.params.photo_id)
    Photo.findOne({_id: request.params.photo_id }, function (err, photo) {
            if (err) {
                response.status(400).send(JSON.stringify(err));
                return;
            }
            if (!photo) {
                response.status(400).send('No photo with id ' + request.params.photo_id);
                return;
            }
            photo.remove();
            response.end(JSON.stringify(photo));
        });
});
// :comment_id

app.post('/deletePhoto', function (request, response) {
    photoID = request.body.photo_id;
    console.log(photoID);
    Photo.findOne({_id: photoID }, function (err, photo) {
            if (err) {
                response.status(400).send(JSON.stringify(err));
                return;
            }
            if (!photo) {
                response.status(400).send('No photo with id ' + request.params.photo_id);
                return;
            }
            photo.comments = [];
            photo.remove();
            response.end(JSON.stringify(photo));
        });
});

app.post('/deleteUser', function (request, response) {
    User.findOne({ _id: request.session.user_id }, function (err, user) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (!user) {
            response.status(400).send('No user with id ' + request.session.user_id);
            return;
        }
        Photo.find({}, function (err, photos) {
            if (err) {
                response.status(400).send(JSON.stringify(err));
                return;
            }
            for (var i = 0; i < photos.length; i++) {
                for (var j = 0; j < photos[i].comments.length; j++) {
                    if (photos[i].comments[j].user_id == user._id) {
                        photos[i].comments.splice(j, 1);
                        photos[i].save();
                    } 
                    // if (photos[i].likes.length > 0) {
                    //     console.log(photos[i]);
                    //     console.log(photos[i].likes)
                    //     if (photos[i].likes.indexOf(user._id) != -1) {
                    //         photos[i].likes.splice(photos[i].likes.indexOf(user._id), 1);
                    //     }
                    //     console.log(photos[i])
                    // }
                    
                }
                if (photos[i].likes.indexOf(user._id) != -1) {
                    console.log(photos[i])
                    console.log(photos[i].likes)
                    photos[i].likes.splice(photos[i].likes.indexOf(user._id), 1);
                    photos[i].save();
                    console.log(photos[i].likes)
                }
            }
            // photos.save(function (err) {
            //     if (err) {
            //         response.status(400).send(JSON.stringify(err));
            //         return;
            //     }
            //     response.end(JSON.stringify(photos));
            // }
            // );
        });
        Photo.deleteMany({ user_id: user._id }, function (err) {
            if (err) {
                response.status(400).send(JSON.stringify(err));
                return;
            }
            else {
                Photo.find({}, function (err, photos) {
                    if (err) {
                        response.status(400).send(JSON.stringify(err));
                        return;
                    }
                    for (var i = 0; i < photos.length; i++) {
                        for (var j = 0; j < photos[i].comments.length; j++) {
                            if (photos[i].comments[j].user_id == user._id) {
                                photos[i].comments.splice(j, 1);
                                photos[i].save();
                            } 
                            // console.log(photos[i]);
                            // console.log(photos[i].likes);
                            if (photos[i].likes.indexOf(user._id) != -1) {
                                photos[i].likes.splice(photos[i].likes.indexOf(user._id), 1);
                                photos[i].save();
                            }
                        }
                    }
                    // photos.save(function (err) {
                    //     if (err) {
                    //         response.status(400).send(JSON.stringify(err));
                    //         return;
                    //     }
                    //     response.end(JSON.stringify(photos));
                    // }
                    // );
                });
            }
        });
        
        User.deleteOne({ _id: request.session.user_id }, function (err) {
            if (err) {
                response.status(400).send(JSON.stringify(err));
                return;
            }
            response.end('User deleted');
        }
        );
    });
});

app.post('/deleteAllComments/', function (request, response) {
    photoID = request.body.photo_id;
    console.log(request.params.photo_id)
    Photo.findOne({ _id: photoID }, function (err, photo) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (!photo) {
            response.status(400).send('No photo with id ' + photoID);
            return;
        }
        photo.comments = [];
        photo.save(function (err) {
            if (err) {
                response.status(400).send(JSON.stringify(err));
                return;
            }
            response.end(JSON.stringify(photo));
        });
    });
});

app.get('/userList', function (request, response) {
    User.find({}, function (err, users) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        response.end(JSON.stringify(users));
    });
});

app.post('/deleteComment/', function (request, response) { 
    commentID = request.body.comment_id;
    photoID = request.body.photo_id;
    // console.log(photoID);
    Photo.findOne({_id: photoID }, function (err, photo) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (!photo) {
            response.status(400).send('No photo with id ' + photoID);
            return;
        }

        for (var i = 0; i < photo.comments.length; i++) {
            if (photo.comments[i]._id == commentID) {
                photo.comments.splice(i, 1);
                break;
            }
        }

        photo.save(function (err) {
            if (err) {
                response.status(400).send(JSON.stringify(err));
                return;
            }
        });
        response.end(JSON.stringify(photo));
    });
});


app.post('/admin/login', function (request, response) {
    User.findOne({ login_name: request.body.login_name }, function (err, user) {
        //console.log(request.body);
        // console.log(request.body.login_name);
        if (!user) {
            //console.log(request.body.login_name);
            response.status(400).send('No user with specified login');
            //console.log(user);
            return;
        }
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        
        if (request.body.login_name === 0) {

            response.status(400).send('No user with specified login');
            return;
        }
        
        if (user.password !== request.body.password) {
            response.status(400).send('Wrong password');
            return;
        }
        
        // if (request.body.login_name && !user) {
        //     console.log(request.body.login_name);
        //     //console.error('No user with login' + login_name + 'found', err);
        //     response.status(400).send('Unauthorized');
        //     return;
        // }
        // console.log('user list', user);
        request.session.login_name = request.body.login_name;
        request.session.user_id = user._id;
        response.end(JSON.stringify(user));
    })
});


app.post('/user', function (request, response) {
    console.log(request.body.first_name)
    if (!request.body.first_name || !request.body.last_name || !request.body.login_name || !request.body.password) {
        response.status(400).send('Missing required fields');
        return;
    }

    User.find({ login_name: request.body.login_name }, function (err, users) {
        console.log(users);
        if (err || !users) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (users.length > 0) {
            response.status(400).send('User with specified username already exists');
            return;
        }
        User.create({
            first_name: request.body.first_name,
            last_name: request.body.last_name,
            login_name: request.body.login_name,
            password: request.body.password,
            location: request.body.location,
            description: request.body.description,
            occupation: request.body.occupation,


        }, function (err, user) {
            if (err) {
                response.status(400).send(JSON.stringify(err));
                return;
            }
            user.save(function (err) {
                if (err) {
                    console.error('Doing /user error:', err);
                    response.status(400).send(JSON.stringify(err));
                    return;
                }
                console.log('User created:', user);
                response.end(JSON.stringify(user));
            });
        });
    });
});

//     User.create(request.body, function (err, user) {
//         if (err) {
//             response.status(400).send(JSON.stringify(err));
//             return;
//         }
//         response.end(JSON.stringify(user));
//     });
// });

app.post('/admin/logout', function (request, response) {
    delete request.session.login_name;
    delete request.session.user_id;
    request.session.destroy(
        function (err) {
            if (err ) {
                console.error('Error destroying session', err);
                response.status(400).send(JSON.stringify(err));
                return;
            }
            response.end('Session destroyed');
        }
    );
});


var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


