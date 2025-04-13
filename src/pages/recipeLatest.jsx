import React, { useState, useEffect } from 'react';
import { Page, Navbar, List, useStore, LoginScreenTitle } from 'framework7-react';
import RecipeMyModel from '../components/recipeMyModel';

function RecipeLatestPage() {
  const [scrollPosition, setScrollPosition] = useState(0);
    
  const user = useStore('authUser');
  let recipes = useStore('getAllRecipes');
  
  useEffect(() => {

      if(recipes != null)
          setAllRecipes(recipes);

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => { window.removeEventListener('scroll', handleScroll); };
  }, []);
  
  //
  //for image focus effect lazy loading
   const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
  };

  let lastRecipes = [];
  if(recipes != null) {
      for (let i = 0; i < recipes.length; i++) {
          const r = recipes[i];
          recipes[i].timestamp = Date.parse(r.date);
      }

      lastRecipes = recipes.sort((a, b) => b.timestamp - a.timestamp);
  }

  return (
      <Page name='latest-recipes'>
          <Navbar title='Latest Recipes' className='global-color'/>
  
          <div className='block margin-top mb-5'></div>
          <LoginScreenTitle className='global-color margin-top mb-5'>Latest Recipes</LoginScreenTitle>
          <List >
              {lastRecipes && lastRecipes.length > 0 
                  ? lastRecipes.map(r => <RecipeMyModel key={r.id} recipe={r} scrollPosition={scrollPosition}/>)
                  : <LoginScreenTitle className='global-color margin-top mb-5'>No Favorite Recipes!</LoginScreenTitle>
              }
          </List>
      </Page>
  )
}

export default RecipeLatestPage;