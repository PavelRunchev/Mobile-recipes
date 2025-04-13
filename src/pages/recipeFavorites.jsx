import React, { useState, useEffect } from 'react';

import { Page, Navbar, List, useStore, LoginScreenTitle } from 'framework7-react';
import RecipeMyModel from '../components/recipeMyModel';

function RecipeFavoritesPage() {
    const [scrollPosition, setScrollPosition] = useState(0);
    const user = useStore('authUser');
    const recipes = useStore('getAllRecipes');

    
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
            <Navbar title='Favorite Recipes' className='global-color'/>
    
            <div className='block margin-top mb-5'></div>
            <LoginScreenTitle className='global-color margin-top mb-5'>Favorite Recipes</LoginScreenTitle>

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