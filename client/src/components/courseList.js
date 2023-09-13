import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';
import { Container, Table, Row, Col, Button, Collapse } from "react-bootstrap";

function CoursesListTable(props) {
    return (
        <>
            <Container fluid>
                <Row>
                    <Col>
                        <Table hover bordered>
                            <thead>
                                <tr>
                                    {props.editState ?
                                        props.isStudyPlan ?
                                            <th>Delete from Study Plan</th>
                                            : <th>Add to Study Plan</th>
                                        : false
                                    }
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Credits</th>
                                    <th>Participating Students</th>
                                    <th>Maximum Number of Students</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    props.courses.sort(function (a, b) {
                                        return a.name.localeCompare(b.name);
                                    }).map((c) => <CourseRow course={c} key={c.coursecode}
                                        user={props.user} editState={props.editState} courses={props.courses} coursesAll={props.coursesAll} setCourses={props.setCourses}
                                        studyPlan={props.studyPlan} setStudyPlan={props.setStudyPlan} studyPlanType={props.studyPlanType} setStudyPlanType={props.setStudyPlanType}
                                        message={props.message} setMessage={props.setMessage}
                                        isStudyPlan={props.isStudyPlan} />)
                                }
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

function CourseRow(props) {
    return (
        <>
            <CourseData course={props.course} courses={props.courses} coursesAll={props.coursesAll} setCourses={props.setCourses} user={props.user} editState={props.editState}
                studyPlan={props.studyPlan} setStudyPlan={props.setStudyPlan} studyPlanType={props.studyPlanType} setStudyPlanType={props.setStudyPlanType}
                message={props.message} setMessage={props.setMessage}
                isStudyPlan={props.isStudyPlan} />
        </>
    );
}

function CourseData(props) {
    const [open, setOpen] = useState(false);
    const [addCourse, setAddCourse] = useState(false);

    const handleAdding = (event) => {
        event.preventDefault();
        let check = true;

        //Controllo se il corso selezionato ha una incompatibilità presente nello Study Plan
        if (props.course.incompatibility != null) {
            //(props.course.incompatibility.forEach(incompatibility => { console.log(props.studyPlan.find(function (studyPlan) { return studyPlan.coursecode == incompatibility })); }));
            const inc = props.course.incompatibility.find(function (incompatibility) {
                return props.studyPlan.find(function (studyPlan) {
                    return studyPlan.coursecode == incompatibility
                })
            });
            if (inc != null) {
                props.setMessage(`The selected course (${props.course.coursecode}) is incompatible with the course ${inc} in the Study Plan.`);
                check = false;
            }
        }

        //Controllo se uno dei corsi presenti nello Study Plan ha una incompatibilità con il corso selezionato
        const inc = props.studyPlan.find(function (studyPlanCourse) {
            if (studyPlanCourse.incompatibility != null) {
                return studyPlanCourse.incompatibility.find(function (studyPlanInc) {
                    return props.course.coursecode == studyPlanInc
                })
            }
            else { return null }
        });
        if (inc != null) {
            props.setMessage(`The course ${inc.coursecode} in the Study Plan has an incompatibility with the selected course (${props.course.coursecode}).`);
            check = false;
        }

        //Controlla che, se il corso seleziona ha una propedeuticità, questa deve essere presente nello StudyPlan
        if (props.course.prerequisites != null) {
            //(props.course.incompatibility.forEach(incompatibility => { console.log(props.studyPlan.find(function (studyPlan) { return studyPlan.coursecode == incompatibility })); }));
            const prereq = props.studyPlan.find(function (studyPlan) {
                return studyPlan.coursecode == props.course.prerequisites
            });
            if (prereq == null) {
                props.setMessage(`The selected course (${props.course.coursecode}) requires the course ${props.course.prerequisites} as a prerequisite.`);
                check = false;
            }
        }

        //Controllo se il numero di studenti è coerente con il massimo numero di studenti iscrivibili al corso
        const newCourses = props.courses.find((course) => {
            if (props.course.coursecode == course.coursecode) {
                if (props.course.maxstudents != null && props.course.students + 1 > props.course.maxstudents) {
                    return null;
                }
                return course;
            }
        });
        if (newCourses == null) {
            props.setMessage(`The course ${props.course.coursecode} has no more places available.`);
            check = false;
        }

        if (props.studyPlan.find(function (sp) { return sp.userid == props.user.userid }) != null) {
            const credits = props.studyPlan.filter(sp => sp.coursecode != null).reduce((previousValue, currentValue) => previousValue + currentValue.credits, 0) + props.course.credits;
            const type = props.studyPlan.find(function (sp) { return sp.userid == props.user.userid }).type;
            if (type == 1 && ( credits > 80)) {
                props.setMessage(`The course ${props.course.coursecode} is incompatible with the Full-Time Study Plan.`);
                check = false;
            }
            else if (type == 2 && ( credits > 40)) {
                props.setMessage(`The course ${props.course.coursecode} is incompatible with the Part-Time Study Plan.`);
                check = false;
            }
          }

        if (check === true) {
            props.setCourses(props.courses.map(course => {
                if (props.course.coursecode == course.coursecode) {
                    course.students = course.students + 1;
                }
                return course;
            }))
            const newCourseForStudyPlan = { coursecode: props.course.coursecode, name: props.course.name, credits: props.course.credits, maxstudents: props.course.maxstudents, incompatibility: props.course.incompatibility, prerequisites: props.course.prerequisites, students: props.course.students, type: props.studyPlanType, userid: props.user.userid };/*type: props.studyPlan.find(function (e) {return e=props.user.id; }).type, DA USARE PER TRADUZIONE DA CORSO A STUDYPLAN*/
            props.setStudyPlan(oldStudyPlan => [...oldStudyPlan, newCourseForStudyPlan]);
            setAddCourse(true);
        }
    }

    const handleDeleting = (event) => {
        event.preventDefault();

        const prep = props.studyPlan.find(function (sp) {
            return sp.prerequisites == props.course.coursecode
        });
        if (prep != null) {
            props.setMessage(`The course ${props.course.coursecode} is preparatory for the course ${prep.coursecode}.`);
        }
        else {
            props.setStudyPlan(props.studyPlan.filter(function (sp) { return sp.coursecode != props.course.coursecode; }));
            setAddCourse(false);
            props.setCourses(props.coursesAll.map((course) => {
                if (props.course.coursecode == course.coursecode)
                    course.students = course.students - 1;
                return course;
            }));
            setAddCourse(true);
        }
    }
    return (
        <>
            <tr>
                {props.editState ?
                    props.isStudyPlan ?
                        <td><Row className="justify-content-md-center">
                            {props.course.status == "notDisposable" ?
                            <Col md="auto"><Button onClick={handleDeleting} variant="danger"><i className="bi bi-info"></i>{/*<p>Delete Course</p>*/}</Button></Col>
                             : <Col md="auto"><Button onClick={handleDeleting} variant="warning" className="text-white"><i className="bi bi-x"></i>{/*<p>Delete Course</p>*/}</Button></Col>
                            }
                        </Row></td>
                        : <td><Row className="justify-content-md-center">
                            {props.studyPlan.find(function (sp) { return sp.coursecode == props.course.coursecode }) != null ?
                                <Col md="auto"><Button variant="success" disabled><i className="bi bi-check"></i>{/*<p>Course Added</p>*/}</Button></Col>
                                : props.course.status == "notAddable" ?
                                    <Col md="auto"><Button onClick={handleAdding} variant="danger"><i className="bi bi-info"></i>{/*<p>Course not Addable</p>*/}</Button></Col>
                                    : <Col md="auto"><Button onClick={handleAdding} variant="success"><i className="bi bi-plus"></i>{/*<p>Add Course</p>*/}</Button></Col>
                            }
                        </Row></td>
                    : false
                }

                <td onClick={() => setOpen(!open)}
                    aria-controls="course-description"
                    aria-expanded={open}>
                    {props.course.coursecode}
                </td>
                <td onClick={() => setOpen(!open)}
                    aria-controls="course-description"
                    aria-expanded={open}>
                    {props.course.name}
                </td>
                <td onClick={() => setOpen(!open)}
                    aria-controls="course-description"
                    aria-expanded={open}>
                    {props.course.credits}
                </td>
                <td onClick={() => setOpen(!open)}
                    aria-controls="course-description"
                    aria-expanded={open}>
                    {props.course.students}
                </td>
                <td onClick={() => setOpen(!open)}
                    aria-controls="course-description"
                    aria-expanded={open}>
                    {props.course.maxstudents != undefined ? props.course.maxstudents : "not specified"}
                </td>
            </tr>
            <Collapse in={open}>
                <tr>
                    <td colSpan={6} className='p-3 mb-2 bg-light text-dark'>
                        <div id="course-description">
                            <h6>Incompatible Courses: </h6>
                            <p>{props.course.incompatibility != undefined ? props.course.incompatibility.join(', ') : "There are no incompatible courses."}</p>
                            <h6>Preparatory Courses: </h6>
                            <p>{props.course.prerequisites != undefined ? props.course.prerequisites : "No preparatory courses are required."}</p>
                        </div>
                    </td>
                </tr>
            </Collapse>
        </>

    )
}

export { CoursesListTable };