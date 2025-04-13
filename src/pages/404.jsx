import React from 'react';
import { Page, Navbar, Block, LoginScreenTitle, BlockTitle } from 'framework7-react';
import error404 from '../public/error-404.jpg';

const NotFoundPage = () => (
  <Page>
    <Navbar title="Not found" backLink="Back" className='global-color'/>

    <div className='block margin-top mb-5'></div>
    <LoginScreenTitle className='global-color margin-top mb-5'>
      Error &nbsp;
      <span className='color-black'>404!</span>
    </LoginScreenTitle>
    <img src={error404} className='page-not-found-image lazy lazy-fade-in'/>
    <Block strong>
      <BlockTitle medium className='text-center color-black'>Sorry</BlockTitle>
      <BlockTitle medium className='text-center color-black'>Requested content not found!</BlockTitle>
    </Block>
  </Page>
);

export default NotFoundPage;
