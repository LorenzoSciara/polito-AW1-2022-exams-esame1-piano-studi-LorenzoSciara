'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const { check, validationResult } = require('express-validator'); // validation middleware
const dao = require('./datainterface/course-dao'); // module for accessing the DB
const userDao = require('./datainterface/user-dao'); // module for accessing the users in the DB
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const cors = require('cors');


/*** Set up Passport ***/ //->operazioni standard
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session); Mette dentro il coockie l'ID; anche qua standard
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.userid);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((userid, done) => {
  userDao.getUserById(userid)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});


// init express
const app = new express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions)); // NB: solo per sviluppo e per l'esame! Altrimenti indicare dominio e porta corretti


const isLoggedIn = (req, res, next) => { //funzione che permette l'autenticazione delle varie funzioni; NB non necessariamente tutte le API vanno autenticate
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'not authenticated' });
}

// set up the session; Funzioni standard da usare per autenticazione
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());


/*** APIs ***/
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await dao.listCourses();
    const coursecodes = courses.map(course => course.coursecode);
    for (let i = 0; i < courses.length; i++) {
      courses[i].students = await dao.countStudentsForCourse(courses[i].coursecode);
    }

    //console.log(courses);
    res.json(courses);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: `Database error while retrieving students for courses` }).end();
  }
});

app.get('/api/courseStudent/:coursecode', async (req, res) => {
  try {
    const result = await dao.countStudentsForCourse(req.params.coursecode);
    if (result.error)
      res.status(404).json(result);
    else
      res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: `Database error while retrieving students for course ${req.params.code}.` }).end();
  }
})

// PUT /api/courses/:coursecode
// app.put('/api/courses/:coursecode', isLoggedIn, async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(422).json({ errors: errors.array() });
//   }

//   const course =
//   {
//     coursecode: req.params.coursecode,
//     name: req.body.name,
//     credits: req.body.credits,
//     maxstudents: req.body.maxstudents,
//     incompatibility: req.body.incompatibility,
//     prerequisites: req.body.prerequisites,
//     students: req.body.students,
//     status: req.body.status
//   }
//   try {
//     await dao.updateCourse(course);
//     res.status(200).end();
//   } catch (err) {
//     console.log(err);
//     res.status(503).json({ error: `Database error during the update of course ${req.params.id}.` });
//   }
// });


// GET /api/studyPlan
app.get('/api/studyPlan', isLoggedIn, (req, res) => {
  dao.listStudyPlan(req.user.userid)
    .then(studyPlan => res.json(studyPlan))
    .catch((err) => {
      res.status(500).json({ error: `Database error while retrieving study paln` }).end()
    });
});

// POST /api/studyPlan
app.post('/api/studyPlan', isLoggedIn, [
  check('coursecode').isLength({ min: 7, max: 7 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const studyPlan = {
    coursecode: req.body.coursecode,
    userid: req.body.userid,
    type: req.body.type
  };
  try {
    // let check = true;
    // let courses = await dao.listCourses();
    // let course = courses.find(function (c) {return c.coursecode==req.body.coursecode});
    // let sp = await dao.listStudyPlan();
    // let studyPlan = courses.filter( function (c) {
    //   if(sp.find(function (s) {return s.coursecode==c.coursecode})!=null){
    //     return c;
    //   }
    // });

    // //Controllo se il corso selezionato ha una incompatibilità presente nello Study Plan
    // if (course.incompatibility != null) {
    //   //(props.course.incompatibility.forEach(incompatibility => { console.log(props.studyPlan.find(function (studyPlan) { return studyPlan.coursecode == incompatibility })); }));
    //   const inc = course.incompatibility.find(function (incompatibility) {
    //     return props.studyPlan.find(function (studyPlan) {
    //       return studyPlan.coursecode == incompatibility
    //     })
    //   });
    //   if (inc != null) {
    //     check = false;
    //   }
    // }

    // //Controllo se uno dei corsi presenti nello Study Plan ha una incompatibilità con il corso selezionato
    // const inc = studyPlan.find(function (studyPlanCourse) {
    //   if (studyPlanCourse.incompatibility != null) {
    //     return studyPlanCourse.incompatibility.find(function (studyPlanInc) {
    //       return props.course.coursecode == studyPlanInc
    //     })
    //   }
    //   else { return null }
    // });
    // if (inc != null) {
    //   check = false;
    // }

    // //Controlla che, se il corso seleziona ha una propedeuticità, questa deve essere presente nello StudyPlan
    // if (course.prerequisites != null) {
    //   //(props.course.incompatibility.forEach(incompatibility => { console.log(props.studyPlan.find(function (studyPlan) { return studyPlan.coursecode == incompatibility })); }));
    //   const prereq = studyPlan.find(function (studyPlan) {
    //     return studyPlan.coursecode == course.prerequisites
    //   });
    //   if (prereq == null) {
    //     check = false;
    //   }
    // }

    //if (check === true) {
      await dao.createStudyPlan(studyPlan, req.body.userid);
      res.status(201).end();
    //}
    // else{
    //   res.status(404).json({error: "Impossible to inset course in the db."});
    // }

  } catch (err) {
    //res.status(503).json({ error: `Database error during the creation of studyPlan ${studyPlan.coursecode}.` });
    res.status(503).json(err);
  }
});

// GET BY ID /api/studyPlan/:coursecode
app.get('/api/studyPlan/:coursecode', isLoggedIn, async (req, res) => {
  try {
    const result = await dao.getCourseFromStudyPlanById(req.params.coursecode);
    if (result.error)
      res.status(404).json(result);
    else
      res.json(result);
  } catch (err) {
    res.status(500).end();
  }
});

// DELETE /api/studyPlan/:coursecode
app.delete('/api/studyPlan/:cursecode', isLoggedIn, async (req, res) => {
  const result = await dao.getCourseFromStudyPlanById(req.params.coursecode);
  if (result.error)
    res.status(404).json(result);
  else {
    try {
      await dao.deleteCourseInStudyPlan(req.params.coursecode, req.user.userid);
      res.status(204).end();
    } catch (err) {
      res.status(503).json({ error: `Database error during the deletion of course from study plan ${req.params.id}.` });
    }
  }
});

// DELETE /api/studyPlan
app.delete('/api/studyPlan', isLoggedIn, async (req, res) => {
  try {
    await dao.deleteAllCoursesInStudyPlan(req.user.userid);
    res.status(204).end();
  } catch (err) {
    res.status(503).json({ error: `Database error during the deletion of all course from study plan.` });
    //res.status(503).json(err);
  }
});


/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) { //Funzione che mi restituisce l'user in caso di login corretto
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => { res.end(); });
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Unauthenticated user!' });;
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});