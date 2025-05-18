import React, { useEffect, useState, useRef } from 'react';
import { Page, Navbar, List, ListInput, Icon, LoginScreenTitle, Button, Col, Row, Block, f7, useStore } from 'framework7-react';

import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';

import { emailPattern } from '../services/variable';
import forgottenPasswordImage from '../public/forgotten.png';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isValidEmail, setIsValidEmail] = useState(false);
    const [disabledSendEmail, setDisabledSendEmail] = useState(true);
    const toast = useRef(null);
    let isDarkMode = useStore('themeIsDark');
    //isDarkMode = true;

    console.log(isDarkMode)

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
        <Page name='forgot-password'>
            <Navbar title='Forgot Password' backLink='Back' className='global-color'/>

            <div className='block margin-top mb-5'></div>
            <LoginScreenTitle className='global-color margin-top mb-3'>Reset Password Form</LoginScreenTitle>
            <img src={forgottenPasswordImage} className='lazy lazy-fade-in forgot-password-logo-image'/>

            <List strongIos dividersIos insetIos>
                <ListInput 
                    onChange={emailHandler}
                    label='Email' 
                    floatingLabel 
                    type='text' 
                    placeholder='Your email' 
                    color='blue' 
                    clearButton 
                    info='Check your email after send you!'
                    value={email}
                >
                    <Icon icon='demo-list-icon' slot='media' />
                </ListInput>
                <p className={`my-4 text-center ${isDarkMode ? 'color-white' : 'color-black'}`}>Provide the email address associated with your account to recover your password.</p>
            </List>

            <Block strong className={`${isDarkMode ? 'background-color-white' : 'background-color-blue'}`}>
                <Row className='flex-center-container'>
                    <Col width='50'>
                        <Button onClick={sendEmailHandler}  onTouchStart={sendEmailHandler} disabled={disabledSendEmail} fill raised color='blue'>
                            <span className='color-white'>Send</span>
                        </Button>
                    </Col>
                </Row>
            </Block>
        </Page>
    );
}

export default ForgotPasswordPage;
