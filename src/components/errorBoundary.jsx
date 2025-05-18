
import React, { useState, useEffect, useRef } from 'react';
import { Page, Navbar, Block, LoginScreenTitle, BlockTitle } from 'framework7-react';
import error500 from '../public/somthenig-went-wrong.png';

function ErrorBoundary(props) {
    const [error, setError] = useState(null);
     const toast = useRef(null);
    
    useEffect(() => {
        // Catch errors thrown by child components
        const handleErrors = (err) => { setError(err); };

        window.addEventListener('error', handleErrors);
        return () => { window.removeEventListener('error', handleErrors); };
    }, [error]);
  
    if (error) {
        alert('Error: ' + error);
        toast.current = f7.toast.create({ text: `Error: ${error}`, position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
        toast.current.open();

        return (
            <Page>
                <Navbar title="Server Error" backLink="Back" color='teal' className='global-color'/>
            
                <div className='block margin-top mb-5'></div>
                <LoginScreenTitle className='global-color margin-top mb-5'>
                    <span className='color-black'>500</span> - Internal Server Error!
                </LoginScreenTitle>
                <img src={error500} className='page-not-found-image lazy lazy-fade-in'/>
                <Block strong>
                    <BlockTitle medium className='text-center color-black'>Sorry...</BlockTitle>
                    <BlockTitle medium className='text-center color-black'>Internal Server Error!</BlockTitle>
                </Block>
            </Page>            
        )
    }
  
    return props.children;
}

export default ErrorBoundary;

