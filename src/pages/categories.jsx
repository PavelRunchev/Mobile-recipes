import React, { useState, useRef, useEffect } from 'react';
import '../css/categories.css';
import { Col, Page, Navbar, List, ListInput, Block, Button, Icon, Row, useStore, LoginScreenTitle, f7, f7ready } from 'framework7-react';
import store from '../js/store';
import { setCategoryFromDB, removeCategoryByIDFromDB } from '../services/categoryService';

import { capitalLetter } from '../services/variable';
import CategoryModel from '../components/categoryModel';
import Loading from '../components/preloader';
import categoryImage from '../public/recipe-categories-logo.png';

const CategoriesPage = () => {
  const [category, setCategory] = useState('');
  const [isValidCategory, setIsValidCategory] = useState(true);
  const [isDisableBtn, setIsDisableBtn] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useRef(null);

  const categories = useStore('categories');
  const userAuth = useStore('authUser');
  const isDarkMode = useStore('themeIsDark');

  useEffect(() => {
    if(categories) setIsLoading(false);
    else  setIsLoading(true);

    f7ready(async () => {
      if(isValidCategory && category != '' && !categories.some(e => e.name == category)) setIsDisableBtn(false);
      else setIsDisableBtn(true);
    });

  }, [isLoading, isValidCategory, category]);

  function categoryHandler(e) { 
    setCategory(e.target.value); 
    e.target.value.match(capitalLetter) ? setIsValidCategory(true) : setIsValidCategory(false);
  }

  async function addCategory() {
    try {
      if(category != '' && isValidCategory) {
        if(userAuth != undefined && userAuth.roles.includes('Admin')) {
            f7.preloader.show();
            let newCategory = { name: category };
            const currentCategory = await setCategoryFromDB(newCategory);
            toast.current = f7.toast.create({ text: 'Add category successfully!', position: 'top', cssClass: 'text-primary', closeTimeout: 4000 });
            toast.current.open();
            store.dispatch('addCategory', currentCategory);
            setCategory('');
            f7.preloader.hide();
        } else if(userAuth.roles.includes('User')){
          toast.current = f7.toast.create({ text: 'You are not an admin!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
          toast.current.open();
        } else {
          toast.current = f7.toast.create({ text: 'You must log in!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
          toast.current.open();
        }
      } else {
        toast.current = f7.toast.create({ text: 'Invalid format or empty field!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
        toast.current.open();
      }
    } catch(error) {
      console.log(error.message);
      f7.preloader.hide();
    }
  }

  async function removeHandler(e, id) {
      try {
          if(userAuth.roles != undefined && userAuth.roles.some(el => el == 'Admin')) {
            f7.preloader.show();
            const result = await removeCategoryByIDFromDB(id);
            if(result == 'delete is success!') {
              toast.current = f7.toast.create({ text: 'Delete category successfully!', position: 'top', cssClass: 'text-primary', closeTimeout: 4000 });
              toast.current.open();
              store.dispatch('removeCategory', id);
              f7.preloader.hide();
            } else {
              toast.current = f7.toast.create({ text: 'Delete is failed!', position: 'top', cssClass: 'text-primary', closeTimeout: 4000 });
              toast.current.open();
            }
          } else {
            toast.current = f7.toast.create({ text: 'Access denied!', position: 'top', cssClass: 'text-primary', closeTimeout: 4000 });
            toast.current.open();
          }
      } catch(error) {
          console.log(error.message);
      }
  }

  return (
    <Page name='categories'>
      <Navbar title='Categories' className={`${isDarkMode ? 'text-color-white' : 'global-color'}`}/>

      <div className='block margin-top mb-5'></div>
      <LoginScreenTitle className={`margin-top mb-1 ${isDarkMode ? 'text-color-white' : 'global-color'}`}>All Categories</LoginScreenTitle>
      <img  data-src={categoryImage} placeholder={categoryImage} className='lazy lazy-fade-in d-block mx-auto' style={{ width: '170px', height: '150px', borderRadius: '5px' }}/>

      {isLoading ? <Loading /> :
        <List className={`${isDarkMode ? 'background-color-white' : 'background-color-blue'}`}> {categories && categories.map((c) => <CategoryModel key={c.id} category={c} removeHandler={removeHandler}/>)} </List>}

      <LoginScreenTitle className={`margin-top mb-5 ${isDarkMode ? 'text-color-white' : 'global-color'}`}>Category Form</LoginScreenTitle>

        <Block>
            <List strongIos dividersIos insetIos>
              <ListInput
                  onChange={categoryHandler}
                  label='Category' 
                  floatingLabel 
                  type='text' 
                  placeholder='Add Category' 
                  color='blue' 
                  clearButton 
                  info='First letter must be a capital!'
                  value={category}
                  errorMessage='This category is invalid format!'
                  errorMessageForce={isValidCategory ? false : true}
              >
                <Icon icon='demo-list-icon' slot='media' />
            </ListInput>
          </List>
    
            <Row className={`flex-center-container padding-vertical ${isDarkMode ? 'background-color-white' : 'background-color-teal'}`}>
              <Col width='50'>
                <Button fill onClick={addCategory} onTouchStart={addCategory} disabled={isDisableBtn} color='blue'>
                  <span className='color-white'>Add Category</span>
                </Button>
              </Col>
            </Row>
     
        </Block>

    </Page>
  );
}

export default CategoriesPage;


