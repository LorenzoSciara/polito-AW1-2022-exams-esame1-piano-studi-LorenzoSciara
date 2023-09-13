import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { HomePage, NoMatch } from "./components/homePage";
import { LoginForm } from './components/LoginComponents';
import { LoggedInPage } from "./components/loggedInPage";
import API from './API';

function App() {
  return (
    <Router>
      <App2 />
    </Router>
  );
}

function App2() {
  const [courses, setCourses] = useState([]); //Stato con i corsi generali
  const [studyPlan, setStudyPlan] = useState([]); //Stato con lo StudyPlan
  const [studyPlanState, setStudyPlanState] = useState(0); //0=l'utente non ha ancora creato uno studyPlan; -1=l'utente sta creando uno studyPlan; 1=l'utente ha gia creato uno studyPlan
  const [studyPlanType, setStudyPlanType] = useState(0); //0=studyPlan non è stato definito; 1=studyPlan is Full-Time; 2=studyPlan is Part-Time
  const [editState, setEditState] = useState(false); //false=l'utente non sta modificando lo study plan; true=l'utente sta modificando lo study plan

  const [dirty, setDirty] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);  // no user is logged in when app loads
  const [user, setUser] = useState({});
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {
        handleError(err);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (loggedIn)
      API.getAllStudyPlan()
        .then((sp) => { //NB traduce da StudyPlan formato DB a StudyPlan nel formato di lista di corsi
          setStudyPlan(sp.map(function (spc) {
            if (spc.coursecode != null) {
              let c = courses.find(function (c) { return c.coursecode === spc.coursecode });
              c.type = spc.type;
              c.userid = spc.userid;
              return c;
            }
            else {
              return spc;
            }
          }));
          if (studyPlan.length != 0) {
            setStudyPlanType(studyPlan.find(function (sp) { return sp.userid == user.userid }).type)
          }

          setDirty(true);
          setStudyPlanState(sp.length);
        })
        .catch(err => handleError(err))

  }, [loggedIn]) //Quando mi autentico carico le informazioni della pagina

  useEffect(() => {
    // fetch  /api/courses
    if (dirty) {
      API.getAllCourses()
        .then((courses) => {
          setCourses(courses.map((course) => {
            //Controllo se il corso selezionato ha una incompatibilità presente nello Study Plan
            let check = true
            if (course.incompatibility != null) {
              const inc = course.incompatibility.find(function (incompatibility) {
                return studyPlan.find(function (studyPlan) {
                  return studyPlan.coursecode === incompatibility
                })
              });
              if (inc != null) {
                check = false;
              }
            }

            //Controllo se uno dei corsi presenti nello Study Plan ha una incompatibilità con il corso selezionato
            const inc = studyPlan.find(function (studyPlanCourse) {
              if (studyPlanCourse.incompatibility != null) {
                return studyPlanCourse.incompatibility.find(function (studyPlanInc) {
                  return course.coursecode == studyPlanInc
                })
              }
              else { return null }
            });
            if (inc != null) {
              check = false;
            }

            if (course.prerequisites != null) {
              const prereq = studyPlan.find(function (studyPlan) {
                return studyPlan.coursecode == course.prerequisites
              });
              if (prereq == null) {
                check = false;
              }
            }

            if (course.students == course.maxstudents) {
              check = false;
            }

            if (studyPlan.find(function (sp) { return sp.userid == user.userid }) != null) {
              const credits = studyPlan.filter(sp => sp.coursecode != null).reduce((previousValue, currentValue) => previousValue + currentValue.credits, 0) + course.credits;
              const type = studyPlan.find(function (sp) { return sp.userid == user.userid }).type;
              if (type == 1 && (credits > 80)) {
                check = false;
              }
              else if (type == 2 && (credits > 40)) {
                check = false;
              }
            }

            if (check !== true) {
              course.status = "notAddable";
            }
            else {
              course.status = null;
            }
            return course;
          }));

          setCourses(courses);
          setDirty(false);
        })
        .catch(err => console.log(err))
    }
  }, [dirty])

  useEffect(() => {
    setCourses(courses.map((course) => {
      //Controllo se il corso selezionato ha una incompatibilità presente nello Study Plan
      let check = true;
      if (course.incompatibility != null) {
        const inc = course.incompatibility.find(function (incompatibility) {
          return studyPlan.find(function (studyPlan) {
            return studyPlan.coursecode == incompatibility
          })
        });
        if (inc != null) {
          check = false;
        }
      }
      //Controllo se uno dei corsi presenti nello Study Plan ha una incompatibilità con il corso selezionato
      const inc = studyPlan.find(function (studyPlanCourse) {
        if (studyPlanCourse.incompatibility != null) {
          return studyPlanCourse.incompatibility.find(function (studyPlanInc) {
            return course.coursecode == studyPlanInc
          })
        }
        else { return null }
      });
      if (inc != null) {
        check = false;
      }

      if (course.prerequisites != null) {
        const prereq = studyPlan.find(function (studyPlan) {
          return studyPlan.coursecode == course.prerequisites
        });
        if (prereq == null) {
          check = false;
        }
      }

      if (course.students == course.maxstudents) {
        check = false;
      }

      if (studyPlan.find(function (sp) { return sp.userid == user.userid }) != null) {
        const credits = studyPlan.filter(sp => sp.coursecode != null).reduce((previousValue, currentValue) => previousValue + currentValue.credits, 0) + course.credits;
        const type = studyPlan.find(function (sp) { return sp.userid == user.userid }).type;
        if (type == 1 && (credits > 80)) {
          check = false;
        }
        else if (type == 2 && (credits > 40)) {
          check = false;
        }
      }

      if (check !== true) {
        course.status = "notAddable";
      }
      else {
        course.status = null;
      }
      return course;
    }));

    setStudyPlan(studyPlan.map(sp => {
      if (sp.coursecode != null) {

        let newSp = courses.find(function (c) { return c.coursecode == sp.coursecode });
        newSp.type = sp.type;
        newSp.userid = sp.userid;
        const prep = studyPlan.find(function (sp) {
          return sp.prerequisites == newSp.coursecode
        });
        if (prep != null) {
          newSp.status = "notDisposable"
        }
        else {
          newSp.status = null;
        }
        return newSp;

      }
      else {
        return sp;
      }
    }));

    if (studyPlan.length != 0) {
      setStudyPlanType(studyPlan.find(function (sp) { return sp.userid == user.userid }).type);
    }
  }, [studyPlan.length])


  useEffect(() => {
    // fetch  /api/courses
    if (loggedIn && dirty) {
      API.getAllStudyPlan()
        .then((sp) => {
          setStudyPlan(sp.map((spc) => {//NB traduce da StudyPlan formato DB a StudyPlan nel formato di lista di corsi
            if (spc.coursecode != null) {
              let newSp = courses.find(function (c) { return c.coursecode == spc.coursecode });
              newSp.type = spc.type;
              newSp.userid = user.userid;
              const prep = studyPlan.find(function (sp) {
                return sp.prerequisites == newSp.coursecode
              });
              if (prep != null) {
                newSp.status = "notDisposable"
              }
              else {
                newSp.status = null;
              }

              return newSp;
            }
            else {
              return spc;
            }
          }));
          
          if (studyPlan.length !== 0) {
            setStudyPlanType(studyPlan.find(function (sp) { return sp.userid == user.userid }).type)
          }
            setStudyPlanState(sp.length);
            setDirty(false);
        })
        .catch(err => console.log(err))
    }
  }, [dirty])

  function createStudyPlan(type, userid) {
    const newStudyPlan = { coursecode: null, userid: userid, type: type, };
    setStudyPlan(oldStudyPlan => [...oldStudyPlan, newStudyPlan]);

    API.addStudyPlan(type, userid, null)
      .then(() => { setStudyPlanState(1); setDirty(true); })
      .catch(err => handleError(err));
  }

  function addCourseToStudyPlan(coursecode, type, userid) {
    API.addStudyPlan(type, userid, coursecode)
      .then(() => { setStudyPlanState(studyPlanState + 1); })
      .catch(err => handleError(err));
  }

  function deleteCourseFromStudyPlan(coursecode) {
    //setFilms(listFilms => listFilms.map(f => (f.id === id) ? { ...f } : f))
    API.deleteCourseFromStudyPlan(coursecode)
      .then(() => { setDirty(true) })
      .catch(err => handleError(err));
  }

  function updateStadyPlan(studyPlan) {
    API.deleteAllCourseFromStudyPlan().then(() => {
      if (studyPlan != null) {
        studyPlan.filter(function (sp) { return sp.coursecode != null }).forEach(sp => {
          addCourseToStudyPlan(sp.coursecode, studyPlan.find(function (sp) { return sp.userid == user.userid }).type, user.userid);
        })
      }
      setDirty(true);
    }
    ).catch(err => console.log(err));

  }

  function updateCourse(course) {
    setCourses(courses => courses.map( //aggiorna icorsi sul client
      c => (course.coursecode === c.coursecode) ? Object.assign({}, course) : c
    ));
    //Aggiorna i corsi sul server
    API.updateCourses(course)
      .then(() => setDirty(true))
      .catch(err => handleError(err));
  }

  function updateCourses(courses) {
    courses.forEach(course => {
      updateCourse(course);
    })
  }


  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        setLoggedIn(true);
        setUser(user);
        setMessage('');
        navigate('/loggedPage');
      })
      .catch(err => {
        setMessage(err);
      }
      )
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setStudyPlan([]);
    setUser({});
    setMessage('');
    navigate('/');
  }



  function handleError(err) {
    console.log(err);
  }

  return (
    <>
      <Routes>
        <Route path='/' element={<HomePage courses={courses}
          loggedIn={loggedIn} doLogOut={doLogOut} />} />
        <Route path='/login' element={loggedIn ? <Navigate to='/loggedPage' /> : <LoginForm login={doLogIn} loggedIn={loggedIn} message={message} setMessage={setMessage} />} />
        <Route path='/loggedPage' element={
          loggedIn ?
            <LoggedInPage courses={courses} setCourses={setCourses} studyPlan={studyPlan} setStudyPlan={setStudyPlan} studyPlanState={studyPlanState} setStudyPlanState={setStudyPlanState}
              loggedIn={loggedIn} setLoggedIn={setLoggedIn} doLogOut={doLogOut} user={user} setUser={setUser}
              message={message} setMessage={setMessage} editState={editState} setEditState={setEditState}
              updateCourses={updateCourses}
              createStudyPlan={createStudyPlan} updateStadyPlan={updateStadyPlan} deleteCourseFromStudyPlan={deleteCourseFromStudyPlan}
              studyPlanType={studyPlanType} setStudyPlanType={setStudyPlanType}
              dirty={dirty} setDirty={setDirty} />
            : <Navigate to='/login' />
        } />
        <Route path="*" element={
            <NoMatch />
        } />
      </Routes>
    </>
  );
}
export default App;
