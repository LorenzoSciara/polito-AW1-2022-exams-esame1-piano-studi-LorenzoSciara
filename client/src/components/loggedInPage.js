import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { CoursesListTable } from "./courseList";
import { LogoutButton } from './LoginComponents';
import { Container, Row, Col, Button, Navbar, Alert } from "react-bootstrap";
import { CreateStudyPlan, StudyPlan } from './studyPlan';


function LoggedInPage(props) {

    return (
        <>
            <Container fluid>
                <Row>
                    <Navbar expand="lg" bg="secondary" variant="dark">
                        <Container fluid>
                            <Navbar.Brand>
                                <h2><i className="bi bi-book"></i>{" "}Study Plan</h2>
                            </Navbar.Brand>
                            {/* <Form className="d-flex">
                                <FormControl type="search" placeholder="Search" className="me-2" aria-label="Search" disabled readOnly />
                            </Form> */}
                            <div>
                                <Row>
                                    <Col>
                                        {props.loggedIn ? <LogoutButton logout={props.doLogOut} user={props.user} /> : false}
                                    </Col>
                                </Row>
                            </div>
                        </Container>
                    </Navbar>
                </Row>
                <ul></ul>
                <Container>
                    <Row><Col>
                        {props.message ? <Alert variant='danger' onClose={() => props.setMessage('')} dismissible>{props.message}</Alert> : false}
                    </Col></Row>
                </Container>
                <ul></ul>
                {props.studyPlanState === -1 ? <CreateStudyPlan studyPlan={props.studyPlan} setStudyPlan={props.setStudyPlan}
                    studyPlanState={props.studyPlanState} setStudyPlanState={props.setStudyPlanState}
                    editState={props.editState} createStudyPlan={props.createStudyPlan} studyPlanType={props.studyPlanType} setStudyPlanType={props.setStudyPlanType}
                    setEditState={props.setEditState}
                    user={props.user} /> : false}

                {props.studyPlanState > 0 ? <StudyPlan studyPlan={props.studyPlan} setStudyPlan={props.setStudyPlan} studyPlanType={props.studyPlanType} setStudyPlanType={props.setStudyPlanType}
                    studyPlanState={props.studyPlanState} setStudyPlanState={props.setStudyPlanState}
                    coursesAll={props.courses} setCourses={props.setCourses}
                    editState={props.editState} setEditState={props.setEditState} message={props.message} setMessage={props.setMessage}
                    loggedIn={props.loggedIn} user={props.user}
                    updateCourses={props.updateCourses} updateStadyPlan={props.updateStadyPlan} deleteCourseFromStudyPlan={props.deleteCourseFromStudyPlan}
                    dirty={props.dirty} setDirty={props.setDirty}/>
                    : false
                }
                <ul></ul>
                <Container fluid>
                    <Row>
                        <Col md={10} xs={10}>
                            <h2>All Courses</h2>
                        </Col>
                        <Col md={2} xs={2}>
                            {props.studyPlanState === 0 ?
                                <Button onClick={() => { props.setStudyPlanState(-1) }} variant="success"><i className="bi bi-plus-lg"></i>{" "}Create study plan </Button>
                                : false
                            }
                        </Col>
                    </Row>
                    <ul></ul>
                    <Row>
                        <CoursesListTable courses={props.courses} setCourses={props.setCourses} editState={props.editState}
                            loggedIn={props.loggedIn} user={props.user}
                            studyPlan={props.studyPlan} setStudyPlan={props.setStudyPlan} studyPlanType={props.studyPlanType} setStudyPlanType={props.setStudyPlanType}
                            message={props.message} setMessage={props.setMessage} 
                            isStudyPlan={false}/>
                    </Row>
                </Container>
            </Container>
        </>
    );
}

export { LoggedInPage };