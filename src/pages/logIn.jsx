import React, { useEffect, useState, useRef } from 'react';
import '../css/logIn.css';
import { Col, Page, Navbar, List, Link, ListInput, LoginScreenTitle, Row, Button, Block, f7 } from 'framework7-react';
import store from '../js/store';

import { auth } from './../firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  signInWithPopup, 
  GithubAuthProvider,
  TwitterAuthProvider
} from 'firebase/auth';

import { getAuthUserFromRealtimeDB } from '../services/userServices';
import { emailPattern, passwordPattern } from '../services/variable';

import loginImage from '../public/Login-PNG-Image.png'
import forgottenPassword from '../public/forgotten-password.png';

import { FaGoogle } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { FaTwitter } from 'react-icons/fa';

function LogInPage() {
    const [email, setEmail] = useState('');
    const [emailIsValid, setEmailIsValid] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordIsValid, setPasswordIsValid] = useState(false);
    const [invalidEmailOrPass, setInvalidEmailOrPass] = useState(false);

    const [btnIsDisabled, setBtnIsDisabled] = useState(true);
    const toast = useRef(null);

    useEffect(() => {
        if(emailIsValid && passwordIsValid)
        setBtnIsDisabled(false);
        else
        setBtnIsDisabled(true);
    }, [emailIsValid, passwordIsValid, btnIsDisabled]);



    function emailHandler(e) {
        e.target.value.match(emailPattern) ? setEmailIsValid(true) : setEmailIsValid(false);
        setEmail(e.target.value);
    }

    function passwordHandler(e) {
        e.target.value.match(passwordPattern) ? setPasswordIsValid(true) : setPasswordIsValid(false);
        setPassword(e.target.value);
    }

    function getAnonymousUser(res) {
        return { 
            userUID: res.user.uid, 
            email: res.user.email, 
            username: res.user.displayName,
            accessToken: res.user.accessToken,
            roles: ['User', 'Anonymous'],
            avatar: 'https://firebasestorage.googleapis.com/v0/b/signin-autumn.appspot.com/o/avatars%2Favatar-anonymous.png?alt=media&token=25565dda-5768-443d-b761-ed68e13ab212',
            recipes: [], 
            gender: 'Male'
        };
    }

    async function signInHandler(e) {
        e.preventDefault();

        try {
            if(email != '' && password != '' && emailIsValid && passwordIsValid) {
                f7.preloader.show();
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                if(userCredential.user && userCredential.user.accessToken) {
                    const getUserFromDB = await getAuthUserFromRealtimeDB(userCredential.user.uid);
                       
                    const user = { 
                        userUID: userCredential.user.uid, 
                        email: userCredential.user.email, 
                        accessToken: userCredential.user.accessToken 
                    };
    
                    const authUser = Object.assign({}, user, getUserFromDB);
                    store.dispatch('addCredentialUser', authUser);

                    toast.current = f7.toast.create({ text: 'User logged in successfully!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
                    toast.current.open();
                    f7.tab.show('#view-home');
                    //clear all fields
                    setEmail('');
                    setEmailIsValid(false);
                    setPassword('');
                    setPasswordIsValid(false);
                    setBtnIsDisabled(true);
                    setInvalidEmailOrPass(false);

                } else {
                    toast.current = f7.toast.create({ text: 'Invalid email or password!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                    toast.current.open();
                }

                f7.preloader.hide();

            }  else {
                toast.current = f7.toast.create({ text: 'Fields are an empty!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                toast.current.open();
            }

        } catch(error) {
            if(error.code == 'auth/invalid-credential') {
                toast.current = f7.toast.create({ text: 'Invalid email or password!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                toast.current.open();
                setInvalidEmailOrPass(true);
            } else if(error.code == 'auth/invalid-email') {
                toast.current = f7.toast.create({ text: 'Invalid email format!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                toast.current.open();
                setInvalidEmailOrPass(true);
            } else if(error.code == 'auth/user-not-found'){
                toast.current = f7.toast.create({ text: 'Invalid email or password!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                toast.current.open();
                setInvalidEmailOrPass(true);
            } else {
                console.log(error.message);
            }

            f7.preloader.hide();
        }
  }

    async function logInWithGoogle(e) {
        try {
            const provider = new GoogleAuthProvider();
            
            const res = await signInWithPopup(auth, provider);
            toast.current = f7.toast.create({ text: 'User logged in successfully!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
            toast.current.open();
            const authUser = getAnonymousUser(res);
            store.dispatch('addCredentialUser', authUser);
            f7.tab.show('#view-home');
        } catch(error) {
            console.log(error.message);
        }
    }

    async function logInWithFacebook(e) {
        try {
            const provider = new FacebookAuthProvider();
                
            const res = await signInWithPopup(auth, provider);
            toast.current = f7.toast.create({ text: 'User logged in successfully!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
            toast.current.open();
            const authUser = getAnonymousUser(res);
            store.dispatch('addCredentialUser', authUser);
            f7.tab.show('#view-home');
        } catch(error) {
            console.log(error.message);
        }
    }

    async function logInWithGithub(e) {
        try {
            const provider = new GithubAuthProvider();
            
            const res = await signInWithPopup(auth, provider);
            toast.current = f7.toast.create({ text: 'User logged in successfully!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
            toast.current.open();
            const authUser = getAnonymousUser(res);
            store.dispatch('addCredentialUser', authUser);
            f7.tab.show('#view-home');
        } catch(error) {
            console.log(error.message);
        }
    }

    async function logInWithTwitter(e) {
        try {
            const provider = new TwitterAuthProvider();
            
            const res = await signInWithPopup(auth, provider);
            toast.current = f7.toast.create({ text: 'User logged in successfully!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
            toast.current.open();
            const authUser = getAnonymousUser(res);
            store.dispatch('addCredentialUser', authUser);
            f7.tab.show('#view-home');
        } catch(error) {
            console.log(error.message);
        }
    }

  function toSingUp() {
      f7.tab.show('#view-sign-up');
      //clear all fields
      setEmail('');
      setEmailIsValid(false);
      setPassword('');
      setPasswordIsValid(false);
      setBtnIsDisabled(true);
      setInvalidEmailOrPass(false);
  }

  return (
      <Page name='log-in' >
          <Navbar title='Log In' className='global-color'/>

          <div className='block margin-top mb-5 '></div>
          <div className='log-in-container'>
              <LoginScreenTitle className='global-color'>Log In Form</LoginScreenTitle>
              <img src={loginImage} className='log-in-logo-image lazy lazy-fade-in'/>


              <List strongIos outlineIos dividersIos form formStoreData id='log-in-form' >
                  <ListInput
                      onChange={emailHandler}
                      label='E-mail'
                      type='text'
                      placeholder='Your e-mail'
                      info='Enter email!'
                      validate
                      color='teal'
                      className='no-margin input-field'
                      value={email}
                      errorMessage='This email is invalid format!'
                      errorMessageForce={!setEmailIsValid ? true : false}
                      floatingLabel
                  />

                  <ListInput
                      onChange={passwordHandler}
                      label='Password'
                      name='password'
                      type='password'
                      placeholder='Your password'
                      color='teal'
                      validate
                      info='Enter at least 8 symbols!'
                      className='no-margin input-field'
                      value={password}
                      floatingLabel
                  />
              </List>

              {invalidEmailOrPass && <div className='flex-center-container margin-vertical'>
                  <span className='text-danger'>Invalid Email or Password</span>
              </div>}
              
              

              <Block strong className='log-in-btn-container'>
                  <Row className='flex-center-container'>
                      <Col width='50'>
                          <Button onClick={signInHandler} disabled={btnIsDisabled} fill raised color='teal'>Log In</Button>
                      </Col>
                  </Row>
              </Block>

              <div className='flex-center-container margin-vertical'>
                  <img src={forgottenPassword} className='forgot-password-image'/>
                  <Link href='/user/forgot-password/' className='forgot-password-link'>Forgot Password</Link>
              </div>

              <Block strong outlineIos className='other-login-container'>
                  <p className='my-0'>Or continue with</p>
                  <p className='col-10'>
                    <Button 
                        onClick={logInWithGithub}
                        onTouchStart={logInWithGithub}
                        raised 
                        color='black' 
                        className='other-account-btn-log-in'
                    >
                      <FaGithub color='black' size={16}/> &nbsp; Continue with Github
                    </Button>
                  </p>
                  <p className='col-10'>
                    <Button 
                        onClick={logInWithGoogle}
                        onTouchStart={logInWithGoogle}
                        raised 
                        color='black' 
                        className='other-account-btn-log-in'
                    >
                      <FaGoogle color='red' size={16}/> &nbsp; Continue with Google
                    </Button>
                  </p>
                  <p className='col-10'>
                    <Button 
                        onClick={logInWithFacebook}
                        onTouchStart={logInWithFacebook}
                        raised 
                        color='black' 
                        className='other-account-btn-log-in'
                    >
                      <FaFacebookF color='blue' size={16}/> &nbsp; Continue with Facebook
                    </Button>
                  </p>
                  <p className='col-10'>
                    <Button 
                        onClick={logInWithTwitter}
                        onTouchStart={logInWithTwitter}
                        raised 
                        color='black' 
                        className='other-account-btn-log-in'
                    >
                      <FaTwitter color='lightblue' size={16}/> &nbsp; Continue with Twitter
                    </Button>
                  </p>
              </Block>

              <div className='flex-center-container margin-vertical'>
                  <p>Don't have an account? <Link href='#' className='global-color' onClick={toSingUp}>Join now</Link></p>
              </div>

          </div>

      </Page>
  )
}

export default LogInPage;