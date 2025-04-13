import React, { useRef, useState, useEffect } from 'react';
import '../css/recipeCreate.css';
import { Page, Navbar, List, ListInput, ListItem, BlockTitle, Row, 
  Button, Range, Block, useStore, LoginScreenTitle, Col, f7, Icon
} from 'framework7-react';

import store from '../js/store';
import { capitalLetter, NumberPattern, PreparationPattern, imagePattern, VideoIdPattern } from '../services/variable';
import { userIsAuth } from '../services/userServices';
import { setRecipeFromDB } from '../services/recipeService';
import { setRecipeImageToStorage } from '../services/recipeStorage';
import { GetCurrentDate } from '../services/DateFormat';
import { ingredientsData, liquidIngredients } from '../services/variable';
import { GetRandomString } from '../services/generateRandomString';

import createImage from '../public/create-image.png';

function RecipeCreatePage() {
  //Sortable all ingredients by ascending order
  const sortableIngredients = ingredientsData.sort((a, b) => a.localeCompare(b));

  const [categorySelected, setCategorySelected] = useState('Beef');
  const [recipeName, setRecipeName] = useState('');
  const [isValidRecipeName, setIsValidRecipeName] = useState(true);

  const [calories, setCalories] = useState('');
  const [isValidCalories, setIsValidCalories] = useState(true);

  const [preparation, setPreparation] = useState('');
  const [isValidPreparation, setIsValidPreparation] = useState(true);

  const [cookTime, setCookTime] = useState('');
  const [isValidCookTime, setIsValidCookTime] = useState(true);

  const [instructions, setInstructions] = useState('');
  const [isValidInstructions, setIsValidInstructions] = useState(true);

  const [servings, setServings] = useState(1);
  const [isValidServings, setIsValidServings] = useState(true);

  const [recipeImage, setRecipeImage] = useState(null);
  const [isValidRecipeImage, setIsValidRecipeImage] = useState(true);

  const [videoId, setVideoId] = useState('');
  const [isValidVideoId, setIsValidVideoId] = useState(true);

  //Ingridients
  const [ingredient, setIngredient] = useState(sortableIngredients[0]);
  const [ingredientGrams, setIngredientGrams] = useState(0);
  //array from ingredients (select/optional)
  const [ingredients, setIngredients] = useState([]);

  //Create RECIPE btn Enable/Disable
  const [btnAddRecipeIsEnable, setBtnAddRecipeIsEnable] = useState(true);

  const toast = useRef(null);
  let categories = useStore('categories');
  let user = useStore('authUser');

  useEffect(() => {
    if(isValidRecipeName && recipeName != '' && isValidCalories && calories != '' 
      && isValidPreparation && preparation != '' && isValidInstructions 
      && instructions != '' && isValidRecipeImage && recipeImage != null) {
      setBtnAddRecipeIsEnable(false);
    } else {
      setBtnAddRecipeIsEnable(true);
    }
  }, [recipeName, calories, preparation, instructions, recipeImage]);

  function categorySelectedHandler(e) { setCategorySelected(e.target.value); }
  //recipe name
  function recipeNameHandler(e) {
    setRecipeName(e.target.value);
    e.target.value.match(capitalLetter) ? setIsValidRecipeName(true) : setIsValidRecipeName(false);
  }
  //recipe calories
  function caloriesHandler(e) {
    e.target.value.match(NumberPattern) ? setIsValidCalories(true) : setIsValidCalories(false);
    setCalories(e.target.value);
  }
  //recipe prepararion time
  function preparationHandler(e) {
    setPreparation(e.target.value);
    e.target.value.match(PreparationPattern) ? setIsValidPreparation(true) : setIsValidPreparation(false);
  }

  //recipe cook time
  function cookTimeHandler(e) {
    setCookTime(e.target.value);
    e.target.value.match(PreparationPattern) ? setIsValidCookTime(true) : setIsValidCookTime(false);
  }
  
  //recipe instruction preparation
  function instructionsHandler(e) {
    setInstructions(e.target.value);
    e.target.value.length > 20 && e.target.value.length < 5000 ? setIsValidInstructions(true) : setIsValidInstructions(false);
  }
  function servingsHandler(e) {
    setServings(e.target.value);
    e.target.value > 0 && e.target.value < 9 ? setIsValidServings(true) : setIsValidServings(false);
  }
  //recipe image png or jpg
  function recipeImageHandler(e) {
      setRecipeImage(e.target.files[0]);
      e.target.value.match(imagePattern) ? setIsValidRecipeImage(true) : setIsValidRecipeImage(false);
  }

  function videoIdHandler(e) {
    setVideoId(e.target.value);
    e.target.value.match(VideoIdPattern) && e.target.value.length == 11 ? setIsValidVideoId(true) : setIsValidVideoId(false);
  }

  function ingredientSelectedHandler(e) { setIngredient(e.target.value); }

  function ingredientSelectedGramsHandler(e) { setIngredientGrams(e); }

  function addIngredient(e) { setIngredients([...ingredients, { name: ingredient, weight: ingredientGrams }]); }

  function removeIngredient(e, i) {
    const removeElement = ingredients.splice(i, 1);
    setIngredients([...ingredients]);
  }

  async function recipeSubmit(e) {
    
    if(isValidRecipeImage && recipeImage != null && isValidRecipeName && isValidCalories 
      && isValidPreparation && isValidInstructions && isValidServings
    ) {
        if(userIsAuth(user)) {
            try {
              f7.preloader.show();
              const url = await setRecipeImageToStorage(recipeImage);
              if(url != undefined && url.length > 1 && url[2] == 'Success') {
                  let newRecipe = { 
                    recipeId: GetRandomString(16),
                    category: categorySelected,
                    name: recipeName,
                    calories: calories,
                    preparation: preparation,
                    cookTime: cookTime,
                    instructions: instructions,
                    recipeImage: url[0],
                    creatorUID: user.userUID,
                    servings: servings,
                    rating: 0,
                    sharing: false,
                    date: GetCurrentDate(new Date()),
                    comments: [],
                    ingredients: ingredients,
                    recipeImages: [{ url: url[0], caption: recipeName, name: url[1] }],
                    following: 0,
                    recipeVideoId: videoId || '',
                    favorite: []
                  };

                  const getCurrentRecipe = await setRecipeFromDB(newRecipe);
                  if(getCurrentRecipe != undefined && getCurrentRecipe.length > 1 && getCurrentRecipe[1] == 'Success') {
                    toast.current = f7.toast.create({ text: 'Add recipe successfully!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
                    toast.current.open();
  
                    store.dispatch('addRecipe', newRecipe);
                    f7.tab.show('#view-home');
                    //remove all inputs fields after create recipe
                    setCategorySelected('Beef');
                    setRecipeName('');
                    setIsValidRecipeName(true);
                    setCalories('');
                    setIsValidCalories(true);
                    setPreparation('');
                    setIsValidPreparation(true);
                    setCookTime('');
                    setIsValidCookTime(true);
                    setInstructions('');
                    setIsValidInstructions(true);
                    setServings(1);
                    setIsValidServings(true);
                    setRecipeImage(null);
                    setIsValidRecipeImage(true);
                    setIngredient(sortableIngredients[0]);
                    setIngredientGrams(0);
                    setIngredients([]);
                    setBtnAddRecipeIsEnable(true);
                    setVideoId('');
                    setIsValidVideoId(true);
                    f7.preloader.hide();
                  } else {
                    toast.current = f7.toast.create({ text: 'Create recipe is failed!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                    toast.current.open();
                  }
              } else {
                toast.current = f7.toast.create({ text: 'Create recipe is failed!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                toast.current.open();
              }
            } catch(error) {
              console.log(error.message);
              f7.preloader.hide();
            }
        } else {
          toast.current = f7.toast.create({ text: 'You are not logged in!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
          toast.current.open();
        }
    } else {
      toast.current = f7.toast.create({ text: 'You have not filled in all the fields!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
      toast.current.open();
    }
  }

  return (
      <Page name='create-recipe' >
        <Navbar title='Create Recipe' className='global-color'/>

        <div className='block margin-top mb-5'></div>
        <LoginScreenTitle className='margin-top mb-1'>Create Recipe Form</LoginScreenTitle>
         <img src={createImage} className='create-recipe-logo-image lazy lazy-fade-in'/>
       

        <List outlineIos strongIos >
            <ListInput onChange={categorySelectedHandler} label='Categories' type='select' name='categories' placeholder='Please choose...' color='teal' className='select-box'>
                {categories && categories.map(c => <option key={c.id} value={c.name} style={{ cursor: 'pointer'}}>{c.name}</option>)}
            </ListInput>

            <ListInput 
                onChange={recipeNameHandler}
                label='Recipe Name' 
                name='name' 
                type='text' 
                placeholder='Enter recipe name' 
                color='teal'
                validate
                info='Recipe name must be start a capital letter!'
                className='input-field no-margin'
                value={recipeName}
                errorMessage='The recipe name is invalid!'
                errorMessageForce={isValidRecipeName ? false : true}
            ></ListInput>

            <ListInput
                onChange={caloriesHandler}
                label='Calories'
                type='number'
                placeholder='Enter recipe calories in Cal'
                info='The calories are a number in Cal!'
                color='teal'
                className='input-field no-margin'
                value={calories}   
                validate
                errorMessage='The calories is invalid!'
                errorMessageForce={isValidCalories ? false : true}
            ></ListInput>

            <ListInput
                onChange={preparationHandler}       
                label='Preparation time'
                name='preparation'
                type='text'
                placeholder='Enter recipe preparation in minutes'
                color='teal'
                validate
                info='Valid preparation means to enter minutes for the recipe to be prepared, example -> 102 mins'
                className='input-field no-margin'
                value={preparation}
                errorMessage='The preparation is invalid!'
                errorMessageForce={isValidPreparation ? false : true}        
            ></ListInput>

            <ListInput
                onChange={cookTimeHandler}       
                label='Cook time'
                name='cooktime'
                type='text'
                placeholder='Enter recipe cook time in minutes'
                color='teal'
                validate
                info='Valid cook time means to enter minutes for the recipe to be prepared, example -> 102 mins'
                className='input-field no-margin'
                value={cookTime}
                errorMessage='The preparation is invalid!'
                errorMessageForce={isValidCookTime ? false : true}        
            ></ListInput>
            
            <ListInput 
                onChange={instructionsHandler}
                label='Preparation instruction is resizeble!' 
                type='textarea' 
                placeholder='Enter preparation instruction' 
                color='teal'
                info='Min length 20 and Max length is 5000 symbils!'
                value={instructions}
                maxlength={5000}
                minlength={20}
                errorMessage='Preparation instruction valid min length 20 symbils and max length is 5000 symbils!'
                errorMessageForce={isValidInstructions ? false : true}  
                resizable={true}
            ></ListInput>

            <ListInput
                onChange={servingsHandler}
                label='Servings'
                type='number'
                placeholder='Enter servings'
                info='The servings is number from 1 to 8!'
                color='teal'
                className='input-field no-margin'
                value={servings}   
                errorMessage='The servings is invalid!'
                errorMessageForce={isValidServings ? false : true}
            ></ListInput>
        </List>     
                   
        {/* Images inputs */}
        <List outlineIos strongIos>
            <ListInput 
                    onChange={recipeImageHandler}
                    label='Recipe Image' 
                    name='recipeImage' 
                    type='file' 
                    placeholder='Upload Recipe Image' 
                    color='teal'
                    validate
                    info='Enter recipe image png or jpg format!'
                    className='input-field background-teal-opacity-2 no-margin'
                    errorMessage='This recipe image format is invalid!'
                    errorMessageForce={isValidRecipeImage ? false : true}
            >
              <Icon icon='cloud_upload' material='cloud_upload' f7='cloud_upload' slot='media' color='teal' size='40' className='margin-right'/>
            </ListInput>

            <div className='padding-left'>Example video Id: "https://www.youtube.com/embed/<span className='global-bold global-color'>TnRcSkusmMg</span>" &lt;- require ID!</div>
            <ListInput 
                onChange={videoIdHandler}
                label='Recipe Video' 
                name='video' 
                type='text' 
                placeholder='Enter youtube embed ID here...' 
                color='teal'
                validate
                info='Recipe video require only ID not url!'
                className='input-field no-margin'
                value={videoId}
                errorMessage='Youtube ID is invalid!'
                errorMessageForce={!isValidVideoId ? true : false}
            ></ListInput>
            
        </List>
            
        <BlockTitle color='teal'>Recipe Ingredients</BlockTitle>
        {/* Ingredients inputs or select */}
        <List outlineIos dividersIos strong  color='teal' style={{ listStyle: 'none' }} >
            <Block>

              <ListInput onChange={ingredientSelectedHandler} label='Please choose ingredient' type='select' name='ingredients' placeholder='Please choose ingredient' color='teal' >
                  {sortableIngredients && sortableIngredients.map((el, i) => <option key={i} value={el} style={{ cursor: 'pointer'}}>{el}</option>)}
              </ListInput>
              <BlockTitle color='teal'>Please choose the weight of the ingredient in grams or milliliters.</BlockTitle>
              <Col className='padding-horizontal'>
                  <Range min={0} max={1000} label={true} step={25} value={0} 
                    scale={true} scaleSteps={10} scaleSubSteps={4} color='teal'
                    onRangeChange={ingredientSelectedGramsHandler}
                  />
              </Col>
            </Block>

            <Block strong className='background-teal-opacity-2'>
              <Row className='display-flex justify-content-end margin-vertical'>
                  <Button 
                    onClick={addIngredient}
                    color='teal' 
                    style={{ width: '60px', height: '60px', marginRight: '50px' }}
                  >
                      <Icon icon='plus_circle_fill' f7='plus_circle_fill' size='60px' color='teal'></Icon>
                  </Button>
              </Row>
            </Block>

            <BlockTitle medium color='teal'>Selected Ingredients</BlockTitle>
            <List dividersIos simpleList strong outline className='list-ingredients'>
              {ingredients && ingredients.map((el, i) => {
                  const title = `${el.name} ${el.weight}${liquidIngredients.includes(el.name) ? 'ml' : 'g'}`;
                  return <ListItem title={title} key={i} className='background-color-teal'>
                    <Button onClick={(e) => removeIngredient(e, i)}>
                      <Icon  slot='media' color='black' icon='smark' f7='xmark' style={{ cursor: 'pointer'  }}/>
                    </Button>
                  </ListItem>
                })
              }
            </List>

        </List>

        <Block strong className='background-teal-opacity-2'>
            <Row className='flex-center-container'>
                <Col width='75'>
                  <Button onClick={(e) => recipeSubmit(e)} disabled={btnAddRecipeIsEnable} fill raised color='teal'>Create Recipe</Button>
                </Col>
            </Row>
        </Block>
      </Page>
    )
};

export default RecipeCreatePage;



