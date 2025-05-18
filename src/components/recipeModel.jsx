import React, { useState, useEffect } from 'react';
import '../css/recipeModel.css';

import { Link, BlockTitle, Card, CardHeader, CardContent, CardFooter, f7ready, useStore, BlockHeader, Icon } from 'framework7-react';

import { FaRegHeart } from 'react-icons/fa6';
import { BsHeartFill } from "react-icons/bs";
import { BsStarHalf } from "react-icons/bs";
import { FaUtensils } from 'react-icons/fa6';

import { LazyLoadImage, trackWindowScroll } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

function RecipeModel({ recipe, scrollPosition, favoriteHandler }) {
    const [favorite, setFavorite] = useState(false);
    let user = useStore('authUser');

    useEffect(() => {
            f7ready(() => {
                if(recipe.favorite && recipe.favorite.includes(user.userUID)) {
                    setFavorite(true);
                  } else {
                    setFavorite(false);
                  }
            });
    }, []);

    function favHandler(e) {
        favoriteHandler(e, recipe, favorite);
        setFavorite(!favorite);
    }

    return (
        <Card outline className='card-recipe-container'>
            <CardHeader className='card-recipe-card-header'>
                <LazyLoadImage
                    className='recipe-model-image'
                    alt='image'
                    effect="blur"
                    src={recipe.recipeImage}
                    placeholderSrc={recipe.recipeImage}
                    wrapperProps = { { style : { conversionDelay : "1s" } } }
                    scrollPosition={scrollPosition}
                    visibleByDefault
                 />
                <BlockHeader className='recipe-title-category'>{recipe.category}</BlockHeader>
                <BlockTitle large className='recipe-title-name'>{recipe.name}</BlockTitle>
            </CardHeader>
    
            <CardContent className='card-recipe-content-container background-color-blue'>
               
                <div>
                    <Icon 
                        icon='chart_bar_alt_fill' 
                        material='chart_bar_alt_fill' 
                        f7='chart_bar_alt_fill' 
                        slot='media' 
                        size='22'
                        className='calories-icon'
                        color='blue'
                    /> 
                    <span><span className='recipe-details-calories'>{recipe.calories}</span> Cal.</span>
                </div>
                <div>
                    <FaUtensils size={18} className='global-color'/> <span className='recipe-model-servings'>{recipe.servings}</span>
                </div>
            </CardContent>

            <CardFooter className='recipe-footer'>
                <div onTouchStart={(e) => favHandler(e)} onClick={(e) => favHandler(e)}>
                    {favorite 
                        ? <div><BsHeartFill color='red' size={24} className='recipe-model-icon-favorite'/></div>  
                        : <div><FaRegHeart color='red' size={24} className='recipe-model-icon-favorite'/></div>
                    }
                </div>
                <Link href={`/recipe/recipe-details/:${recipe.id}/`} className='recipe-link recipe-model-read-more'>Read more</Link>
                <div>
                    <BsStarHalf className='global-color' size={24}/> <span className='recipe-model-rating'>{recipe.rating}</span>
                </div>
            </CardFooter>
        </Card>
    )
}

export default RecipeModel;