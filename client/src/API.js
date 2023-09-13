/**
 * All the API calls
 */

const dayjs = require("dayjs");
const URL = 'http://localhost:3001/api';  // Do not forget '/' at the end

async function getAllCourses() {
  // call: GET /api/courses
  const response = await fetch(URL + '/courses', { credentials: 'include' });
  const coursesJson = await response.json();
  if (response.ok) {
    return coursesJson.map((co) => ({ coursecode: co.coursecode, name: co.name, credits: co.credits, maxstudents: co.maxstudents, incompatibility: co.incompatibility, prerequisites: co.prerequisites, students: co.students, status: null }));
  } else {
    throw coursesJson;  // an object with the error coming from the server
  }
}

async function updateCourses(course) {
  // call PUT /api/courses/:coursecode
  return new Promise((resolve, reject) => {
    fetch(URL + '/courses/' + course.coursecode, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coursecode: course.coursecode, name: course.name, credits: course.credits, maxstudents: course.maxstudents, incompatibility: course.incompatibility, prerequisites: course.prerequisites, students: course.students, status: course.status
      }),
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        response.json()
          .then((obj) => { reject(obj); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}


// async function countStudentForCourses(coursecode) {
//   // call: GET /api/courseStudent/:coursecode
//     const response = await fetch(URL + '/countStudentForCourses' + coursecode, { credentials: 'include' });
//     const countJson = await response.json();
//     if (response.ok) {
//       return  countJson;
//     } else {
//       throw countJson;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
//     }
// }

async function getAllStudyPlan() {
  // call: GET /api/studyPlan
  const response = await fetch(URL + '/studyPlan', { credentials: 'include' });
  const StudyPlanJson = await response.json();
  if (response.ok) {
    return StudyPlanJson.map((sp) => ({ coursecode: sp.coursecode, userid: sp.userid, type: sp.type }));
  } else {
    throw StudyPlanJson;  // an object with the error coming from the server
  }
}

async function addStudyPlan(type, user, coursecode) {
  // call: POST /api/studyPlan
  return new Promise((resolve, reject) => {
    fetch(URL + '/studyPlan', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userid: user,
        type: type,
        coursecode: coursecode
      }),
    })
      .then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
      }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

async function deleteCourseFromStudyPlan(coursecode) {
  // call: DELETE /api/studyPlan/:coursecode

  return new Promise((resolve, reject) => {
    fetch(URL + '/studyPlan/' + coursecode, {
      method: 'DELETE',
      credentials: 'include',
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

async function deleteAllCourseFromStudyPlan() {
  // call: DELETE /api/studyPlan
  return new Promise((resolve, reject) => {
    fetch(URL + '/studyPlan', {
      method: 'DELETE',
      credentials: 'include',
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}


/* user/logIn/logOut API */

async function logIn(credentials) {
  let response = await fetch(URL + '/sessions', { //sessions è la continuazione dell'url per il login
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials), //faccio la richiesta al server
  });
  if (response.ok) {
    const user = await response.json();
    return user; //se è andato tutto bene ritorno l'user
  } else {
    const errDetail = await response.json();
    throw errDetail.message; //se ho problemi ritorno messaggio di errore
  }
}

async function logOut() { //API di logout
  await fetch(URL + '/sessions/current', { method: 'DELETE', credentials: 'include' });
}

async function getUserInfo() {
  const response = await fetch(URL + '/sessions/current', { credentials: 'include' });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}

const API = { getAllCourses, getAllStudyPlan, updateCourses, addStudyPlan, deleteCourseFromStudyPlan, deleteAllCourseFromStudyPlan, logIn, logOut, getUserInfo };
export default API;