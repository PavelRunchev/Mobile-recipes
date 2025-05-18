import React, { useState, useEffect } from 'react';
import { Page, Navbar, List, useStore, LoginScreenTitle, f7ready, BlockTitle } from 'framework7-react';
import RecipeMyModel from '../components/recipeMyModel';

function MyRecipesPage() {
    const [myRecipes, setMyRecipes] = useState([]);
    const [scrollPosition, setScrollPosition] = useState(0);

    const user = useStore('authUser');
    const recipes = useStore('getAllRecipes');
    const isDarkMode = useStore('themeIsDark');

    useEffect(() => {
        f7ready(() => {
           if(recipes != undefined && user != undefined) {
                const onlyuserRecipes = recipes.filter(r => r.creatorUID == user.userUID);
                setMyRecipes(onlyuserRecipes);
           }

           window.addEventListener('scroll', handleScroll, { passive: true });
           return () => { window.removeEventListener('scroll', handleScroll); };
        });
    }, []);

    //
    //for image focus effect lazy loading
    const handleScroll = () => {
        const position = window.pageYOffset;
        setScrollPosition(position);
    };

    return (
        <Page name='my-recipes' >
            <Navbar title='My Recipes' backLink="Back" className={`${isDarkMode ? 'text-color-white' : 'global-color'}`}/>
    
            <div className='block margin-top mb-5'></div>
            <LoginScreenTitle className={`margin-top mb-5 ${isDarkMode ? 'text-color-white' : 'global-color'}`}>Your Recipes</LoginScreenTitle>
            <List >
                {myRecipes && myRecipes.length > 0 
                    ? myRecipes.map(r => <RecipeMyModel key={r.id} recipe={r} scrollPosition={scrollPosition}/>)
                    : <BlockTitle medium className='global-color display-flex justify-content-center align-content-center margin-vertical fw-bold my-5'>No recipes published!</BlockTitle> 
                }
            </List>

      </Page>
    )
}

export default MyRecipesPage;