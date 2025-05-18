import React, { useEffect, useRef, useState } from 'react';
import '../css/commentModel.css'
import store from '../js/store';

import { Card, CardContent, CardFooter, Block, useStore, f7 } from 'framework7-react';
import { removeRecipeMessage } from '../services/recipeService';
import { convertDateFromComment } from '../services/DateFormat';

import { TbMessageHeart } from "react-icons/tb";
import { AiFillCloseSquare } from "react-icons/ai";

const anonymousAvatar = 'https://firebasestorage.googleapis.com/v0/b/signin-autumn.appspot.com/o/avatars%2Favatar-anonymous.png?alt=media&token=25565dda-5768-443d-b761-ed68e13ab212'

function CommentModel({ comment, number, currentRecipe }) {
    const isAdmin = useStore('userIsAdmin');
    const toast = useRef(null);

    if(comment.creatorAvatar == undefined || comment.creatorAvatar == '') {
        comment.creatorAvatar = anonymousAvatar;
    }

    async function removeComment(e, id) {
        try {
            if(!isAdmin) {
                toast.current = f7.toast.create({ text: 'You do not have permission to delete the comment!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
                toast.current.open();
                return;
            }

            if(id == undefined) return;

            f7.preloader.show();
            const success = await removeRecipeMessage(currentRecipe ,id);
            if(success == 'Success') {
                store.dispatch('removeComment', currentRecipe, id);
                toast.current = f7.toast.create({ text: 'comment remove successfuly!', position: 'top', cssClass: 'text-primary', closeTimeout: 4000 });
                toast.current.open();
            }
            f7.preloader.hide();
        } catch(error) {
            console.log(error);
            toast.current = f7.toast.create({ text: 'comment remove failed!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
            toast.current.open();
            f7.preloader.hide();
        }
    }

    return (
        <Card outline className='card-recipe-comment-container margin-vertical'>
    
            <CardContent className='card-recipe-comment-inner-container'>
                <span className='card-recipe-header-container'>
                    <TbMessageHeart className='global-color' size={26}/>
                    <Block className='fw-bold'>{comment.creator}</Block>
                    <img  slot="media" src={comment.creatorAvatar} width="64" className='comment-image-avatar-icon'/>
                </span>
                <div style={{ width: '100%'}}>
                    <p className='recipe-message-content'>{comment.content}</p>
                    <Block className='message-image-container'>
                        {comment.messageImages && comment.messageImages.length > 0 
                            ? comment.messageImages.map(image => <img slot="media" key={image.id} src={image.imgUrl} width="180" height="140" className='message-image'/>) 
                            : null
                        }
                    </Block>
                    
                </div>
                {isAdmin && <AiFillCloseSquare onClick={(e) => removeComment(e, comment.id)} onTouchStart={(e) => removeComment(e, comment.id)} size={28} className='message-close-icon global-color'/>}
            </CardContent>

            <CardFooter className='recipe-footer'>
                <div>{convertDateFromComment(new Date(comment.createDate))}</div>
                <div >#{number}</div>
            </CardFooter>
        </Card>
    )
}

export default CommentModel;