import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { CoursesListTable } from "./courseList";
import { Container, Row, Col, Button, Navbar } from "react-bootstrap";
import { useNavigate, Link } from 'react-router-dom';


function HomePage(props) {
    const navigate = useNavigate();
    
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
                                        <Button onClick={() => { navigate('/login') }} variant='success'><i className="bi bi-box-arrow-in-right"></i> Log-In {" "}</Button>
                                    </Col>
                                </Row>
                            </div>
                        </Container>
                    </Navbar>
                </Row>
                <ul></ul>
                <Container fluid>
                    <Row>
                        <Col>
                            <h2>All Courses</h2>
                        </Col>
                    </Row>
                    <ul></ul>
                    <Row>
                        <CoursesListTable courses={props.courses} editState={false} loggedIn={props.loggedIn}/>
                    </Row>
                </Container>
            </Container>
        </>
    );
}

function NoMatch() {
    return (
        <>
            <h1>
                <p align="center" > Oops! </p>
                <p align="center">We can't seem to find the page you are looking for. </p>
            </h1>
            <h5 align="center" size="1">Here are some helpful link instead
                <ul></ul>
                <Link to="/">Home</Link>
                <ul></ul>
            </h5>

        </>
    );
};

export { HomePage, NoMatch };