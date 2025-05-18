import React, { useRef, useState, useEffect } from 'react';
import '../css/recipeUpdate.css';
import { Page, Navbar, List, ListInput, ListItem, BlockTitle, Row, 
  Button, Range, Block, useStore, LoginScreenTitle, Col, f7, Icon
} from 'framework7-react';

import store from '../js/store';
import { capitalLetter, NumberPattern, PreparationPattern, imagePattern, VideoIdPattern } from '../services/variable';

import { updateRecipeInDB } from '../services/recipeService';
import { checkCurrentImageInUsedToStorage, setRecipeImageToStorage } from '../services/recipeStorage';
import { ingredientsData, liquidIngredients } from '../services/variable';

import updateImage from '../public/update-form.png';

function recipeUpdatePage({ f7route, f7router }) {
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
  
  const toast = useRef(null);
  const currentRecipe = useStore('getCurrentRecipe');
  let categories = useStore('categories');
  let user = useStore('authUser');
  const isAdmin = useStore('userIsAdmin');
  const isDarkMode = useStore('themeIsDark');


  useEffect(() => {
      setCategorySelected(currentRecipe.category);
      setIngredients(currentRecipe.ingredients)
  }, []);

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
    e.target.value.length > 20 && e.target.value.length < 20000 ? setIsValidInstructions(true) : setIsValidInstructions(false);
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
      e.preventDefault();

      if(user.userUID == undefined) {
        toast.current = f7.toast.create({ text: 'Log in required!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
        toast.current.open();
        return;
      }


      const isUserCredential = currentRecipe.creatorUID === user.userUID;

      if(isUserCredential || isAdmin) {
          try {
              f7.preloader.show();
              let result = false;
              //if recipeImage is null, when no change, is old valie e access!
              if(recipeImage != null) {
                  //check that current image is save in Storage!
                  result = await checkCurrentImageInUsedToStorage(recipeImage);                
              }

              let url = null;
              //update new image in Storage
              if(recipeImage != null && !result) {
                url = await setRecipeImageToStorage(recipeImage);
              }

              const updateRecipe = { 
                  recipeId: currentRecipe.recipeId,
                  category: categorySelected,
                  name: recipeName || currentRecipe.name,
                  calories: calories || currentRecipe.calories,
                  preparation: preparation || currentRecipe.preparation,
                  cookTime: cookTime || currentRecipe.cookTime,
                  instructions: instructions || currentRecipe.instructions,
                  recipeImage: url != null ? url[0] : currentRecipe.recipeImage,
                  creatorUID: user.userUID,
                  servings: servings || currentRecipe.servings,
                  rating: currentRecipe.rating || 0,
                  sharing: currentRecipe.sharing || false,
                  date: currentRecipe.date,
                  comments: currentRecipe.comments || [],
                  ingredients: ingredients || currentRecipe.ingredients,
                  recipeImages: currentRecipe.recipeImages,
                  following: currentRecipe.following || [],
                  recipeVideoId: videoId || currentRecipe.recipeVideoId || '',
                  id: currentRecipe.id
              };

              await updateRecipeInDB(updateRecipe);
              store.dispatch('setCurrentRecipe', updateRecipe);
              toast.current = f7.toast.create({ text: 'Update recipe successfully!', position: 'top', cssClass: 'text-primary', closeTimeout: 4000 });
              toast.current.open();
              f7.tab.show('#view-home');
              f7router.navigate(`/home/`);
              //remove all inputs fields after update recipe
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
              setVideoId('');
              setIsValidVideoId(true);
              f7.preloader.hide();
        } catch(error) {
            console.log(error.message);
            f7.preloader.hide();
        }
    } else {
        toast.current = f7.toast.create({ text: 'You are not authorized!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
        toast.current.open();
    }
  }

  return (
      <Page name='update-recipe'>
        <Navbar title='Update Recipe' backLink='Back' color={`${isDarkMode ? 'yellow' : 'black'}`} />

        <div className='block margin-top mb-5'></div>
        <LoginScreenTitle className='margin-top mb-1'>Update Recipe Form</LoginScreenTitle>
         <img src={updateImage} className='create-recipe-logo-image lazy lazy-fade-in'/>
       

        <List outlineIos strongIos >
            <ListInput 
              onChange={categorySelectedHandler} 
              label='Categories' 
              type='select' 
              name='categories' 
              placeholder='Please choose...' 
              color='yellow' 
              className={`${isDarkMode ? 'background-color-white' : 'background-color-yellow'} ${isDarkMode ? 'color-white' : 'color-black'}`} 
              id='update-form-select'
              defaultValue={currentRecipe.category}
            >
                {categories && categories.map(c => <option className={`${isDarkMode ? 'color-white' : 'color-black'}`} key={c.id} value={c.name}>{c.name}</option>)}
            </ListInput>

            <ListInput 
                onChange={recipeNameHandler}
                label='Recipe Name' 
                name='name' 
                type='text' 
                placeholder={currentRecipe.name}
                color='yellow'
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
                placeholder={currentRecipe.calories}
                info='The calories are a number in Cal!'
                color='yellow'
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
                placeholder={currentRecipe.preparation}
                color='yellow'
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
                placeholder={currentRecipe.preparation}
                color='yellow'
                validate
                info='Valid cook time means to enter minutes for the recipe to be prepared, example -> 102 mins'
                className='input-field no-margin'
                value={cookTime}
                errorMessage='The cook time is invalid!'
                errorMessageForce={isValidCookTime ? false : true}        
            ></ListInput>
            
            <ListInput 
                onChange={instructionsHandler}
                label='Preparation instruction is resizeble!' 
                type='textarea' 
                placeholder={currentRecipe.instructions} 
                color='yellow'
                info='Min length 20 and Max length is 20000 symbils!'
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
                placeholder={currentRecipe.servings}
                info='The servings is number from 1 to 8!'
                color='yellow'
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
                    placeholder={currentRecipe.recipeImage}
                    color='yellow'
                    validate
                    info='Enter recipe image png or jpg format!'
                    className='input-field update-background-color no-margin'
                    errorMessage='This recipe image format is invalid!'
                    errorMessageForce={isValidRecipeImage ? false : true}
            >
              <Icon icon='cloud_upload' material='cloud_upload' f7='cloud_upload' slot='media' color='yellow' size='40' className='margin-right'/>
            </ListInput>

            <div className='padding-left'>Example video Id: "https://www.youtube.com/embed/<span className='global-bold admin-color'>TnRcSkusmMg</span>" &lt;- require ID!</div>
            <ListInput 
                onChange={videoIdHandler}
                label='Recipe Video' 
                name='video' 
                type='text' 
                placeholder={currentRecipe.recipeVideoId} 
                color='yellow'
                validate
                info='Recipe video require only ID not url!'
                className='input-field no-margin'
                value={videoId}
                errorMessage='Youtube ID is invalid!'
                errorMessageForce={!isValidVideoId ? true : false}
            ></ListInput>
            
        </List>
            
        <BlockTitle className={`${isDarkMode ? 'color-yellow' : 'color-black'}`}>Recipe Ingredients</BlockTitle>
        {/* Ingredients inputs or select */}
        <List outlineIos dividersIos strong  color='yellow' style={{ listStyle: 'none' }} >
            <Block>

              <ListInput 
                onChange={ingredientSelectedHandler} 
                label='Please choose ingredient' 
                type='select' 
                name='ingredients' 
                placeholder='Please choose ingredient' 
                color='yellow' 
                id='update-recipe-ingredient-select'
              >
                  {sortableIngredients && sortableIngredients.map((el, i) => <option key={i} value={el} style={{ cursor: 'pointer'}}>{el}</option>)}
              </ListInput>
              <BlockTitle className={`${isDarkMode ? 'color-yellow' : 'color-black'}`}>Please choose the weight of the ingredient in grams or milliliters.</BlockTitle>
              <Col className='padding-horizontal'>
                  <Range min={0} max={1000} label={true} step={25} value={0} 
                    scale={true} scaleSteps={10} scaleSubSteps={4} color='yellow'
                    onRangeChange={ingredientSelectedGramsHandler}
                  />
              </Col>
            </Block>

            <Block strong className={`${isDarkMode ? 'background-color-white' : 'background-color-yellow'}`}>
              <Row className='display-flex justify-content-end margin-vertical'>
                  <Button 
                    onClick={addIngredient}
                    color='yellow' 
                    style={{ width: '60px', height: '60px', marginRight: '50px' }}
                  >
                      <Icon icon='plus_circle_fill' f7='plus_circle_fill' size='60px' color='yellow'></Icon>
                  </Button>
              </Row>
            </Block>

            <BlockTitle medium className={`${isDarkMode ? 'color-yellow' : 'color-black'}`}>Selected Ingredients</BlockTitle>
            <List dividersIos simpleList strong outline className='list-ingredients'>
              {ingredients && ingredients.map((el, i) => {
                  const title = `${el.name} ${el.weight}${liquidIngredients.includes(el.name) ? 'ml' : 'g'}`;
                  return <ListItem title={title} key={i} className={`${isDarkMode ? 'color-yellow' : 'color-black'} ${isDarkMode ? 'background-color-white' : 'background-color-yellow'}`}>
                    <Button onClick={(e) => removeIngredient(e, i)} onTouchStart={(e) => removeIngredient(e, i)}>
                      <Icon  slot='media' color={`${isDarkMode ? 'yellow' : 'black'}`} icon='smark' f7='xmark' style={{ cursor: 'pointer'  }}/>
                    </Button>
                  </ListItem>
                })
              }
            </List>

        </List>

        <Block strong className={`${isDarkMode ? 'background-color-white' : 'background-color-yellow'}`}>
            <Row className='flex-center-container'>
                <Col width='75'>
                  <Button onClick={(e) => recipeSubmit(e)} onTouchStart={(e) => recipeSubmit(e)} fill raised className='color-black background-color-yellow-2'>Save Changes</Button>
                </Col>
            </Row>
        </Block>
      </Page>
    )
};

export default recipeUpdatePage;



