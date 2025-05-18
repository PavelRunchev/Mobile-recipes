import React, { useState, useEffect } from 'react';

import { Page, Navbar, List, useStore, LoginScreenTitle } from 'framework7-react';
import RecipeMyModel from '../components/recipeMyModel';

import favoriteImage from '../public/favorite-recipe.png';

function RecipeFavoritesPage() {
    const [scrollPosition, setScrollPosition] = useState(0);
    const user = useStore('authUser');
    const recipes = useStore('getAllRecipes');
    const isDarkMode = useStore('themeIsDark');
    
    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => { window.removeEventListener('scroll', handleScroll); };
    }, []);
    
    //for image focus effect lazy loading
    const handleScroll = () => {
        const position = window.pageYOffset;
        setScrollPosition(position);
    };
    
    let onlyFavoriteRecipes = [];
    if(recipes != null) {
        for (let r of recipes) {
            if(r.favorite && r.favorite.includes(user.userUID)) 
                onlyFavoriteRecipes.push(r);
                
        }
    }

    return (
        <Page name='favorite-recipes'>
            <Navbar title='Favorite Recipes' className={`${isDarkMode ? 'text-color-white' : 'global-color'}`}/>
    
            <div className='block margin-top mb-5'></div>
            <LoginScreenTitle className={`margin-top ${isDarkMode ? 'text-color-white' : 'global-color'}`}>Favorite Recipes</LoginScreenTitle>
            <img src={favoriteImage} className='create-recipe-logo-image lazy lazy-fade-in'/>

            <List >
                {onlyFavoriteRecipes && onlyFavoriteRecipes.length > 0 
                    ? onlyFavoriteRecipes.map(r => <RecipeMyModel key={r.id} recipe={r} scrollPosition={scrollPosition}/>)
                    : <LoginScreenTitle className='global-color margin-top mb-5'>No Favorite Recipes!</LoginScreenTitle>
                }
            </List>
        </Page>
    )
}

export default RecipeFavoritesPage;