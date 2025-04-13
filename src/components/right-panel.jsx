import React, { useRef, useState } from 'react';
import '../css/right-panel.css';
import { View, Page, Navbar, Link, List, ListItem, Panel, ListInput,
    useStore, Block, f7, Sheet, Toolbar, PageContent, Button, Toggle
} from 'framework7-react';

import { auth } from '../firebaseConfig';
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider, updateEmail, updatePassword } from 'firebase/auth';
import { removeUserFromDB, changeUserEmailToDB, updateUser, sendFeedback } from '../services/userServices';
import { uploadUserAvatarFileToStorage, uploadUserAvatarFromCameraToStorage } from '../services/userStorage';

import store from '../js/store';
import { urlPattern, imagePattern } from '../services/variable';
import { GetCurrentDate } from '../services/DateFormat';

import { MdClose } from "react-icons/md";
import { AiFillSetting } from "react-icons/ai";
import { RiMailSettingsLine } from "react-icons/ri";
import { GrUserSettings } from "react-icons/gr";
import { MdDinnerDining } from "react-icons/md";
import { TbSunMoon } from "react-icons/tb";
import { VscFeedback } from "react-icons/vsc";
import { FiLogOut } from "react-icons/fi";
import { MdDeleteForever } from "react-icons/md";
import { LiaUserLockSolid } from "react-icons/lia";
import { ImCamera } from "react-icons/im";
import { MdAdminPanelSettings } from "react-icons/md";
import { FaUtensils } from "react-icons/fa6";

function RightPanel(props) {
    //change email
    const [sheetOpened2, setSheetOpened2] = useState(false);
    const [passwordForChangeEmail, setPasswordForChangeEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    //change password
    const [sheetOpened3, setSheetOpened3] = useState(false);
    const [newPasswordChange, setNewPasswordChange] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    //change avatar
    const [sheetOpened4, setSheetOpened4] = useState(false);
    const [urlAvatar, setUrlAvatar] = useState('');
    const [validUrl, setValidUrl] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [isValidAvatarFile, setValidAvatarFile] = useState(false);
    //Feedback
    const [sheetOpened5, setSheetOpened5] = useState(false);
    const [feedbackTextArea, setFeedbackTextArea] = useState('');
    const [isValidFeedback, setIsValidFeedback] = useState(false);
    const [isdisabledFeedbackBtn, setIsDisabledFeedbackBtn] = useState(true);

    //delete user account
    const [requirePasswordForDeleteUser, setRequirePasswordForDeleteUser] = useState('');
    const [sheetOpened, setSheetOpened] = useState(false);
    
    const toast = useRef(null);
    //const sheet = useRef(null);
    let user = useStore('authUser');
    const isAdmin = useStore('userIsAdmin');
    const isAuth = useStore('userIsAuth');
    //Change Email
    function newEmailHandler(e) { setNewEmail(e.target.value); }
    function requirePasswordForChangeEmailHandler(e) { setPasswordForChangeEmail(e.target.value); }
    async function changeEmail(e) {
        e.preventDefault();

        if(newEmail != '' && passwordForChangeEmail != '') {
            try {
                f7.preloader.show();
                const currUser = auth.currentUser;
                const credential = EmailAuthProvider.credential(user.email, passwordForChangeEmail);
     
                await reauthenticateWithCredential(currUser, credential);
                //update email authentication
                await updateEmail(currUser, newEmail);
                //update email in RealTime DB
                await changeUserEmailToDB(user, newEmail);

                //възможно е да направя заявка за новите данни!!! дасе провери
                store.dispatch('changeUserEmail', newEmail);
                toast.current = f7.toast.create({ text: 'Update email is successfully!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
                toast.current.open();
                f7.tab.show('#view-home');
                f7.preloader.hide();
            } catch(error) {
                toast.current = f7.toast.create({ text: 'Error: Invalid Operation!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                toast.current.open();
                f7.preloader.hide();
                console.log(error.message)
            }
        } else {
            toast.current = f7.toast.create({ text: 'Email or password is empty!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
            toast.current.open();
        }
    }

    //Change Password
    function newPasswordHandler(e) { setNewPasswordChange(e.target.value); }
    function oldPasswordHandler(e) { setOldPassword(e.target.value); }
    async function changePassword(e) {
        e.preventDefault();

        if(newPasswordChange != '' && oldPassword != '') {
            try {
                f7.preloader.show();
                const currUser = auth.currentUser;
                const credential = EmailAuthProvider.credential(user.email, oldPassword);
                
                await reauthenticateWithCredential(currUser, credential);
                //update email authentication
                await updatePassword(currUser, newPasswordChange);
                toast.current = f7.toast.create({ text: 'Update password is successfully!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
                toast.current.open();
                f7.tab.show('#view-home');
                f7.preloader.hide();
            } catch(error) {
                toast.current = f7.toast.create({ text: 'Error: Invalid Operation!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                toast.current.open();
                f7.preloader.hide();
                console.log(error.message)
            }
        } else {
            toast.current = f7.toast.create({ text: 'New or old password is empty!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
            toast.current.open();
        }
    }

    //Change Avatar
    function validUrlHandler(e) { 
        setUrlAvatar(e.target.value); 
        e.target.value.match(urlPattern) ? setValidUrl(false) : setValidUrl(true);
    }

    async function changeAvatarSubmit(e) {
        if(!validUrl) {
            try {
                f7.preloader.show();
                const updateCurrentUser = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roles: user.roles,
                    accessToken: user.accessToken,
                    userUID: user.userUID,
                    avatar: urlAvatar,
                    recipes: user.recipes || [],
                    gender: user.gender
                };

                await updateUser(updateCurrentUser);
                toast.current = f7.toast.create({ text: 'Your avatar is change successfully!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
                toast.current.open();
                store.dispatch('updateUserAvatar', updateCurrentUser);
                setValidUrl(false);
                setUrlAvatar('');
                f7.preloader.hide();
            } catch(error) {
                console.log(error.message);
            }
        }
    }

    function getAvatarFromFileHandler(e) {
        setAvatarFile(e.target.files[0]);
        e.target.files[0].name.match(imagePattern) ? setValidAvatarFile(false) : setValidAvatarFile(true);
    }

    async function uploadAvatarFileSubmit(e) {
        if(!isValidAvatarFile && avatarFile != null) {
            try {
                f7.preloader.show();
                const url = await uploadUserAvatarFileToStorage(avatarFile);

                const updateCurrentUser = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roles: user.roles,
                    accessToken: user.accessToken,
                    userUID: user.userUID,
                    avatar: url[0],
                    recipes: user.recipes || [],
                    gender: user.gender
                };

                await updateUser(updateCurrentUser);
                toast.current = f7.toast.create({ text: 'Your avatar is change successfully!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
                toast.current.open();
               
                await store.dispatch('updateUserAvatar', updateCurrentUser);
                setAvatarFile(null);
                setValidAvatarFile(false);
                f7.preloader.hide();
            } catch(error) {
                console.log(error.message);
                f7.preloader.hide();
            }
        } else {
            toast.current = f7.toast.create({ text: 'Not choose file!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
            toast.current.open();
        }
    }

    async function uploadAvatarFileFromCameraSubmit(e) {
            const options =  {
                quality: 80,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA,
                encodingType: Camera.EncodingType.JPEG,
                mediaType: Camera.MediaType.PICTURE,
                cameraDirection: Camera.Direction.BACK,
                targetWidth: 300,
                targetHeight: 400
            };

            navigator.camera.getPicture(onSuccess, onError, options);

            async function onSuccess(imageData) {
                try {
                    const response = await fetch(`data:image/jpeg;base64,${imageData}`);
                    const blob = await response.blob();
                    const url = await uploadUserAvatarFromCameraToStorage(blob, user.userUID);
                    const updateCurrentUser = {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        roles: user.roles,
                        accessToken: user.accessToken,
                        userUID: user.userUID,
                        avatar: url[0],
                        recipes: user.recipes || [],
                        gender: user.gender
                    };
                    await updateUser(updateCurrentUser);
                    toast.current = f7.toast.create({ text: 'Your avatar is change successfully!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
                    toast.current.open();
                    await store.dispatch('updateUserAvatar', updateCurrentUser);

                } catch(error) {
                    console.log(error)
                }
            }

            function onError(message) {
                toast.current = f7.toast.create({ text: `${message}`, position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                toast.current.open();
            }
    }

    function onMyRecipesLink(e) {
        f7.views.main.router.navigate('/user/my-recipes/');
        f7.panel.close("right");
    }

    function adminSettingsHandler(e) {
        f7.views.main.router.navigate('/user/admin-settings/');
        f7.panel.close("right");
    }

    //Feedback
    function feedbackHandler(e) {
        setFeedbackTextArea(e.target.value);
        e.target.value.length >= 10 ? setIsValidFeedback(true) : setIsValidFeedback(false);
        feedbackTextArea.length >= 10 ? setIsDisabledFeedbackBtn(false) : setIsDisabledFeedbackBtn(true);
    }

    async function feedbackSubmit(e) {
        if(isValidFeedback && feedbackTextArea != '') {
            try {
                f7.preloader.show();
                const newFeedback = {
                    sender: user.email,
                    content: feedbackTextArea,
                    date: GetCurrentDate(new Date()),
                }

                const success = await sendFeedback(newFeedback);
                if(success == 'Success') {
                    toast.current = f7.toast.create({ text: 'Send feedback successfully!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
                    toast.current.open();


                    setFeedbackTextArea('');


                } else {
                    toast.current = f7.toast.create({ text: 'Send feedback failed!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                    toast.current.open();
                }

                f7.preloader.hide();
            } catch(error) {
                console.log(error.message);
            }
        } 
    }
  
    //Log Out
    // function logOutHandler(e) {
      
    // }

    //Delete User Account
    function requirePasswordForDeleteUserHandler(e) { setRequirePasswordForDeleteUser(e.target.value); }

    function deleteUserAccount(e) {
        try {
            if(requirePasswordForDeleteUser != '') {
                f7.preloader.show();
                const currentUser = auth.currentUser;
                const credential = EmailAuthProvider.credential(user.email, requirePasswordForDeleteUser);
                //reauthentication
                reauthenticateWithCredential(currentUser, credential)
                    .then(async () => {
                        await signOut(auth);
                        await removeUserFromDB(user.id);
                        await deleteUser(currentUser);
                        toast.current = f7.toast.create({ text: 'User delete in successfully!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
                        toast.current.open();
                        f7.tab.show('#view-home');
                        f7.preloader.hide();
                }).catch(error => {
                    toast.current = f7.toast.create({ text: 'Invalid email or password!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                    toast.current.open();
                    console.log(error.message);
                    f7.preloader.hide();
                });
                
            } else {
                toast.current = f7.toast.create({ text: 'Password field is empty!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                toast.current.open();
            }
        } catch(error) {
            console.log(error.message)
        }
    }

    return (
        <Panel right reveal>
            <View>
                <Page >
                    <Navbar title="User Panel">
                        <div className='left'><AiFillSetting size={24} className='global-color'/></div>
                        <div className='right'>
                            <Link panelClose className='link-without-underline' color='gray' ><MdClose /></Link>
                        </div>
                    </Navbar>
                    <div className='flex-center-container mt-3'>
                        {user.avatar && <img slot='media' src={user.avatar} className='lazy lazy-fade-in right-panel-user-avatar'/>}
                    </div>
                    {user.username && <div className='text-center mt-3'>Hello, {user.gender == 'Male' ? 'Mr.' : 'Miss'} <span className='fw-bold global-color'>{user.username}</span></div>}
                    {user.email && <div className='text-center'>Your email: <span className='fw-bold global-color'>{user.email}</span></div>}
                    {isAdmin && <div className='text-center admin-color fw-bold'>Your have admin rights!</div>}
                    <Block  className='mb-0' style={{ fontSize: '14px' }}>User settings content goes here...</Block>
                   
                    <List simpleList outlineIos strong>
                        {isAdmin && <ListItem onClick={e => adminSettingsHandler(e)} link="#" className='right-panel-user-link' >
                            <MdAdminPanelSettings size={22} className='admin-color'/> <span className='admin-color'>Settings</span>
                        </ListItem>}
                        <ListItem link="#" className='right-panel-user-link' onClick={e => setSheetOpened2(true) }>
                            <RiMailSettingsLine size={22} className='global-color'/> <span>Change Email</span>
                        </ListItem>
                        <ListItem link="#" className='right-panel-user-link' onClick={e => setSheetOpened3(true) }>
                            <LiaUserLockSolid size={22} className='global-color'/> <span>Change Password</span>
                        </ListItem>
                        <ListItem link="#" className='right-panel-user-link' onClick={e => setSheetOpened4(true) }>
                            <GrUserSettings size={22} className='global-color'/> <span>Change Avatar</span>
                        </ListItem>
                        <ListItem onClick={e => onMyRecipesLink(e)} className='right-panel-user-link' panelClose>
                            <FaUtensils size={22} className='global-color'/><span>My Recipes</span>
                        </ListItem>
                        <ListItem sheetClose link="#" className='right-panel-user-link'>
                            <TbSunMoon size={22} className='global-color'/>
                            <Toggle sheetClose slot="after" color='white' onChange={props.changeDarkMode} />
                            <span>Dark Mode</span>
                        </ListItem>

                        <ListItem link="#" className='right-panel-user-link' onClick={e => setSheetOpened5(true) }>
                            <VscFeedback size={22} className='global-color'/>
                            <span>Feedback</span>
                        </ListItem>
                        <ListItem onClick={props.logOutHandler} onTouchStart={props.logOutHandler} link="#" className='right-panel-user-link'>
                            <FiLogOut size={22}  className='second-color'/>
                            <Link link="#" panelClose="right" className='log-out-link second-color'>Log Out</Link>
                        </ListItem>
                        <ListItem link="#"  className='text-color-red right-panel-user-link' onClick={e => setSheetOpened(true) }>
                            <MdDeleteForever size={22} className='golor-red'/>
                            <span >Delete Account</span>
                        </ListItem>
                    </List>
                </Page>

                  {/* Change Email */}
                  <Sheet opened={sheetOpened2} onSheetClosed={() => { setSheetOpened2(false); }}>
                    <Toolbar>
                        <div className="left"></div>
                        <div className="right"><Link sheetClose color='gray' >Close</Link></div>
                    </Toolbar>
   
                    <PageContent className='change-email-container'>
                        <div className='text-center'>Requires re-identification of your email {user.email}!</div>
                        <div className='flex-center-container'>
                            <div className='form-container'>
                                <List strongIos dividersIos insetIos className='form-list'>
                                    <ListInput onChange={e => newEmailHandler(e)} color='black' type="email" placeholder="Your new email" clearButton />
                                    <ListInput onChange={e => requirePasswordForChangeEmailHandler(e)} color='black' type="password" placeholder="require your password" clearButton />
                                    <Button 
                                        onClick={changeEmail}
                                        onTouchStart={changeEmail}
                                        on fill raised color='black'
                                        panelClose="right"
                                        sheetClose
                                        className='color-white'
                                    >
                                        change your email
                                    </Button>
                                </List>
                            </div>
                        </div>
                    </PageContent>
                </Sheet>

                  {/* Change Password */}
                  <Sheet opened={sheetOpened3} onSheetClosed={() => { setSheetOpened3(false); }}>
                    <Toolbar>
                        <div className="left"></div>
                        <div className="right"><Link sheetClose color='gray' >Close</Link></div>
                    </Toolbar>
   
                    <PageContent className='change-email-container'>
                        <div className='text-center'>Requires new and old password!</div>
                        <div className='flex-center-container'>
                            <div className='form-container'>
                                <List strongIos dividersIos insetIos className='form-list'>
                                    <ListInput onChange={e => newPasswordHandler(e)} color='black' type="password" placeholder="Your new password" clearButton />
                                    <ListInput onChange={e => oldPasswordHandler(e)} color='black' type="password" placeholder="your old password" clearButton />
                                    <Button 
                                        onClick={changePassword}
                                        onTouchStart={changePassword}
                                        on fill raised color='black'
                                        panelClose="right"
                                        sheetClose
                                        className='color-white'
                                    >
                                        change your password
                                    </Button>
                                </List>
                            </div>
                        </div>
                    </PageContent>
                </Sheet>

                 {/* Change Avatar */}
                 <Sheet opened={sheetOpened4} onSheetClosed={() => { setSheetOpened4(false); }}>
                    <Toolbar>
                        <div className="left"></div>
                        <div className="right"><Link sheetClose color='gray' >Close</Link></div>
                    </Toolbar>
   
                    <PageContent className='change-email-container'>
                        
                        <div className='flex-around-container'>
                            <div className='form-column-container'>
                                <div className='text-center'>Requires valid url!</div>
                                <List strongIos dividersIos insetIos className='form-list'>
                                    <ListInput 
                                        onChange={validUrlHandler}
                                        label='URL' 
                                        name='url' 
                                        type='url' 
                                        placeholder='User Avatar' 
                                        color='teal'
                                        validate
                                        info='Enter valid url!'
                                        value={urlAvatar}
                                        className='input-field no-margin'
                                        errorMessage='This url is invalid!'
                                        errorMessageForce={validUrl ? true : false}
                                        clearButton
                                    >
                                    </ListInput>
                                    <Button 
                                        onClick={changeAvatarSubmit}
                                        onTouchStart={changeAvatarSubmit}
                                        on fill raised color='black'
                                        disabled={validUrl}
                                        className='color-white'
                                    >
                                        change avatar
                                    </Button>
                                </List>
                            </div>

                            <div className='form-column-container'>
                                <div className='text-center'>Require valid image file!</div>
                                <List strongIos dividersIos insetIos className='form-list'>
                                    <ListInput 
                                        onChange={getAvatarFromFileHandler}
                                        label='Avatar' 
                                        name='avatar' 
                                        type='file' 
                                        placeholder='Choose file' 
                                        color='teal'
                                        validate
                                        info='Enter valid image format, png, jpg, jpeg, gif, svg!'
                                        value={avatarFile}
                                        className='input-field no-margin'
                                        errorMessage='This url is invalid!'
                                        errorMessageForce={isValidAvatarFile ? true : false}
                                        clearButton
                                    >
                                    </ListInput>
                                    <Button 
                                        onClick={uploadAvatarFileSubmit}
                                        onTouchStart={uploadAvatarFileSubmit}
                                        on fill raised color='black'
                                        disabled={isValidAvatarFile}
                                        className='color-white'
                                    >
                                        Upload File
                                    </Button>
                                </List>
                            </div>

                            <div className='form-column-camera-container'>
                                <div className='text-center'>Image from Camera!</div>
                                <List strongIos dividersIos insetIos className='form-list'>
                                    
                                    <Button 
                                        onClick={uploadAvatarFileFromCameraSubmit}
                                        onTouchStart={uploadAvatarFileFromCameraSubmit}
                                    >
                                        <ImCamera color='black' size={40} className='avatar-user-camera-btn'/>
                                    </Button>

                                </List>
                            </div>
                        </div>
                    </PageContent>
                </Sheet>

                {/* Feedback */}
                <Sheet opened={sheetOpened5} onSheetClosed={() => { setSheetOpened5(false); }}>
                    <Toolbar>
                        <div className="left"></div>
                        <div className="right"><Link sheetClose color='gray' >Close</Link></div>
                    </Toolbar>
   
                    <PageContent className='feedback-main-container re-authtentification-container'>
                        <div className='flex-center-container'>
                            <div className='form-container'>
                                <List strongIos dividersIos insetIos className='form-list' style={{ marginTop: '0px !important' }}>
                                    <ListInput 
                                        label="Feedback" 
                                        type="textarea" 
                                        placeholder="Feedback here..."
                                        onChange={feedbackHandler} 
                                        value={feedbackTextArea} 
                                        color='teal'
                                        className='feedback-textarea'
                                        clearButton
                                        errorMessage='Enter at least 10 symbols!'
                                        errorMessageForce={!isValidFeedback ? true : false}
                                    ></ListInput>
                                    <Button 
                                        onClick={feedbackSubmit}
                                        onTouchStart={feedbackSubmit}
                                        on fill raised color='black'
                                        panelClose="right"
                                        sheetClose
                                        disabled={isdisabledFeedbackBtn}
                                        className='color-white'
                                    >
                                        feedback
                                    </Button>
                                </List>
                            </div>
                        </div>
                    </PageContent>
                </Sheet>

                {/* Delete User Account */}
                <Sheet opened={sheetOpened} onSheetClosed={() => { setSheetOpened(false); }}>
                    <Toolbar>
                        <div className="left"></div>
                        <div className="right"><Link sheetClose color='gray' >Close</Link></div>
                    </Toolbar>
   
                    <PageContent className='re-authtentification-container'>
                        <div className='text-center'>Requires re-identification of your email {user.email}!</div>
                        <div className='flex-center-container'>
                            <div className='form-container'>
                                <List strongIos dividersIos insetIos className='form-list'>
                                    <ListInput onChange={e => requirePasswordForDeleteUserHandler(e)} color='black' type="password" placeholder="Your password" clearButton />
                                    <Button 
                                        onClick={deleteUserAccount}
                                        onTouchStart={deleteUserAccount}
                                        on fill raised color='black'
                                        panelClose="right"
                                        sheetClose
                                    >
                                        Validation Password
                                    </Button>
                                </List>
                            </div>
                        </div>
                    </PageContent>
                </Sheet>

            </View>
        </Panel>
    )
}

export default RightPanel;