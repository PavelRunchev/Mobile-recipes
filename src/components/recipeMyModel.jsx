import React from 'react';
import '../css/recipeMyModel.css';

import { ListItem, useStore, f7 } from 'framework7-react';

import { LazyLoadImage, trackWindowScroll } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

import { FaPlateWheat } from "react-icons/fa6";
import { MdFavorite } from "react-icons/md";
import { MdFavoriteBorder } from "react-icons/md";
import { FaRegCommentAlt } from "react-icons/fa";
import { BsStarHalf } from "react-icons/bs";

function RecipeMyModel({ recipe, scrollPosition }) {
    
    const user = useStore('authUser');
    const contentInstructions = recipe.instructions.split('.').filter(c => c != '' || c != '.').slice(0, 2).map(c => c = c + '.').join();

    return (
        <ListItem
            link={`/recipe/recipe-details/:${recipe.id}/`}
            className='recipe-my-model-list-item background-color-teal'
        >
           

            <div className='recipe-my-model-header'>
                <div className='recipe-my-model-title-container'>
                    <div style={{ fontSize: '14px'}}>{recipe.category}</div>
                    <span> <FaPlateWheat size={18} color='teal'/> {recipe.servings}</span>
                </div>
                <span className='recipe-my-model-title'>{recipe.name}</span> 
                
            </div>

            <div className='recipe-my-model-content'>
                <LazyLoadImage
                    className='recipe-my-model-list-item-image'
                    alt="image"
                    effect="blur"
                    src={recipe.recipeImage}
                    wrapperProps = { { style : { conversionDelay : "1s" } } }
                    scrollPosition={scrollPosition}
                    slot='media'
                />
                <div className='recipe-my-model-content-instructions color-black'>{contentInstructions}..</div>
            </div>


            
                
                
            <div className='recipe-my-model-footer-container'>
                <div><BsStarHalf color='teal' size={18}/> <span className='recipe-model-rating'>{recipe.rating}</span></div>
                
                <div>
                    {recipe.comments && recipe.comments.length > 0 
                        ? <span className='recipe-model-rating mx-1'>{recipe.comments.length}</span>
                        : <span className='recipe-model-rating mx-1'>0</span>} 
                    <FaRegCommentAlt size={16} color='teal'/> 
                </div>

                <div>{recipe.favorite && recipe.favorite.includes(user.userUID) 
                    ? <MdFavorite size={18} color='teal'/>
                    : <MdFavoriteBorder size={18} color='teal'/>}
                </div>
            </div>
            
        </ListItem>
    )
}

export default trackWindowScroll(RecipeMyModel);










