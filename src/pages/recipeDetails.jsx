import React, { useState, useEffect, useRef } from 'react';
import '../css/recipeDetails.css';

import { Page, Navbar, BlockTitle, useStore, List, ListItem, AccordionContent, Block, Icon, 
    Card, CardContent, CardHeader, Button, Toggle, Actions, ActionsGroup, ActionsLabel, f7, Stepper,
    Messages,MessagesTitle, Messagebar, Link, MessagebarAttachments, MessagebarAttachment,
    MessagebarSheet, MessagebarSheetImage, f7ready, ListInput, Row, Col
} from 'framework7-react';

import store from '../js/store';
import { updateRecipeInDB, getCreatorRecipe, removeRecipeFromDB, getImagesCommentUrl } from '../services/recipeService';
import { checkCurrentImageInUsedToStorage, setRecipeImageToStorage, removeImageFromStorage } from '../services/recipeStorage';
import { setUserRatingToDB } from '../services/userServices';
import RecipeImagesPage from '../components/recipeImages';
import { imagePattern } from '../services/variable';
import { GetRandomString } from '../services/generateRandomString';
import { days, months, sortAllCommentsByCreateDateInDescending } from '../services/DateFormat';
import CommentModel from '../components/commentModel';

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
    const [commentText, setComment] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [sheetVisible, setSheetVisible] = useState(true);
    const [images, setImages] = useState([]);
    const [dateComment, setDataComment] = useState(new Date());
  
    const messagebar = useRef(null);
    const attachmentsVisible = () => attachments.length > 0 ? true : false;
    //end message

    //get current recipe
    const currentId = f7route.params.id.substring(1);
    const toast = useRef(null);
    let user = useStore('authUser');
    let recipes = useStore('getAllRecipes');
    const isAdmin = useStore('userIsAdmin');
    const isAuth = useStore('userIsAuth');


    let instructionRecipeArray = '';
    if(currentRecipe.instructions != null)
        instructionRecipeArray = currentRecipe.instructions.split('\n');

    useEffect(() => {
        f7ready(() => {
            window.scrollTo(0, 0);

            if(currentId != undefined && recipes != undefined && recipes.length > 0) {
                let getCurrentRecipe = recipes.find(el => el.id == currentId);
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
        });
    }, []);

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
                    toast.current = f7.toast.create({ text: 'You gave your rating!', position: 'top', cssClass: 'text-info', closeTimeout: 4000 });
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

                toast.current = f7.toast.create({ text: 'You gave your rating successfuly!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
                toast.current.open();

                store.dispatch('updateRecipe', updateRecipe);
                store.dispatch('updateUserRating', currentUser);
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
                    toast.current = f7.toast.create({ text: sharedText, position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
                    toast.current.open();
                    store.dispatch('updateRecipe', updateRecipe);
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
                        toast.current = f7.toast.create({ text: 'The file is upload successfully!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
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

    async function removeRecipeHandler(e, id) {
        e.preventDefault();
        try {
            if(currentRecipe.creatorUID == user.userUID || isAdmin) {
                f7.preloader.show();
                
                await removeRecipeFromDB(currentRecipe.id);
                await removeImageFromStorage(currentRecipe.recipeImages);
                store.dispatch('removeRecipe', currentRecipe.id);

                setRemoveForm(false);
                toast.current = f7.toast.create({ text: 'recipe remove successfuly!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
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

                updateRecipe.comments.push(newComment);

                const success = await updateRecipeInDB(updateRecipe);
                if(success == 'Success') {
                    toast.current = f7.toast.create({ text: 'Add comment successfully!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
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
        <Page name='recipe-details'>
            <Navbar title='Recipe Details' color='teal' backLink='Back' className='global-color'></Navbar>
    
            <div className='block margin-top mb-5'></div>
            <div className='recipe-details-title-container'>
                <BlockTitle medium className='reciple-details-title'><FaConciergeBell color='teal'/> Dish: <span className='global-color'>{currentRecipe.name}</span></BlockTitle>
                <BlockTitle className='reciple-details-category'><BiSolidCategory color='teal'/> Category: <span className='global-color'>{currentRecipe.category}</span></BlockTitle>
            </div>

            <Block className='my-0'><img src={currentRecipe.recipeImage} className='recipe-details-image' alt='image'/></Block>
           
            <List outlineIos outline dividersIos simpleList strong className='recipe-details-side-container'>
                <ListItem width='100' className='background-color-white'>
                    <Block style={{ width: '100%' }} className='display-flex justify-content-between px-0'>
                        <div className='recipe-details-font-size-corrected'>
                            <FaUtensils size={18} color='teal'/> Servings: <span className='recipe-details-servings'>{currentRecipe.servings}</span>
                        </div>
                        <div className='recipe-details-font-size-corrected'>
                            <Icon 
                                icon='chart_bar_alt_fill' 
                                material='chart_bar_alt_fill' 
                                f7='chart_bar_alt_fill' 
                                slot='media' 
                                size='20'
                                className='calories-icon'
                                color='teal'
                            /> 
                            <span><span className='recipe-details-calories'>{currentRecipe.calories}</span> Cal.</span>
                        </div>
                    </Block>
                </ListItem>
            </List>

            <Card className='background-color-white'>
                <CardContent padding={true}>
                    <div style={{ height: '50px', paddingLeft: '20px', backgroundColor: 'rgba(13, 150, 136, 0.15)' }}>
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

            <Card className='recipe-details-instructions-container'>
                <span slot="header">< FaBook size={24} color='teal'/> Instructions</span>
                <span slot="content" style={{ backgroundColor: 'rgba(13, 150, 136, 0.10) !important'}}>
                    {instructionRecipeArray && instructionRecipeArray.map((el, i) => {
                        if(el.includes('Step') || el.includes('step')) 
                            return <BlockTitle className='fw-bold' key={i}>{el}</BlockTitle>;
                        else if(el == '') 
                            return <div key={i}>{el}</div>;
                        else
                            return <div key={i}>{el}</div>;
                    })}
                </span>
                <span className='display-flex justify-content-between background-color-white px-3 py-2 recipe-details-instructions-time-cook-container'>
                    <span className='recipe-details-font-size-corrected'><MdOutlineTimer size={18} color='teal'/> Prep Time: <span className='recipe-details-preparation'>{currentRecipe.preparation}</span></span>
                    <span className='recipe-details-font-size-corrected'><MdOutlineTimer size={18} color='teal'/> Cook Time: <span className='recipe-details-preparation'>{currentRecipe.cookTime}</span></span>
                </span>
            </Card>
           
            {isAdmin || user.userUID == currentRecipe.creatorUID ? <List simpleList outlineIos strong className='recipe-details-side-container'>
                <ListItem onClick={e => recipeUpdateHandler(e)} link="#" className='recipe-details-recipe-update-link background-color-white'>
                    <GrEdit size={18} className='admin-color margin-right'/> 
                    <span className='text-decoration-underline'>Update Recipe</span> 
                </ListItem>
            </List> : null}

            <BlockTitle className='px-3 global-color'>Rating recipe</BlockTitle>
            <Block strong outlineIos className="display-flex justify-content-between text-align-center recipe-details-side-container background-color-white">
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
                        color='teal'
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
                        <div className='recipe-details-font-size-corrected'>
                            <MdMoreTime size='18' color='teal' style={{ marginRight: '5px'}}/>
                            <span>{currentRecipe.date}</span>
                        </div>
                        <div className='recipe-details-font-size-corrected'>
                            <MdPersonAddAlt1 size={18} color='teal'/>
                            <span> {creator}</span>
                        </div>
                    </Block>
                </ListItem>
            </List>    

            <RecipeImagesPage data={currentRecipe.recipeImages}/>


            {isAdmin || user.userUID == currentRecipe.creatorUID ? <List strong outlineIos dividersIos insetMd accordionList className='recipe-details-options'>
                <ListItem accordionItem title="Recipe Settings" header={<IoSettingsOutline color='teal' size={20}/>} after='Settings' className='background-color-white'>
                    
                    <AccordionContent>
                        <Block>
                            <p>Recipe is {currentRecipe.sharing 
                                ? <span className='fw-bold global-color'>public</span> 
                                : <span className='fw-bold global-color'>private</span>
                                }!
                            </p>

                            <List simpleList strong outlineIos dividersIos >
                                <ListItem className='background-color-teal'>
                                    <span>Shared/Unshared recipe</span>
                                    <Toggle onChange={(e) => sharedHandler(e)} checked={sharingRecipe == undefined ? false : sharingRecipe} value={''} color="teal" />
                                </ListItem>
                            </List>

                            <List>
                                <ListItem>
                                    <BlockTitle className='global-color'>Choose image</BlockTitle>
                                </ListItem>

                                <ListInput 
                                    onChange={recipeImageSelectedHandler}
                                    label='Image must be unique!' 
                                    name='image' 
                                    type='file' 
                                    placeholder='Upload Image' 
                                    color='teal'
                                    validate
                                    info='Enter image png or jpg format!'
                                    className='no-margin input-field my-3 background-color-teal'
                                    errorMessage='This image is invalid!'
                                >
                                    <Icon icon='cloud_upload' material='cloud_upload' f7='cloud_upload' slot='media' color='teal' size='40' className='margin-right'/>
                                </ListInput>

                                <ListItem >
                                    <Row width='100' className='display-flex justify-content-center my-3 w-100'>
                                        <Col width='75'>
                                            <Button onClick={(e) => recipeImageUpload(e)} raised fill className='background-color-white' textColor='black'>Add image</Button>
                                        </Col>
                                    </Row>
                                </ListItem>
                            </List>

                            
                            <List simpleList strong outlineIos dividersIos className='mb-3'>
                                <ListItem className='background-color-teal'>
                                    <span> <Icon ios="f7:no_meals" md="material:no_meals" color='teal'></Icon> <span className='global-underline'>Remove recipe</span></span>
                                    <Button onClick={(e) => setRemoveForm(true)} tooltip="Recipe will be removed!">
                                        <Icon color='red' icon='trash' f7='trash' material='trash' slot='media' className='remove-recipe-icon' />
                                    </Button>
                                </ListItem>
                            </List>

                        </Block>
                    </AccordionContent>
                </ListItem>
            </List> : null}

            <List strong outlineIos dividersIos insetMd accordionList accordionOpposite className='background-color-white'>
                <ListItem accordionItem title='Recipe Comments' color='teal' className='background-color-white'>
                    <AccordionContent>
                        <Messages className=''>
                            <MessagesTitle medium>
                                {days[dateComment.getDay()]}, {dateComment.getDate()} {months[dateComment.getMonth()]}, &nbsp; 
                                {dateComment.getHours() < 10 ? '0' + dateComment.getHours() : dateComment.getHours()}:
                                {dateComment.getMinutes() < 10 ? '0' + dateComment.getMinutes() : dateComment.getMinutes()}:
                                {dateComment.getSeconds() < 10 ? '0' + dateComment.getSeconds() : dateComment.getSeconds()}
                            </MessagesTitle>
                            
                            {currentRecipe.comments && currentRecipe.comments.length > 0 
                                ? currentRecipe.comments.sort((a, b) => Date.parse(a.createDate) - Date.parse(b.createDate)).map((c, i) => <CommentModel key={c.id} comment={c} number={i + 1} currentRecipe={currentRecipe}/>) 
                                : <BlockTitle medium className='global-color display-flex justify-content-center align-content-center margin-vertical fw-bold'>No post comments!</BlockTitle>
                            }
                        </Messages>

                        <Messagebar 
                            color='teal' 
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
                                onClick={(e) => setSheetVisible(!sheetVisible)}
                            />
                            <Link
                                iconIos="f7:arrow_up_circle_fill"
                                iconMd="material:send"
                                slot="inner-end"
                                className='global-color'
                                onClick={(e) => addCommentHandler(e)}
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