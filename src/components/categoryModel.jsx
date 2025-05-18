import React from 'react';
import { ListItem, Button, Icon, useStore } from 'framework7-react';

function CategoryModel({ category, removeHandler }) {
    const isDarkMode = useStore('themeIsDark');
    return (
        <ListItem  key={category.id} id={category.id} title={category.name} className='category-list-item color-black'>
            <Button onClick={(e) => removeHandler(e, category.id)} onTouchStart={(e) => removeHandler(e, category.id)} className='category-trash-btn'>
                <Icon icon='trash' f7='trash' material='trash' slot='media' className='color-black' size={22}/>
            </Button>
        </ListItem>
    )
}

export default CategoryModel;