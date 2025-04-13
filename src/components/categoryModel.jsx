import React from 'react';
import { ListItem, Button, Icon } from 'framework7-react';

function CategoryModel({ category, removeHandler }) {
    return (
        <ListItem  key={category.id} id={category.id} title={category.name} className='category-list-item'>
            <Button onClick={(e) => removeHandler(e, category.id)} className='category-trash-btn'>
                <Icon icon='trash' f7='trash' material='trash' slot='media' color='black' size={22}/>
            </Button>
        </ListItem>
    )
}

export default CategoryModel;