import React, { useState, useEffect, useRef } from 'react';

import '../css/signUp.css';
import store from '../js/store';

import { Page, Navbar, List, ListItem, ListInput, LoginScreenTitle, Row, Button, Block, Col, f7, Icon, Checkbox, Toggle, Link, useStore } from 'framework7-react';

import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

import { usernamePattern, emailPattern, passwordPattern } from '../services/variable';
import { getAllUsers, signUpUser, getAuthUserFromRealtimeDB } from '../services/userServices';

import signUp from '../public/Sign-Up.png';

function SignUpPage() {
  //user check is used before register
  const [availableUsers, setAvailableUsers] = useState([]);
  const [userIsUsed, setUserIsUsed] = useState(false);
  const [emailIsUsed, setEmailIsUsed] = useState(false);

  //fields
  const [username, setUsername] = useState('');
  const [isValidUsername, setIsValidUsername] = useState(false);

  const [email, setEmail] = useState('');
  const [isValidateEmail, setIsValidateEmail] = useState(false);

  const [password, setPassword] = useState('');
  const [isValidatePassword, setIsValidatePassword] = useState(false);
  const [showPassword, setShowPasword] = useState(false);

  const [repeatPassword, setRepeatPassword] = useState('');
  const [isValidateRepeatPassword, setIsValidateRepeatPassword] = useState(false);

  const [gender, setGender] = useState('Male');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [createAccountBrnIsDisabled, setCreateAccountBrnIsDisabled] = useState(true);
  const toast = useRef(null);
  const isDarkMode = useStore('themeIsDark');

  useEffect(() => {
      if(availableUsers.length === 0) {
          getAllUsers().then((data) => {
            setAvailableUsers(data);
          }).catch(error => console.log(error.message));
      }

      if(isValidUsername && isValidateEmail && isValidatePassword && isValidateRepeatPassword 
        && gender && agreeTerms && userIsUsed == false && emailIsUsed == false) 
        setCreateAccountBrnIsDisabled(false);
      else 
        setCreateAccountBrnIsDisabled(true);
  }, [availableUsers, isValidUsername, isValidateEmail, isValidatePassword, isValidateRepeatPassword, gender, agreeTerms, userIsUsed, emailIsUsed]);


  function usernameHandler(e) {
    setUsername(e.target.value);

    if(availableUsers.find(u => u.username === e.target.value)) {
      setUserIsUsed(true);
    } else {
      setUserIsUsed(false);
      e.target.value.match(usernamePattern) ? setIsValidUsername(true) : setIsValidUsername(false);
    }
  }

  function emailHandler(e) {
    setEmail(e.target.value);

    if(availableUsers.find(u => u.email == e.target.value)) {
      setEmailIsUsed(true);
    } else {
      setEmailIsUsed(false);
      e.target.value.match(emailPattern) ? setIsValidateEmail(true) : setIsValidateEmail(false);
    }
  }

  function passwordHandler(e) {
    setPassword(e.target.value);
    e.target.value.match(passwordPattern) ? setIsValidatePassword(true) : setIsValidatePassword(false);
  }

  function repeatPasswordHandler(e) {
    setRepeatPassword(e.target.value);
    e.target.value === password ? setIsValidateRepeatPassword(true) : setIsValidateRepeatPassword(false);
  }

  function genderHandler(e) { setGender(e.target.value); }
  function agreeTermsHandler(e){ setAgreeTerms(!agreeTerms); }

  async function signUpHandler(e) {
      e.preventDefault();

      try {
          if(isValidUsername && isValidateEmail && isValidatePassword && isValidateRepeatPassword 
            && gender && agreeTerms && userIsUsed == false && emailIsUsed == false) {
              f7.preloader.show();
              const credential = await createUserWithEmailAndPassword(auth, email, password);

              if(credential.user && credential.user.accessToken) {
                  let newUser = {
                      username: username,
                      email: email,
                      roles: ['User'],
                      accessToken: credential.user.accessToken,
                      userUID: credential.user.uid,
                      avatar: 'https://firebasestorage.googleapis.com/v0/b/signin-autumn.appspot.com/o/avatars%2Favatar-anonymous.png?alt=media&token=25565dda-5768-443d-b761-ed68e13ab212',
                      recipes: [], 
                      gender: gender
                  };

                  const success = await signUpUser(newUser);
                  if(success == "Success") {
                    const currentUser = await getAuthUserFromRealtimeDB(newUser.userUID);
                    toast.current = f7.toast.create({ text: 'You have registered successfully!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
                    toast.current.open();
                    const mergeUser = Object.assign({}, currentUser, newUser);
                    
                    f7.tab.show('#view-home');
                    //clear all fields
                    setAvailableUsers([]);
                    setUserIsUsed(false);
                    setEmailIsUsed(false); 
                    setUsername('');
                    setIsValidUsername(false);
                    setEmail('');
                    setIsValidateEmail(false);
                    setPassword('');
                    setIsValidatePassword(false);
                    setShowPasword(false);
                    setRepeatPassword('');
                    setIsValidateRepeatPassword(false);
                    setGender('Male');
                    setAgreeTerms(false);
                    setCreateAccountBrnIsDisabled(true);
                    await store.dispatch('addCredentialUser', mergeUser);
                  } else {
                    toast.current = f7.toast.create({ text: 'Your sign up is failed!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                    toast.current.open();
                  }

              }

              f7.preloader.hide();
          }
      } catch(error) {
        console.log(error);
        f7.preloader.hide();
      }
  }

  function showHideTouchPasswords(e) {
      const inputPassword = document.getElementsByName('password')[0];
      const inputRepeatPassword = document.getElementsByName('repeatpassword')[0];

      if(inputPassword != null && inputRepeatPassword != null) {
          if(!showPassword) {
            inputPassword.type = 'text';
            inputRepeatPassword.type = 'text';
          } else {
            inputPassword.type = 'password';
            inputRepeatPassword.type = 'password';
          }

          setShowPasword(!showPassword);
      }
  }

  function toLogIn() {
      f7.tab.show('#view-log-in');
      //clear all fields
      setUsername('');
      setIsValidUsername(false);
      setEmail('');
      setIsValidateEmail(false);
      setPassword('');
      setIsValidatePassword(false);
      setShowPasword(false);
      setRepeatPassword('');
      setIsValidateRepeatPassword(false);
      setGender('Male');
  }



  return (
      <Page name='sign-up'>
          <Navbar title='Sign Up' className={`${isDarkMode ? 'text-color-white' : 'global-color'}`} />

          <div className='block margin-top mb-5 '></div>
          <LoginScreenTitle className={`margin-top ${isDarkMode ? 'text-color-white' : 'global-color'}`}>Sign Up Form</LoginScreenTitle>
          <img src={signUp} className='sign-up-logo-image lazy lazy-fade-in'/>

          <List strongIos outlineIos dividersIos form formStoreData id='sign-up-form'>
              <ListInput 
                  onChange={usernameHandler}
                  label='Username' 
                  name='username' 
                  type='text' 
                  placeholder='Your username' 
                  color='blue'
                  validate
                  info='Enter at least 2 characters!'
                  value={username}
                  className='no-margin input-field'
                  errorMessage='This username is used!'
                  errorMessageForce={userIsUsed ? true : false}
              >
                  {isValidUsername && !userIsUsed && <Icon icon='checkmark' material='checkmark' f7='checkmark' slot='media' color='blue' className='check-validate-input'/>}
              </ListInput>

              <ListInput
                  onChange={emailHandler}
                  label='E-mail'
                  type='text'
                  placeholder='Your e-mail'
                  info='Enter valid email!'
                  validate
                  color='blue'
                  className='no-margin input-field'
                  value={email}
                  errorMessage='This email is used!'
                  errorMessageForce={emailIsUsed ? true : false}
              >
                  {isValidateEmail && !emailIsUsed && <Icon icon='checkmark' material='checkmark' f7='checkmark' slot='media' color='blue' className='check-validate-input'/>}
              </ListInput>

              <ListInput
                  onChange={passwordHandler}
                  label='Password'
                  name='password'
                  type='password'
                  placeholder='Your password'
                  color='blue'
                  validate
                  info='Enter at least 8 symbols!'
                  className='no-margin input-field'
                  value={password}
              >
                  {isValidatePassword && <Icon icon='checkmark' material='checkmark' f7='checkmark' slot='media' color='blue' className='check-validate-input'/>}
              </ListInput>
                    
              <ListInput
                  onChange={repeatPasswordHandler}
                  label='Repeat Password'
                  name='repeatpassword'
                  type='password'
                  placeholder='Repeat your password'
                  color='blue'
                  info='Enter same password!'
                  className='no-margin input-field'
                  value={repeatPassword}
              >
                  {isValidateRepeatPassword && <Icon icon='checkmark' material='checkmark' f7='checkmark' slot='media' color='blue' className='check-validate-input'/>}
              </ListInput>

              <ListItem className={`${isDarkMode ? 'background-color-white' : 'background-color-blue'}`}>
                  <div className='show-hide-password-container'>

                      <span className='global-color text-align-center'>Show / hide passwords</span>

                      {showPassword 
                          ? <Icon icon='eye' material='eye' f7='eye' color='blue' className='show-password-icon'/> 
                          : <Icon icon='eye_slash' material='eye_slash' f7='eye_slash' color='blue' className='show-password-icon'/>
                      }

                      <Toggle  onChange={showHideTouchPasswords} onTouchStart={showHideTouchPasswords} className='no-fastclick' defaultChecked color='blue' />
                  </div>
              </ListItem>
                   
              <ListInput onChange={genderHandler} label='Gender' type='select' name='gender' placeholder='Please choose...' color='blue' className='sign-up-select-gender'>
                  <option value='Male' >Male</option>
                  <option value='Female'>Female</option>
              </ListInput>
                  
              <Block className='display-flex justify-content-center align-content-center align-items-center'>
                  <Checkbox checked={agreeTerms} onChange={agreeTermsHandler}  name='checkbox-1' color='blue' className='margin-right'></Checkbox>
                  <span className={`${isDarkMode ? 'color-white' : 'color-black'}`}> I have read and agree to the terms!</span>
              </Block>
          </List>

          <Block strong className={`${isDarkMode ? 'background-color-white' : 'background-color-blue'}`}>
              <Row className='flex-center-container'>
                  <Col width='50'>
                      <Button onClick={signUpHandler} onTouchStart={signUpHandler} disabled={createAccountBrnIsDisabled} fill raised color='blue'>
                        <span className='color-white'>Create Accaunt</span>
                      </Button>
                  </Col>
              </Row>
          </Block>

          <div className='flex-center-container margin-vertical'>
              <p>Already have an account? <Link href='#' className='global-color' onClick={toLogIn}>Log In</Link></p>
          </div>
          
    </Page>
  )
}

export default SignUpPage;

