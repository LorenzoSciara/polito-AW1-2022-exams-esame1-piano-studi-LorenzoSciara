import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';

function LoginForm(props) {
    const [username, setUsername] = useState('testuser@polito.it'); //diamo già un utente preimpostati per facilitare l'accesso durante la programmazione (!DA FARE ALL'ESAME!)
    const [password, setPassword] = useState('password');
    // const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        props.setMessage('');
        const credentials = { username, password }; //Variabile con credenziali di accesso

        // SOME VALIDATION, ADD MORE!!!-> Controlla che i campi non siano vuoti
        let valid = true;
        if (username === '' || password === '')
            valid = false;

        if (valid) {
            props.login(credentials); //funzione a cui passo le credenziali di accesso
        }
        else {
            // show a better error message...
            props.setMessage('Insert username and/or password.')
        }
    };

    const handleBack = (event) => {
        event.preventDefault();
        setUsername('');
        setPassword('');
        navigate('/');
    }

    return (
        <Container>
            <ul></ul>
            <Container>
                <Row><Col>
                    {props.message ? <Alert variant='danger' onClose={() => props.setMessage('')} dismissible>{props.message}</Alert> : false}
                </Col></Row>
            </Container>
            <Row className="justify-content-md-center">
                <Col md="auto">
                    <h2 className="text-center">Log-In</h2>
                    <Form> {/* Uso due caselle per il form del login */}
                        {/* {props.message ? <Alert variant='danger'>{props.message}</Alert> : ''} */}
                        <Form.Group controlId='username'>
                            <Form.Label>email</Form.Label>
                            <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
                        </Form.Group>
                        <Form.Group controlId='password'>
                            <Form.Label>Password</Form.Label>
                            <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                        </Form.Group>
                        <ul></ul>
                        <Row>
                            <Col md={5} xs={5}>
                                <Button onClick={handleBack} variant="danger">Back</Button>{" "}
                            </Col>
                            <Col md={2} xs={2}></Col>
                            <Col md={5} xs={5}>
                                <Button onClick={handleSubmit} variant="success">Log-In</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}

function LogoutButton(props) {
    return (
        <Col>
            <span className="text-white">Welcome,{props.user?.name}</span>{' '}
            <Button onClick={props.logout} variant='danger'> <i className="bi bi-box-arrow-right"></i>{" "} Log-Out</Button>
        </Col>
    )
}


export { LoginForm, LogoutButton };