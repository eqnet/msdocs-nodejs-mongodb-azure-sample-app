const { response } = require('express');
var express = require('express');
var Task = require('../models/task');
var User = require('../models/user');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  Task.find()
    .then(tasks => {
      const currentTasks = tasks.filter(task => !task.completed);
      const completedTasks = tasks.filter(task => task.completed === true);

      console.log(
        `Total tasks: ${tasks.length}   Current tasks: ${currentTasks.length}    Completed tasks:  ${completedTasks.length}`
      );
      res.render('index', {
        currentTasks: currentTasks,
        completedTasks: completedTasks,
      });
    })
    .catch(err => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
});

router.post('/addTask', function (req, res, next) {
  const taskName = req.body.taskName;
  const createDate = Date.now();

  var task = new Task({
    taskName: taskName,
    createDate: createDate,
  });
  console.log(`Adding a new task ${taskName} - createDate ${createDate}`);

  task
    .save()
    .then(() => {
      console.log(`Added new task ${taskName} - createDate ${createDate}`);
      res.redirect('/');
    })
    .catch(err => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
});

router.post('/completeTask', function (req, res, next) {
  console.log('I am in the PUT method');
  const taskId = req.body._id;
  const completedDate = Date.now();

  Task.findByIdAndUpdate(taskId, { completed: true, completedDate: Date.now() })
    .then(() => {
      console.log(`Completed task ${taskId}`);
      res.redirect('/');
    })
    .catch(err => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
});

router.post('/deleteTask', function (req, res, next) {
  const taskId = req.body._id;
  const completedDate = Date.now();
  Task.findByIdAndDelete(taskId)
    .then(() => {
      console.log(`Deleted task $(taskId)`);
      res.redirect('/');
    })
    .catch(err => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
});

// oneHR Website API
const checkApiKeyIsValid = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const xApiKey = process.env.X_API_Key;

  if (apiKey !== xApiKey) {
    console.error('401 Invalid  header: x-api-key');
    return res.status(401).send('Invalid  header: x-api-key');
  }

  next();
};

router.get('/api/users', (req, res, next) => {
  const { email, url } = req.query;
  const query = {};

  if (email) {
    query.email = email;
  }
  if (url) {
    query.url = url;
  }

  User.find(query)
    .then(users => {
      res.send(users);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
});

router.get('/api/users/:id', (req, res, next) => {
  const { id } = req.params;

  User.findById(id)
    .then(user => {
      res.send(user);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
});

router.post('/api/users', checkApiKeyIsValid, (req, res, next) => {
  const users = req.body;
  const now = Date.now();

  if (Array.isArray(users)) {
    users.forEach(user => {
      user.ipAddress = req.ip;
      user.ipAddresses = req.ips;
      user.createdAt = now;
      user.updatedAt = now;
    });
  } else {
    users.ipAddress = req.ip;
    users.ipAddresses = req.ips;
    users.createdAt = now;
    users.updatedAt = now;
  }

  User.create(users)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
});

router.put('/api/users/:id', checkApiKeyIsValid, (req, res, next) => {
  const { id } = req.params;
  const user = req.body;
  const now = Date.now();

  user.updatedAt = now;

  User.findByIdAndUpdate(id, user)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
});

router.delete('/api/users/:id', checkApiKeyIsValid, (req, res, next) => {
  const { id } = req.params;

  User.findByIdAndDelete(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
});

module.exports = router;
