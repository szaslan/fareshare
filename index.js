const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const url = require('url');
const graphqlHTTP = require('express-graphql');
const crypto = require('crypto');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');
const db = require('./db/db');

// const schema = buildSchema(`
//     type Query {
//         users: [User!]!
//         user(id: ID!): User
//         matches: [User!]!
//     }

//     type Mutation {
//         addUser(email: String!, name: String): User
//     }

//     type User {
//         id: ID!
//         email: String!
//         name: String
//         avatarUrl: String
//         phone: String
//     }

// `)

// const rootValue = {
//     users: () => {database.users},
//     user: args => database.users.find(user => user.id === args.id),
//     matches: () => {return database.matches},
//     addUser: ({email, name}) => {
//         const user = {
//             id: crypto.randomBytes(10).toString('hex'),
//             email,
//             name
//         }

//         database.users.push(user)
//         return user;
//     }
// }

// graphql(
//     schema,
//     `{
//         users {
//             id
//             name
//             email
//         }
//     }`,
//     rootValue
// ).then(res => console.dir(res, { depth: null }))
// .catch(console.error)

// so the server can handle POST requests
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const schema = require('./graphql/Schema/Schema');

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

// app.use(function(req, res, next) {
// 	res.header("Access-Control-Allow-Origin", "*");
// 	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
// 	next();
// });

const PORT = process.env.PORT || 8080;
const router = express.Router();
// app.get('/', function(req, res){
//     console.log('reached /')
// })

router.get('/', (req, res) => {
  console.log('API has launched.');
  res.json({ message: 'API Base Endpoint.' });
});

// const client = new Client({
//   user: 'szaslan',
//   host: 'faresharedb.cvhjwsu7pmgh.us-east-2.rds.amazonaws.com',
//   database: 'fareshare',
//   password: 'NUsharesrides',
//   port: 5432,
// });

// client.connect(err => {
//   if (err) console.log(err);
//   else console.log('connected');
// });

// mongoose.connect('mongodb://szaslan:s9aslan@ds213832.mlab.com:13832/fareshare-web');
// const db = mongoose.connection;
// db.on('error', () => {
//   console.log('Failed to connect do mongoose');
// });
// db.once('open', () => {
//   console.log('Connected to mongoose!');
// });

const User = require('./models/user');
const Request = require('./models/request');

// -=-=-=-=-=-=-=-=-=-
// Request Routes
// -=-=-=-=-=-=-=-=-=-

router
  .route('/requests')

  // create an article
  .post((req, res) => {
    console.log('POST: requests');

    const request = new Request();
    request.destination = req.body.destination;
    request.desiredTime = req.body.desiredTime;
    request.requester = req.body.requester;
    request.timeBuffer = req.body.timeBuffer;

    console.log(req.body);
    // save auction
    request.save(err => {
      // return the error in response if it exists
      if (err) {
        res.send(err);
        console.log(err);
      }

      res.json({ message: 'Request created!' });
    });
  })

  // get route
  .get((req, res) => {
    console.log('GET: requests');

    if (!req.query.userId) return;

    const desiredUserId = req.query.userId;
    console.log(desiredUserId);

    Request.find({ requester: desiredUserId }, (err, requests) => {
      if (err) {
        res.send(err);
        console.log(err);
      }

      res.json(requests);
    });
  });

// -=-=-=-=-=-=-=-=-=-
// User Routes
// -=-=-=-=-=-=-=-=-=-

router
  .route('/users')

  .get((req, res) => {
    if (!req.query.username) {
      console.log('ROUTE REQUIRES USERNAME');
      return;
    }

    User.findOne({ email: req.query.username }, (err, desiredUser) => {
      if (err) {
        res.send(err);
        console.log(err);
      }

      res.json(desiredUser);
    });
  })

  // create an article
  .post((req, res) => {
    console.log('POST: users');

    const user = new User();
    user.email = req.body.email;

    if (req.body.firstName) user.firstName = req.body.firstName;

    if (req.body.lastName) user.lastName = req.body.lastName;

    if (req.body.profileUrl) user.profileUrl = req.body.profileUrl;

    if (req.body.school) user.school = req.body.school;

    // save auction
    user.save(err => {
      // return the error in response if it exists
      if (err) {
        res.send(err);
        console.log(err);
      }

      res.json({ message: 'User created!' });
    });
  });

// Route that accepts an incoming Id as a parameter
// And either deletes or gets data for the given request
router
  .route('/users/:id')

  // Grab a request with the given ID
  .get((req, res) => {
    const requestId = req.params.id;
    User.findById(requestId, (err, request) => {
      res.json(request);
    });
  })

  // Delete request with a given ID
  .delete((req, res) => {
    console.log('DELETE: delete request');

    const requestId = req.params.id;
    Request.remove({ _id: requestId }, err => {
      console.log('ERROR: could not delete given resource.');
    });

    res.json({ message: 'Request deleted!' });
  });

// -=-=-=-=-=-=-=-=-=-
// User Routes
// -=-=-=-=-=-=-=-=-=-

// router
//   .route('/match/:id')

//   // get route
//   .get((req, res) => {
//     console.log('GET: requests');

//     const requestId = req.params.id;
//     Request.findById(requestId, (err, request) => {
//       if (err) {
//         res.send(err);
//         console.log(err);
//       }

//       const destination = request.destination;
//       const desiredTime = request.desiredTime;
//       const timeBuffer = request.timeBuffer;

//       // Take attributes to find minimum and maximium time frames
//       // TODO figure out why needs to be -(-)... JS type system whack
//       const msBuffer = Number(timeBuffer) * 60 * 1000;
//       const lowerTimeBound = desiredTime - msBuffer;
//       const upperTimeBound = desiredTime - -msBuffer;

//       // Find all requests with given time boundaries
//       Request.find({
//         _id: {
//           $ne: requestId,
//         },
//         desiredTime: {
//           $gte: lowerTimeBound,
//           $lte: upperTimeBound,
//         },
//         destination,
//       }).exec((err, compatibleRequests) => {
//         const userIdList = compatibleRequests.map(rideRequest =>
//           mongoose.Types.ObjectId(rideRequest.requester)
//         );

//         User.find(
//           {
//             _id: { $in: userIdList },
//           },

//           (err, userMatches) => {
//             console.log(userMatches);
//             res.json(userMatches);
//           }
//         );
//       });
//     });
//   });

app.use('/api', router);
app.listen(PORT);

console.log(` 🚀 : Application listening on ${PORT}`);
