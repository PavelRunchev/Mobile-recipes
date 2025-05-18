import React, { useState, useEffect, useRef } from 'react';
import '../css/recipeDetails.css';

import { Dom7 }  from 'framework7/lite-bundle';
import { Page, Navbar, BlockTitle, useStore, List, ListItem, AccordionContent, Block, Icon, 
    Card, CardContent, CardHeader, Button, Toggle, Actions, ActionsGroup, ActionsLabel, f7, Stepper,
    Messages,MessagesTitle, Messagebar, Link, MessagebarAttachments, MessagebarAttachment,
    MessagebarSheet, MessagebarSheetImage, f7ready, ListInput, Row, Col
} from 'framework7-react';

import { onValue, ref, set, get, remove, push } from "firebase/database" ;
import { database } from '../firebaseConfig';

import store from '../js/store';
import { updateRecipeInDB, getCreatorRecipe, removeRecipeFromDB, getImagesCommentUrl } from '../services/recipeService';
import { checkCurrentImageInUsedToStorage, setRecipeImageToStorage, removeImageFromStorage, uploadRecipeImageFromCameraToStorage } from '../services/recipeStorage';
import { setUserRatingToDB } from '../services/userServices';
import RecipeImagesPage from '../components/recipeImages';
import { imagePattern } from '../services/variable';
import { GetRandomString } from '../services/generateRandomString';
import { days, months, sortAllCommentsByCreateDateInDescending } from '../services/DateFormat';
import CommentModel from '../components/commentModel';

import MovieCLip from '../components/movieClip';

//react icons
import { FaUtensils } from 'react-icons/fa6';
import { BiSolidCategory } from 'react-icons/bi';
import { FaConciergeBell } from 'react-icons/fa';
import { MdPersonAddAlt1 } from "react-icons/md";
import { MdMoreTime } from "react-icons/md";
import { GrEdit } from "react-icons/gr";
import { BsStarHalf } from "react-icons/bs";
import { BsStar } from "react-icons/bs";
import { BsStarFill } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { IoMdRemoveCircle } from "react-icons/io";
import { FaBook } from "react-icons/fa6";
import { MdOutlineTimer } from "react-icons/md";
import { ImCamera } from "react-icons/im";
import { MdCloudUpload } from "react-icons/md";
import { TfiComments } from "react-icons/tfi";

function RecipeDetailsPage({ f7route, f7router }) {
    const [currentRecipe, setCurrentRecipe] = useState({});
    const [rating, setRating] = useState(0);
    const [creator, setCreator] = useState('');
    const [sharingRecipe, setSharingRecipe] = useState(false);

    //Recipe images
    const [recipeImage, setRecipeImage] = useState(null);
    const [validRecipeImage, setValidRecipeImage] = useState(false);

    const [removeForm, setRemoveForm] = useState(false);

    //start message
    const [isShowComments, setIsShowComments] = useState(false);
    const [commentText, setComment] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [sheetVisible, setSheetVisible] = useState(true);
    const [images, setImages] = useState([]);
    const [dateComment, setDataComment] = useState(new Date());
  
    const messagebar = useRef(null);
    const attachmentsVisible = () => attachments.length > 0 ? true : false;
    //end message

    //get current recipe id
    const currentId = f7route.params.id.substring(1);

    const toast = useRef(null);
    let user = useStore('authUser');
    let recipes = useStore('getAllRecipes');
    const isAdmin = useStore('userIsAdmin');
    const isAuth = useStore('userIsAuth');
    const isDarkMode = useStore('themeIsDark');
    let $$ = Dom7;

    let instructionRecipeArray = '';
    if(currentRecipe.instructions != null)
        instructionRecipeArray = currentRecipe.instructions.split('\n');

    useEffect(() => {
        f7ready(() => {

            if(currentId != undefined && recipes != undefined && recipes.length > 0) {
                let getCurrentRecipe = recipes.find(el => el.id == currentId);

                if(!getCurrentRecipe.hasOwnProperty('comments')) {
                    getCurrentRecipe.comments = [];
                }

                getCurrentRecipe.comments = sortAllCommentsByCreateDateInDescending(getCurrentRecipe.comments);
                store.dispatch('setCurrentRecipe', getCurrentRecipe);
                setCurrentRecipe(getCurrentRecipe);
                setRating(getCurrentRecipe.rating);
                setSharingRecipe(getCurrentRecipe.sharing);
                getCreatorRecipe(getCurrentRecipe.creatorUID).then((creator) => setCreator(creator));
            }

            messagebar.current = f7.messagebar.get('.messagebar');

            //get all coment image url from Storage!
            getImagesCommentUrl().then((data) => setImages(data));  
            
            const commentsRef = ref(database, `/recipes/${currentId}/comments`);

            if(currentId != undefined && currentRecipe.hasOwnProperty('comments')) {
                //auto get comments after update
                
    
                onValue(commentsRef, (snapshot) => {
                    const data = snapshot.val();
    
                    let getCurrentRecipe = currentRecipe;
                    getCurrentRecipe.comments = data;
                    console.log(getCurrentRecipe, getCurrentRecipe.comments);
                    store.dispatch('updateRecipe', getCurrentRecipe);
                    setCurrentRecipe(getCurrentRecipe);
                });
            }
        });
    }, [currentRecipe]);

    function recipeUpdateHandler() { 
        f7.views.main.router.navigate(`/recipe/recipe-update/:${currentId}/`); 
        f7.tab.show('#view-home');
    }

    function likeHandler(e) {
        const currentValue = rating + 1;
        setYourRating(currentValue);
    }

    function dislikeHandler(e) {
        const currentValue = rating - 1;
        setYourRating(currentValue);
    }

    async function setYourRating(value) {
        f7.preloader.show();
        try {
            if(currentRecipe != undefined) {
                if(user.likes && user.likes.includes(currentRecipe.id)) {
                    toast.current = f7.toast.create({ text: 'You gave your rating!', position: 'top', cssClass: 'text-primary', closeTimeout: 4000 });
                    toast.current.open();
                    f7.preloader.hide();
                    return;
                }
    
                let updateRecipe = currentRecipe;
                updateRecipe.rating = value;
    
                let currentUser = user;
                if(!currentUser.hasOwnProperty('likes')) 
                    currentUser.likes = [];
                currentUser.likes.push(updateRecipe.id);
    
                await updateRecipeInDB(updateRecipe);
                await setUserRatingToDB(currentUser);

                toast.current = f7.toast.create({ text: 'You gave your rating successfuly!', position: 'top', cssClass: 'text-primary', closeTimeout: 4000 });
                toast.current.open();

                store.dispatch('setCurrentRecipe', updateRecipe);
                setRating(value);     
            }
        } catch(error) {
            console.log(error.message);
        }
        f7.preloader.hide();
    }

    async function sharedHandler(e) {
        f7.preloader.show();
        try {
            if(currentRecipe != undefined) {
                if(user.userUID == currentRecipe.creatorUID || isAdmin) {
                    let updateRecipe = currentRecipe;
                    updateRecipe.sharing = !e.target.checked;
                    setSharingRecipe(!e.target.checked);
    
                    await updateRecipeInDB(updateRecipe);
                    const sharedText = currentRecipe.sharing ? 'Recipe is shared' : 'Recipe is private';
                    toast.current = f7.toast.create({ text: sharedText, position: 'top', cssClass: 'text-primary', closeTimeout: 4000 });
                    toast.current.open();
                    store.dispatch('setCurrentRecipe', updateRecipe);
                    f7.preloader.hide();
                } else {
                    toast.current = f7.toast.create({ text: 'Access denied!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                    toast.current.open();
                    f7.preloader.hide();
                }
            } else {
                toast.current = f7.toast.create({ text: 'The recipe does not exist!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                toast.current.open();
                f7.preloader.hide();
            }
        } catch(error) {
            console.log(error);
            f7.preloader.hide();
        }
    }
    
    function recipeImageSelectedHandler(e) {
        setRecipeImage(e.target.files[0]);
        e.target.value.match(imagePattern) ? setValidRecipeImage(true) : setValidRecipeImage(false);
    }

    async function recipeImageUpload(e) {
        try{
            if(recipeImage != null && validRecipeImage) {
                const isUsedImage = await checkCurrentImageInUsedToStorage(recipeImage);
                if(!isUsedImage) {
                    f7.preloader.show();
                    const getImageAfterSaveToStorage = await setRecipeImageToStorage(recipeImage);
                    if(getImageAfterSaveToStorage != undefined && getImageAfterSaveToStorage[2] == 'Success') {
                        if(!currentRecipe.hasOwnProperty('recipeImages')) {
                            currentRecipe.recipeImages = [];
                        }

                        currentRecipe.recipeImages.push({ url: getImageAfterSaveToStorage[0], caption: currentRecipe.name, name: getImageAfterSaveToStorage[1] });
                        await updateRecipeInDB(currentRecipe);
                        toast.current = f7.toast.create({ text: 'The file is upload successfully!', position: 'top', cssClass: 'text-primary', closeTimeout: 4000 });
                        toast.current.open();
                        store.dispatch('updateRecipe', currentRecipe);
                        f7.preloader.hide();
                    }
                } else {
                    toast.current = f7.toast.create({ text: 'This image name is exist, change name!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                    toast.current.open();
                }
            } else {
                toast.current = f7.toast.create({ text: 'No selected file!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                toast.current.open();
            }
        } catch(error) {
            console.log(error);
            f7.preloader.hide();
        }
    }

    function uploadRecipeImageFileFromCameraSubmit(e) {
        try {
            if(navigator.camera) {
                navigator.camera.getPicture(onSuccess, onError, {
                    quality: 60,
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    encodingType: Camera.EncodingType.JPEG,
                    mediaType: Camera.MediaType.PICTURE,
                    correctionOrientation: true,
                    //cameraDirection: Camera.Direction.BACK
                });
            } else {
                toast.current = f7.toast.create({ text: 'Camera is not ready', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                toast.current.open();
            }
        } catch(error) {
            console.log(error);
        }
        
        function onSuccess(imgURI) {

            try {
                window.resolveLocalFileSystemURL(imgURI, function success(fileEntry) {
        
                    fileEntry.file(function (file) {
                        const reader = new FileReader();
        
                        reader.onloadend = function () {
                            const arrayBuffer = reader.result;
                            const name = file.name.split('.')[0];
                            let blob = new Blob([arrayBuffer], { type: 'image/jpeg' || 'image/png', name: name });
                            if(!blob.hasOwnProperty('name')) {
                                blob.name = name;
                            }

                            checkCurrentImageInUsedToStorage(blob).then((result) => {

                                if(result == false) {
                                    uploadRecipeImageFromCameraToStorage(blob)
                                        .then((url) => {
                                            if(url != undefined && url.length == 3 && url[2] == 'Success') {

                                                if(!currentRecipe.hasOwnProperty('recipeImages')) {
                                                    currentRecipe.recipeImages = [];
                                                }
                        
                                                currentRecipe.recipeImages.push({ url: url[0], caption: currentRecipe.name, name: url[1] });
                                                updateRecipeInDB(currentRecipe).then(() => {
                                                    toast.current = f7.toast.create({ text: 'The file from camera is upload successfully!', position: 'top', cssClass: 'text-primary', closeTimeout: 4000 });
                                                    toast.current.open();
                                                    store.dispatch('updateRecipe', currentRecipe);
                                                    f7.preloader.hide();
                                                }).catch(error => console.log("recipe save to DB error: ", error));

                                            } else {
                                                toast.current = f7.toast.create({ text: 'Image save is failed!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                                                toast.current.open();
                                            }
                                        }).catch(error => console.log("upload image to storage Error: ", error));
                                } else {
                                    toast.current = f7.toast.create({ text: 'Image name is exist!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                                    toast.current.open();
                                }
                            }).catch(error => console.log("check error: ", error));
                  
                        };
        
                        reader.readAsArrayBuffer(file);
        
                    }, onError); 
        
                }, onError);
        
            } catch(error) {
                console.log(error);
            }
        }
        
        function onError(message) {
            console.log('message error ', message);
        }
    }

    async function removeRecipeHandler(e) {
        e.preventDefault();
        try {
            if(currentRecipe.creatorUID == user.userUID || isAdmin) {
                f7.preloader.show();
                
                await removeRecipeFromDB(currentRecipe.id);
                await removeImageFromStorage(currentRecipe.recipeImages);
                store.dispatch('removeRecipe', currentRecipe.id);

                setRemoveForm(false);
                toast.current = f7.toast.create({ text: 'recipe remove successfuly!', position: 'top', cssClass: 'text-primary', closeTimeout: 4000 });
                toast.current.open();
                f7.tab.show('#view-home');
                f7router.navigate(`/home/`);
                f7.preloader.hide();
            } else {
                toast.current = f7.toast.create({ text: 'You do not have permission to delete the recipe!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                toast.current.open();
            }
        } catch(error) {
            console.log(error.message);
            f7.preloader.hide();
        }
    }

    //
    //Recipe Comments
    async function addCommentHandler(e) {
        if(commentText.length == 0) {
            toast.current = f7.toast.create({ text: 'You cannot post an empty comment!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
            toast.current.open();
            return;
        }

        if(!isAuth) {
            toast.current = f7.toast.create({ text: 'Requires you to sign in!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
            toast.current.open();
            return;
        }

        if(currentRecipe != undefined) {
            try {
                f7.preloader.show();
                const imageArray = attachments.map(img => { 
                    return { id: GetRandomString(8), imgUrl: img }
                });

                const newComment = {
                    id: GetRandomString(16),
                    content: commentText,
                    creator: user.username,
                    creatorAvatar: user.avatar,
                    createDate: Date.now(),
                    messageImages: imageArray,
                    creatorUID: user.userUID
                };

                let updateRecipe = currentRecipe;
                if(!updateRecipe.hasOwnProperty('comments')) {
                    updateRecipe.comments = [];
                }

                updateRecipe.comments.unshift(newComment);

                const success = await updateRecipeInDB(updateRecipe);
                if(success == 'Success') {
                    toast.current = f7.toast.create({ text: 'Add comment successfully!', position: 'top', cssClass: 'text-primary', closeTimeout: 4000 });
                    toast.current.open();

                    //after add comment do not update!
                    store.dispatch('setCurrentRecipe', updateRecipe);
                    setComment('');
                    setSheetVisible(true);
                    setAttachments([]);
                    f7.preloader.hide();
                } else {
                    toast.current = f7.toast.create({ text: 'Add comment is failed!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                    toast.current.open();
                }
            } catch(error) {
                toast.current = f7.toast.create({ text: 'Add comment is failed!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                toast.current.open();
                f7.preloader.hide();
                console.log(error);
            }
        }
    }

    const deleteAttachment = (image) => {
        const index = attachments.indexOf(image);
        attachments.splice(index, 1);
        setAttachments([...attachments]);
    };

    const handleAttachment = (e) => {
        const index = f7.$(e.target).parents('label.checkbox').index();
        const image = images[index];
        if (e.target.checked) {
          // Add to attachments
          attachments.unshift(image);
        } else {
          // Remove from attachments
          attachments.splice(attachments.indexOf(image), 1);
        }
        setAttachments([...attachments]);
    };
    //End Recipe Comment

    return (
        <Page name='recipe-details' className='recipe-details' restoreScrollTopOnBack>
            <Navbar title='Recipe Details' color='blue' backLink='Back' className={`${isDarkMode ? 'text-color-white' : 'global-color'}`}></Navbar>
    
            <div className='block margin-top mb-5'></div>
            <div className='recipe-details-title-container'>
                <BlockTitle medium className='reciple-details-title'>
                    <FaConciergeBell className={`${isDarkMode ? 'text-color-white' : 'global-color'}`}/> 
                    &nbsp;<span className={`${isDarkMode ? 'global-color' : 'text-color-black'}`}>Dish:</span>&nbsp;
                    <span className={`${isDarkMode ? 'text-color-white' : 'global-color'}`}>{currentRecipe.name}</span>
                </BlockTitle>
                <BlockTitle className='reciple-details-category'>
                    <BiSolidCategory className={`${isDarkMode ? 'text-color-white' : 'global-color'}`}/> 
                    &nbsp;<span className={`${isDarkMode ? 'global-color' : 'text-color-black'}`}>Category:</span>&nbsp;
                    <span className={`${isDarkMode ? 'text-color-white' : 'global-color'}`}>{currentRecipe.category}</span>
                </BlockTitle>
            </div>

            <Block className='my-0'><img src={currentRecipe.recipeImage} className='recipe-details-image' alt='image'/></Block>
           
            <List outlineIos outline dividersIos simpleList strong className='recipe-details-side-container'>
                <ListItem width='100' className='background-color-white'>
                    <Block style={{ width: '100%' }} className='display-flex justify-content-between px-0'>
                        <div className='recipe-details-font-size-corrected color-black'>
                            <FaUtensils size={18} className='global-color'/> Servings: <span className='recipe-details-servings' >{currentRecipe.servings}</span>
                        </div>
                        <div className='recipe-details-font-size-corrected color-black'>
                            <Icon 
                                icon='chart_bar_alt_fill' 
                                material='chart_bar_alt_fill' 
                                f7='chart_bar_alt_fill' 
                                slot='media' 
                                size='20'
                                className='calories-icon global-color'
                            /> 
                            <span><span className='recipe-details-calories'>{currentRecipe.calories}</span> Cal.</span>
                        </div>
                    </Block>
                </ListItem>
            </List>

            <Card className='background-color-white'>
                <CardContent padding={true}>
                    <div style={{ height: '50px', paddingLeft: '20px' }} className={`${isDarkMode ? 'background-color-white' : 'background-color-blue'}`}>
                        <CardHeader textColor='black' className='display-block'>
                        Ingredients
                        <br />
                        <small style={{ opacity: 0.7 }}>For Preparation</small>
                        </CardHeader>
                       
                    </div>
                    <div className='card-content-padding'>
                        {currentRecipe.ingredients && currentRecipe.ingredients.map((ing, i) => {
                            if(ing.name == 'Eggs')
                                return <p key={i} className='display-flex justify-content-between'><span>{ing.name}</span> <span>{Math.ceil(ing.weight / 50)} pieces.</span></p>
                            else
                                return <p key={i} className='display-flex justify-content-between'><span>{ing.name}</span> <span>{ing.weight}g.</span></p>
                        })}
                    </div>
                </CardContent>
            </Card>

            currentRecipe.recipeVideoId != undefined ? <MovieCLip recipeVideoId={currentRecipe.recipeVideoId}/> : null

            <Card className='recipe-details-instructions-container'>
                <span slot="header">< FaBook size={24} className='global-color'/> Instructions</span>
                <span slot="content" className={`${isDarkMode ? 'background-color-white' : 'background-color-blue'}`}>
                    {instructionRecipeArray && instructionRecipeArray.map((el, i) => {
                        if(el.includes('Step') || el.includes('step')) 
                            return <BlockTitle className='fw-bold color-black' key={i}>{el}</BlockTitle>;
                        else if(el == '') 
                            return <div key={i}>{el}</div>;
                        else
                            return <div key={i}>{el}</div>;
                    })}
                </span>
                <span className='display-flex justify-content-between background-color-white px-3 py-2 recipe-details-instructions-time-cook-container'>
                    <span className='recipe-details-font-size-corrected'><MdOutlineTimer size={20} className='global-color'/> Prep Time: <span className='recipe-details-preparation'>{currentRecipe.preparation}</span></span>
                    <span className='recipe-details-font-size-corrected'><MdOutlineTimer size={20} className='global-color'/> Cook Time: <span className='recipe-details-preparation'>{currentRecipe.cookTime}</span></span>
                </span>
            </Card>
           
            {isAdmin || user.userUID == currentRecipe.creatorUID ? 
            
            <List simpleList outlineIos strong className='recipe-details-side-container my-5 '>
                <ListItem onClick={(e) => recipeUpdateHandler(e)} onTouchStart={(e) => recipeUpdateHandler(e)} link="#" className='recipe-details-recipe-update-link'>
                    <GrEdit size={20} className='color-yellow margin-right'/> 
                    <span className='text-decoration-underline color-yellow'>Update Recipe</span> 
                </ListItem>
            </List> : null}


            <BlockTitle className='px-3 global-color'>Rating recipe</BlockTitle>
            <Block strong outlineIos className="display-flex justify-content-between text-align-center recipe-details-side-container background-color-white color-black">
                    <span className="star-container">
                        {rating && rating >= 2 
                            ? <BsStarFill size={18}/> 
                            : rating == 1 ? <BsStarHalf size={18}/> : <BsStar size={18}/>}
                        {rating && rating >= 4 
                            ? <BsStarFill size={18}/> 
                            : rating == 3 ? <BsStarHalf size={18}/> : <BsStar size={18}/>}
                        {rating && rating >= 6 
                            ? <BsStarFill size={18}/> 
                            : rating == 5 ? <BsStarHalf size={18}/> : <BsStar size={18}/>}
                        {rating && rating >= 8 
                            ? <BsStarFill size={24}/> 
                            : rating == 7 ? <BsStarHalf size={18}/> : <BsStar size={18}/>}
                        {rating && rating >= 10 
                            ? <BsStarFill size={18}/> 
                            : rating == 9 ? <BsStarHalf size={18}/> : <BsStar size={18}/>}
                    </span>

                    <Stepper
                        fill
                        value={rating}
                        min={0}
                        step={1}
                        autorepeat={true}
                        wraps={false}
                        manualInputMode={true}
                        buttonsOnly={true}
                        color='blue'
                        onStepperPlusClick={(e) => likeHandler(e)}
                        onStepperMinusClick={(e) => dislikeHandler(e)}
                        className='margin-right'
                    />

                    <span className="recipe-details-rating">{currentRecipe.rating}</span>
            </Block>

            <BlockTitle className='global-color display-flex justify-content-between px-3'><span>Posted recipe: </span> <span>From:</span></BlockTitle>
            <List outlineIos outline dividersIos simpleList strong className='recipe-details-side-container'>
                <ListItem className='background-color-white'>
                    <Block className='display-flex justify-content-between px-0 recipe-details-side-posted-creator-container'>
                        <div className='recipe-details-font-size-corrected color-black'>
                            <MdMoreTime size='20' className='global-color' style={{ marginRight: '5px'}}/>
                            <span>{currentRecipe.date}</span>
                        </div>
                        <div className='recipe-details-font-size-corrected color-black'>
                            <MdPersonAddAlt1 size={18} className='global-color'/>
                            <span> {creator}</span>
                        </div>
                    </Block>
                </ListItem>
            </List>    

             <RecipeImagesPage data={currentRecipe.recipeImages}/>


            {isAdmin || user.userUID == currentRecipe.creatorUID ? <List strong outlineIos dividersIos insetMd accordionList className='recipe-details-options'>
                <ListItem accordionItem title="Recipe Settings" header={<IoSettingsOutline className='global-color' size={20}/>} after='Settings' className='background-color-white color-black'>
                    
                    <AccordionContent>
                        <Block>
                            <p>Recipe is {currentRecipe.sharing 
                                ? <span className='fw-bold global-color'>public</span> 
                                : <span className='fw-bold global-color'>private</span>
                                }!
                            </p>

                            <List simpleList strong outlineIos dividersIos >
                                <ListItem className='background-color-teal'>
                                    <span className={`${isDarkMode ? 'text-color-white' : 'text-color-black'}`}>Shared/Unshared recipe</span>
                                    <Toggle onChange={(e) => sharedHandler(e)} checked={sharingRecipe == undefined ? false : sharingRecipe} value={''} color="blue" />
                                </ListItem>
                            </List>

                            <List>
                                <ListItem>
                                    <BlockTitle className='global-color'>Upload image</BlockTitle>
                                </ListItem>

                                <ListInput 
                                    onChange={recipeImageSelectedHandler}
                                    label='Image must be unique!' 
                                    name='image' 
                                    type='file' 
                                    placeholder='Upload Image' 
                                    color='blue'
                                    validate
                                    info='Enter image png or jpg format!'
                                    className='no-margin input-field mt-3 background-color-blue'
                                    errorMessage='This image is invalid!'
                                >
                                    <Icon icon='cloud_upload' material='cloud_upload' f7='cloud_upload' slot='media' color='blue' size='40' className='margin-right'/>
                                </ListInput>

                                <div className='color-bg-white p-3'>
                                    <Button onClick={(e) => recipeImageUpload(e)} onTouchStart={recipeImageUpload} raised fill color='blue' textColor='black'>
                                    <MdCloudUpload size={20} className='color-white'/>
                                        &nbsp;&nbsp;<span className='color-white'>Add image</span> 
                                    </Button>
                                </div>
                            </List>

                            <List strongIos dividersIos insetIos className='form-list mb-3'>
                                <ListItem className=''>
                                    <BlockTitle className='global-color'>Take a picture from the camera</BlockTitle>
                                </ListItem>
                                <ListItem strong>
                                    <div className='recipe-details-camera-take-picture'>
                                        <Col width='100'>
                                            <Button 
                                                onClick={uploadRecipeImageFileFromCameraSubmit}
                                                onTouchStart={uploadRecipeImageFileFromCameraSubmit}
                                                raised fill color='blue' textColor='black'
                                                width='100'
                                            >
                                                    <ImCamera size={18} className='avatar-user-camera-btn color-white'/>
                                                    &nbsp;&nbsp;<span className='color-white'>Open Camera</span>
                                            </Button>
                                        </Col>
                                    </div>
                                </ListItem>
                            </List>
                            
                            <List simpleList strong outlineIos dividersIos className='mb-3'>
                                <ListItem>
                                    <span> <Icon ios="f7:no_meals" md="material:no_meals" className='global-color'></Icon> <span className={`global-underline ${isDarkMode ? 'text-color-white' : 'text-color-black'}`}>Remove recipe</span></span>
                                    <Button onClick={() => setRemoveForm(true)} onTouchStart={() => setRemoveForm(true)} tooltip="Recipe will be removed!">
                                        <Icon color='red' icon='trash' f7='trash' material='trash' slot='media' className='remove-recipe-icon' />
                                    </Button>
                                </ListItem>
                            </List>

                        </Block>
                    </AccordionContent>
                </ListItem>
            </List> : null}



            <List strong outlineIos dividersIos insetMd accordionList className='background-color-white'>
                <ListItem accordionItem title='Recipe Comments' 
                    header={<TfiComments  className='global-color' size={20}/>} 
                    after={isShowComments ? 'Hide' : 'Open'} 
                    className='background-color-white color-black'
                    onClick={() => setIsShowComments(!isShowComments)}
                    onTouchStart={() => setIsShowComments(!isShowComments)}
                >
                    <AccordionContent>
                        <Messages scrollMessages={false}>
                            <MessagesTitle medium className='text-color-black'>
                                {days[dateComment.getDay()]}, {dateComment.getDate()} {months[dateComment.getMonth()]}, &nbsp; 
                                {dateComment.getHours() < 10 ? '0' + dateComment.getHours() : dateComment.getHours()}:
                                {dateComment.getMinutes() < 10 ? '0' + dateComment.getMinutes() : dateComment.getMinutes()}:
                                {dateComment.getSeconds() < 10 ? '0' + dateComment.getSeconds() : dateComment.getSeconds()}
                            </MessagesTitle>
                            
                            {currentRecipe.comments != undefined && currentRecipe.comments.length > 0 
                                ? currentRecipe.comments.sort((a, b) => Date.parse(a.createDate) - Date.parse(b.createDate)).map((c, i) => <CommentModel key={c.id} comment={c} number={i + 1} currentRecipe={currentRecipe}/>) 
                                : <BlockTitle medium className='global-color display-flex justify-content-center align-content-center margin-vertical fw-bold'>No post comments!</BlockTitle>
                            }
                        </Messages>

                        <Messagebar 
                            color='blue' 
                            placeholder='Enter comment'  
                            value={commentText} 
                            onChange={(e) => setComment(e.target.value)}
                            sheetVisible={!sheetVisible}
                            attachmentsVisible={(e) => attachmentsVisible(e)}
                        >
                            <Link
                                iconIos="f7:camera_fill"
                                iconMd="material:camera_alt"
                                slot="inner-start"
                                className='global-color'
                                onClick={() => setSheetVisible(!sheetVisible)}
                                onTouchStart={() => setSheetVisible(!sheetVisible)}
                            />
                            <Link
                                iconIos="f7:arrow_up_circle_fill"
                                iconMd="material:send"
                                slot="inner-end"
                                className='global-color'
                                onClick={(e) => addCommentHandler(e)}
                                onTouchStart={(e) => addCommentHandler(e)}
                            />
                            <MessagebarAttachments>
                                {attachments.map((image, index) => (<MessagebarAttachment key={index} image={image} onAttachmentDelete={() => deleteAttachment(image)}/>))}
                            </MessagebarAttachments>
                            <MessagebarSheet>
                                {images.map((image, index) => (<MessagebarSheetImage key={index} image={image} checked={attachments.indexOf(image) >= 0} onChange={handleAttachment}/>))}
                            </MessagebarSheet>
                        </Messagebar>


                    </AccordionContent>
                </ListItem>
            </List>




            <Actions opened={removeForm}  className='color-bg-white' onActionsClosed={(e) => setRemoveForm(false)}>
                <ActionsGroup>
                    <ActionsLabel color='red' className='display-flex justify-content-center'>Are you sure you want to delete the recipe?</ActionsLabel>
                    <div className='display-flex justify-content-center'><IoMdRemoveCircle size={30} color='red'/></div>
                    <Block>
                        <div className='display-flex justify-content-around'>
                            <Button style={{ width: '200px' }} onClick={(e) => removeRecipeHandler(e, currentRecipe.id)} raised color='red'>Yes</Button>
                            <Button style={{ width: '200px' }} onClick={(e) => setRemoveForm(false)} width='25' raised color='black'>Cancel</Button>
                        </div>
                    </Block>
                        
                </ActionsGroup>
            </Actions> 
        </Page>
    )
}

export default RecipeDetailsPage;