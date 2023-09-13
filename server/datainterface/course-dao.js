'use strict';
/* Data Access Object (DAO) module for accessing courses */
const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('studyplan.db', (err) => {
  if (err) throw err;
});

// get all courses
exports.listCourses = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM course';
    //const sql1 = 'SELECT COUNT(userid) AS count FROM studyplan WHERE coursecode = ?';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const courses = rows.map((e) => {
        return (e.incompatibility != null ? { coursecode: e.coursecode, name: e.name, credits: e.credits, maxstudents: e.maxstudents, incompatibility: e.incompatibility.trim().toUpperCase().split("\r\n"), prerequisites: e.prerequisites, students: null }
          : { coursecode: e.coursecode, name: e.name, credits: e.credits, maxstudents: e.maxstudents, incompatibility: e.incompatibility, prerequisites: e.prerequisites, students: null });
      });
      resolve(courses);
    });
  });
};

exports.countStudentsForCourse = (coursecode) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT COUNT(userid) AS count FROM studyplan WHERE coursecode = ?';
    db.get(sql, [coursecode], (err, row) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      if (row == undefined) {
        resolve({error: 'Course not found.'});
      } else {
        //console.log("coursecode", coursecode, "count", row.count);
        resolve(row.count);
      }
    });
  });
};

exports.updateCourse = (course) => {
  return new Promise((resolve, reject) => {

    const sql = 'UPDATE course SET coursecode=?, name=?, credits=?, maxstudents=?, incompatibility=?, prerequisites=?, students=?   WHERE coursecode = ?';
    db.run(sql, [course.coursecode, course.name, course.credits, course.maxstudents, course.incompatibility, course.prerequisites, course.students, course.coursecode], function (err) {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      else{
        resolve(this.lastID);
      }
    });
  });
};

// get all studyPlan
exports.listStudyPlan = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM studyplan WHERE userid = ?';
    db.all(sql, [userId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      else {
        const studyPlan = rows.map((e) => ({ coursecode: e.coursecode, userid: e.userid, type: e.type }));
        resolve(studyPlan);
        return;
      }
    });
  });
};

//add a studyPlan
exports.createStudyPlan = (studyPlan, userId) => {
  return new Promise((resolve, reject) => {
    if (studyPlan.coursecode === null) {
      const sql = 'INSERT INTO studyplan(userid, type) VALUES(?, ?)';
      db.run(sql, [userId, studyPlan.type], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
        return;
      });
    }
    else {
      const sql = 'INSERT INTO studyplan(coursecode, userid, type) VALUES(?, ?, ?)';
      db.run(sql, [studyPlan.coursecode, userId, studyPlan.type], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      });
    }
  })
}

exports.getCourseFromStudyPlanById = (userid) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM studyplan WHERE userid=?';
    db.get(sql, [userid], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row === undefined) {
        resolve({ error: 'course not found in study plan.' });
      } else {
        const studyPlan = { coursecode: row.coursecode, userid: row.userid, type: row.type };
        resolve(studyPlan);
      }
    });
  });
};

exports.deleteCourseInStudyPlan = (coursecode, userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM studyplan WHERE coursecode = ? AND userid = ?';
    db.run(sql, [coursecode, userId], (err) => {
      if (err) {
        reject(err);
        return;
      } else
        resolve(null);
    });
  })
}

exports.deleteAllCoursesInStudyPlan = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM studyplan WHERE coursecode IS NOT NULL AND userid = ?';
    db.run(sql, [userId], (err) => {
      if (err) {
        reject(err);
        return;
      } else
        resolve(null);
    });
  })
}

