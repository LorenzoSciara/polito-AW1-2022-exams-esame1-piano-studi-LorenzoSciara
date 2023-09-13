import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { CoursesListTable } from './courseList';
import { useState } from 'react';
import { Container, Row, Col, Button, Form } from "react-bootstrap";

function StudyPlan(props) {

    const handleSubmit = (event) => {
        const credits = props.studyPlan.filter(sp => sp.coursecode !== null).reduce((previousValue, currentValue) => previousValue + currentValue.credits, 0);
        if (credits > 0) {
            const type = props.studyPlan.find(function (sp) { return sp.userid === props.user.userid }).type;

            if (type === 1 && (credits < 60 || credits > 80)) {
                props.setMessage(`The Study Plan Full-Time requires a number of total credits including between 60 and 80 credits.`);
            }
            else if (type === 2 && (credits < 20 || credits > 40)) {
                props.setMessage(`The Study Plan Part-Time requires a number of total credits including between 20 and 40 credits.`);
            }
            else {
                event.preventDefault();
                props.updateStadyPlan(props.studyPlan);
                //props.updateCourses(props.coursesAll);
                props.setEditState(false);
            }
        }
        else {
            if (props.studyPlanType === 1 && (credits < 60 || credits > 80)) {
                props.setMessage(`The Study Plan Full-Time requires a number of total credits including between 60 and 80 credits.`);
            }
            else if (props.studyPlanType === 2 && (credits < 20 || credits > 40)) {
                props.setMessage(`The Study Plan Part-Time requires a number of total credits including between 20 and 40 credits.`);
            }
        }

    }

    const handleDeletingAll = (event) => {
        event.preventDefault();
        props.setEditState(false);
        // props.updateCourses(props.coursesAll.filter(course => {
        //     if (props.studyPlan.find(sp => (course.coursecode === sp.coursecode)) !== undefined) {
        //         course.students = course.students - 1;
        //         return course;
        //     }
        // }));
        props.updateStadyPlan(null);        
    }
    return (
        <Container fluid>
            <Row>

                <Col md={4} xs={4}>
                    <h2>Study Plan</h2>
                </Col>
                <Col md={4} xs={4} />
                <Col md={4} xs={4}>
                    <Row>
                        <p>Number of credits: {props.studyPlan.filter(sp => sp.coursecode != null).reduce((previousValue, currentValue) => previousValue + currentValue.credits, 0)} </p>
                        {props.studyPlanType === 1 ?
                            <p>It must be between 60 and 80 credits</p>
                            : <p>It must be between 20 and 40 credits</p>
                        }
                    </Row>
                </Col>
            </Row>
            <ul></ul>
            <Row>
                {props.studyPlan.filter(studyPlan => studyPlan.coursecode != null).length === 0 ?
                    <p>Your Study Plan is empty</p>
                    : <CoursesListTable courses={props.studyPlan.filter(studyPlan => studyPlan.coursecode != null)} coursesAll={props.coursesAll} setCourses={props.setCourses} editState={props.editState}
                        loggedIn={props.loggedIn} user={props.user} message={props.message} setMessage={props.setMessage}
                        studyPlan={props.studyPlan} setStudyPlan={props.setStudyPlan}
                        isStudyPlan={true} />
                }
            </Row>
            <ul></ul>
            {props.editState ?
                <Row>
                    <Col md={2} xs={2}>
                        <Button onClick={() => { props.setEditState(false); props.setDirty(true); }} variant="danger">Back</Button>
                    </Col>
                    <Col md={8} xs={8} />
                    <Col md={2} xs={2}>
                        <Button onClick={handleSubmit} variant="success">Save</Button>
                    </Col>
                </Row>
                : <Row>
                    <Col md={3} xs={3}>
                        <Button onClick={handleDeletingAll} variant="danger"><i className="bi bi-x-lg"></i>{" "}Delete All</Button>
                    </Col>
                    <Col md={7} xs={7} />
                    <Col md={2} xs={2}>
                        <Button onClick={() => { props.setEditState(true) }} variant="warning" className="text-white"><i className="bi bi-pencil"></i>{" "}Edit</Button>
                    </Col>
                </Row>
            }
        </Container>
    );
}

function CreateStudyPlan(props) {

    const [radioButton, setRadioButton] = useState("0"); //1=fullTime; 2=partTime

    const handleSubmit = (event) => {
        event.preventDefault();
        //props.createStudyPlan(radioButton, props.user.userid);
        props.setStudyPlanState(1);
        props.setStudyPlanType(radioButton);
        props.setEditState(true);
    }

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Row>
                        <h2 className="text-center">Create Study Plan</h2>
                        <p className="text-center">Select the type of Study Plan</p>
                    </Row>
                    <ul></ul>
                    <Row>
                        <Form>
                            <div key="inline-radio" className="mb-3">
                                <Row>
                                    <Col md={2} xs={2}></Col>
                                    <Col md={2} xs={2}>
                                        <h5><Form.Check
                                            inline
                                            label="Full time"
                                            name="group1"
                                            type="radio"
                                            id="inline-radio-1"
                                            onClick={() => { setRadioButton(1) }}
                                        /></h5>
                                    </Col>
                                    <Col md={4} xs={4}></Col>
                                    <Col md={2} xs={2}>
                                        <h5><Form.Check
                                            inline
                                            label="Part time"
                                            name="group1"
                                            type="radio"
                                            id="inline-radio-2"
                                            onClick={() => { setRadioButton(2) }}
                                        /></h5>
                                    </Col>
                                </Row>
                            </div>
                        </Form>
                    </Row>
                    <ul></ul>
                    <Row>
                        <Col md={2} xs={2}></Col>
                        <Col md={2} xs={2}>
                            <Button onClick={() => { props.setStudyPlanState(0) }} variant="danger">Back</Button>{" "}
                        </Col>
                        <Col md={4} xs={4}></Col>
                        <Col md={2} xs={2}>
                            {radioButton === 0 ? <Button variant="success" disabled>Continue</Button>
                                : <Button onClick={handleSubmit} variant="success">Continue</Button>
                            }
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}
export { StudyPlan, CreateStudyPlan };