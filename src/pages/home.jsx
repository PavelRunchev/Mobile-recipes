import React, { useEffect, useState, useRef } from 'react';
import 'react-lazy-load-image-component/src/effects/blur.css';

import { Page, Navbar, NavLeft, NavTitle, NavTitleLarge, NavRight, Link, Block, BlockTitle,
  List, ListItem, Button, useStore, Searchbar, f7ready, f7 } from 'framework7-react';

import store from '../js/store';
import { FaConciergeBell } from 'react-icons/fa';
import { GrPowerReset } from "react-icons/gr";

import RecipeModel from '../components/recipeModel';
import Loading from '../components/preloader';
import loading from '../public/loading.gif';
import { updateRecipeInDB } from '../services/recipeService';

import { trackWindowScroll } from 'react-lazy-load-image-component';

import mainLogoIcon from '../public/recipe-icon-logo.png';
import mainLogoImage from '../public/main-logo.png';

function HomePage() {
    const [searchRecipes, setSearchRecipes] = useState(null);
    const [scrollPosition, setScrollPosition] = useState(0);
  
    const toast = useRef(null);
  
    let user = useStore('authUser');
    let allRecipes = useStore('getAllRecipes');
    let recipes = useStore('getAllRecipes');
    let chooseCategory = useStore('getChooseCategory');
    const isAuth = useStore('userIsAuth');
    const isDarkMode = useStore('themeIsDark');

    useEffect(() => {
      f7ready(async () => {
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => { window.removeEventListener('scroll', handleScroll); };
      });
    }, [scrollPosition]);

    //
    //for image focus effect lazy loading
    const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
    };
    //end lazy loading
    //

    function searchRecipesHandler(e) {
      if(e.target.value == ''){
        setSearchRecipes(null);
      } else {
        //add if sharing is true!!!
        const searchArray = allRecipes
          .filter(r => r.name.toLocaleLowerCase().includes(e.target.value.toLocaleLowerCase()));
        setSearchRecipes(searchArray);
        store.dispatch('addChooseCategory', '');
      }
    }

    function resetAllRecipesHandler(e) {
      e.preventDefault();

      toast.current = f7.toast.create({ text: 'All recipes were reset!', position: 'top', cssClass: 'text-info', closeTimeout: 4000 });
      toast.current.open();
      setSearchRecipes(allRecipes);
      store.dispatch('addChooseCategory', '');
      document.querySelector('.input-with-value').value = '';
    }

    async function favoriteHandler(e, recipe, favorite) {
      let updateRecipe = recipe;
      if(updateRecipe.favorite == undefined || updateRecipe.favorite == null)
          updateRecipe.favorite = [];

      if(favorite && updateRecipe.favorite.includes(user.userUID)) {
          const filterFavorite = updateRecipe.favorite.filter(f => f != user.userUID);
          updateRecipe.favorite = filterFavorite;
      } else {
          updateRecipe.favorite.push(user.userUID);
      }

      await updateRecipeInDB(updateRecipe);
      store.dispatch('updateRecipe', updateRecipe);
      store.dispatch('updateRecipeInAllRecipes', updateRecipe);
  }

  
  if(searchRecipes != null) {
    recipes = searchRecipes;
  }
  
  if(chooseCategory != undefined && chooseCategory != '') {
    recipes = recipes.filter(r => r.category == chooseCategory);
  }

  const showAllSharingRecipes = recipes == undefined 
      ? <Loading /> 
      : recipes
        .sort((a, b) => b.rating - a.rating)
        .map(r => r.sharing && <RecipeModel recipe={r} key={r.id} scrollPosition={scrollPosition} favoriteHandler={favoriteHandler}/>);
  
  
  return (
    <Page name="home" className='home'>
      {/* Top Navbar */}
      <Navbar large sliding={false}>
        <NavLeft >
          <Link iconIos="f7:menu" iconAurora="f7:menu" iconMd="material:menu" panelOpen="left" className={`${isDarkMode ? 'text-color-white' : 'global-color'}`}/>
        </NavLeft>
        <NavTitle sliding className={`${isDarkMode ? 'text-color-white' : 'global-color'}`}>
          
          The Best Recipes
        </NavTitle>
        <NavRight>
          {isAuth && <Link iconIos="f7:settings" iconAurora="f7:settings" iconMd="material:settings" panelOpen="right" className={`${isDarkMode ? 'text-color-white' : 'global-color'}`}/>}
        </NavRight>
        <NavTitleLarge className={`${isDarkMode ? 'text-color-white' : 'global-color'}`}>
          <img  data-src={mainLogoImage} placeholder={loading} className='lazy lazy-fade-in main-logo-image'/>
        </NavTitleLarge>
      </Navbar>

      <Searchbar onChange={searchRecipesHandler}
          disableButtonText='Cancel'
          placeholder='Search Recipes'
          clearButton={true}
          color='blue'
          className={`nav-search-input`}
      ></Searchbar>

      {/* Page content */}
      <Block strong className={`${isDarkMode ? 'background-color-white' : 'background-color-blue'}`}>
          <BlockTitle medium >
            {/* <FaConciergeBell size={26} className='main-icon-recipes global-color'/>  */}
            <img  data-src={mainLogoIcon} placeholder={loading} className='lazy lazy-fade-in main-logo-image margin-left'/>
            <span className={`main-recipes-title text-color-black`}>All <span className='global-color global-underline'>recipes</span> that are shared!</span>
          </BlockTitle>
          <List dividersIos simpleList strong inset>
            <ListItem medium title="Reset recipes" className={`${isDarkMode ? 'color-white' : 'color-black'}`}>
              <Button fill color='blue' onClick={(e) => resetAllRecipesHandler(e)}><GrPowerReset className='margin-right color-white'/> <span className='color-white margin-right'>Reset</span></Button>
            </ListItem>
          </List>
        </Block>

      <List>

      {allRecipes != null && allRecipes.length == 0 
          ? <BlockTitle medium className='global-color display-flex justify-content-center align-content-center margin-vertical fw-bold my-5'>No recipes shared!</BlockTitle> 
          : searchRecipes != null && searchRecipes.length == 0 
            ? <BlockTitle medium className='global-color display-flex justify-content-center align-content-center margin-vertical fw-bold my-5'>No Matches Recipes!</BlockTitle> 
            : showAllSharingRecipes
      }
      </List>

     
    </Page>
  )
};

export default trackWindowScroll(HomePage);