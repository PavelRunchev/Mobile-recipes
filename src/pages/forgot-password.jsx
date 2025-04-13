import React, { useEffect, useState, useRef } from 'react';
import { Page, Navbar, List, ListInput, Icon, LoginScreenTitle, Button, Col, Row, Block, f7 } from 'framework7-react';

import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';

import { emailPattern } from '../services/variable';
import forgottenPasswordImage from '../public/forgotten-password.png';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isValidEmail, setIsValidEmail] = useState(false);
    const [disabledSendEmail, setDisabledSendEmail] = useState(true);
    const toast = useRef(null);

    useEffect(() => {
        if(isValidEmail) {
            setDisabledSendEmail(false);
        } else {
            setDisabledSendEmail(true);
        }
    }, [isValidEmail]);

    function emailHandler(e) {
        setEmail(e.target.value);
        e.target.value.match(emailPattern) ? setIsValidEmail(true) : setIsValidEmail(false);
    }

    async function sendEmailHandler(e) {
        e.preventDefault();
        try {
            if(isValidEmail) {
                f7.preloader.show();
                
                await sendPasswordResetEmail(auth, email);
                if (!toast.current) {
                    toast.current = f7.toast.create({ text: 'Send your email successfully!', position: 'top', cssClass: 'text-primary', closeTimeout: 4000 });
                }
                toast.current.open();
                f7.tab.show('#view-home');
                f7.preloader.hide();
                setEmail('');
                setIsValidEmail(false);
                setDisabledSendEmail(true);
            }
        } catch(error) {
            console.log(error.message);
        }
    }

    return (
        <Page name='forgot-password' >
            <Navbar title='Forgot Password' backLink='Back' className='global-color'/>

            <div className='block margin-top mb-5'></div>
            <LoginScreenTitle className='global-color margin-top mb-5'>Reset Password Form</LoginScreenTitle>
            <img src={forgottenPasswordImage} className='log-in-logo-image lazy lazy-fade-in'/>

            <List strongIos dividersIos insetIos>
                <ListInput 
                    onChange={emailHandler}
                    label='Email' 
                    floatingLabel 
                    type='text' 
                    placeholder='Your email' 
                    color='teal' 
                    clearButton 
                    info='Check your email after send you!'
                    value={email}
                >
                    <Icon icon='demo-list-icon' slot='media' />
                </ListInput>
                <p className='my-4 text-center teal-color'>Provide the email address associated with your account to recover your password.</p>
            </List>

            <Block strong className='background-teal-opacity-2'>
                <Row className='flex-center-container'>
                    <Col width='50'>
                        <Button onClick={sendEmailHandler} disabled={disabledSendEmail} fill raised color='teal'>Send</Button>
                    </Col>
                </Row>
            </Block>
        </Page>
    );
}

export default ForgotPasswordPage;
