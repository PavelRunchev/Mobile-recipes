import React from 'react';
import { Preloader } from 'framework7-react';

function Loading() {
    return (
        <div className='flex-center-container'><Preloader color='teal' /></div>
    )
}

export default Loading;