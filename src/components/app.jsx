import React, { useState, useEffect, useRef } from 'react';
import { getDevice }  from 'framework7/lite-bundle';
import { f7, f7ready, App, Views, View, Toolbar, Link } from 'framework7-react';
import cordovaApp from '../js/cordova-app';

import routes from '../js/routes';
import store from '../js/store';

import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { getAuthUserFromRealtimeDB, getAllFeedbackFromRealtimeDB, userIsAuth, userIsAdmin } from '../services/userServices';
import { getAllCategoriesFromDB } from '../services/categoryService';
import { getAllRecipesFromDB } from '../services/recipeService';

import LeftPanel from './left-panel';
import RightPanel from './right-panel';
import HomePage from '../pages/home.jsx';

import ErrorBoundary from './errorBoundary';

const MyApp = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [user, setUser] = useState(null);
    const toast = useRef(null);

    const device = getDevice();
    // Framework7 Parameters
    const f7params = {
        name: 'My App', // App name
        theme: 'auto', // Automatic theme detection
        id: 'io.framework7.myapp', // App bundle ID
        // App store
        store: store,
        // App routes
        routes: routes,

        // Input settings
        input: {
          scrollIntoViewOnFocus: device.cordova && !device.electron,
          scrollIntoViewCentered: device.cordova && !device.electron,
        },
        // Cordova Statusbar settings
        statusbar: {
          iosOverlaysWebView: true,
          androidOverlaysWebView: false,
        },
    };

    const alertLoginData = () => {
      f7.dialog.alert('Username: ' + username + '<br>Password: ' + password, () => {
        f7.loginScreen.close();
      });
    }

    f7ready(() => {
      // Init cordova APIs (see cordova-app.js)
      if (f7.device.cordova) {
        cordovaApp.init(f7);
      }

      // Call F7 APIs here
    });

    useEffect(async () => {
      f7ready(async () => {
          try {
              const categoriesDB = await getAllCategoriesFromDB();
              if(categoriesDB != undefined) {
                  store.dispatch('addCategories', categoriesDB);
              }
              const recipesDB = await getAllRecipesFromDB();
              if(recipesDB != undefined) {
                  store.dispatch('addAllRecipes', recipesDB);
              }
              const feedbackfromDB = await getAllFeedbackFromRealtimeDB();
              if(feedbackfromDB != undefined) {
                  store.dispatch('getAllFeedbackFromDB', feedbackfromDB);
              }
          } catch(error) {
              console.log(error);
          }
      });
        const unsubscribe = auth.onAuthStateChanged(async (userCredential) => { 
            if(userCredential == null) return;
            
            if(userCredential.email && userCredential.accessToken) {
              let userFromRealtimeDB = await getAuthUserFromRealtimeDB(userCredential.uid);
              if(Object.keys(userFromRealtimeDB).length == 0){
                userFromRealtimeDB.roles = ['User', 'Anonymous'];
                userFromRealtimeDB.avatar = 'https://firebasestorage.googleapis.com/v0/b/signin-autumn.appspot.com/o/avatars%2Favatar-anonymous.png?alt=media&token=25565dda-5768-443d-b761-ed68e13ab212';
                userFromRealtimeDB.recipes = [];
                userFromRealtimeDB.gender = 'Male';
              }

              const currentUser = { userUID: userCredential.uid, email: userCredential.email, accessToken: userCredential.accessToken };
              const authUser = Object.assign({}, currentUser, userFromRealtimeDB);
              store.dispatch('addCredentialUser', authUser);
              setUser(authUser);
            }
        });

        return unsubscribe;
    }, []);

    function changeDarkMode(e) {
      darkMode ? setDarkMode(false) : setDarkMode(true);
      setTimeout(() => {
        store.dispatch('setThemeIsDark', darkMode);
      }, 100);
    }

    //when click current category from left panel
    function getRecipesByCategory(e, content) { store.dispatch('addChooseCategory', content); }


    async function logOutHandler(e) {
        try {
            f7.preloader.show();
            if(user != null) {
                await signOut(auth);
                toast.current = f7.toast.create({ text: 'Logout successfully!', position: 'top', cssClass: 'text-success', closeTimeout: 4000 });
                toast.current.open();
            
                store.dispatch('userLogOut');
                setUser(null);
                f7.preloader.hide();
            }
        } catch(error) {
          console.log(error);
          f7.preloader.hide();
          toast.current = f7.toast.create({ text: 'Logout is failed!', position: 'top', cssClass: 'text-danger', closeTimeout: 4000 });
          toast.current.open();
        }
    }

    console.log(darkMode)

  return (
    <ErrorBoundary>
    <App { ...f7params }  themeDark={darkMode ? true : false}>

          <LeftPanel getRecipesByCategory={getRecipesByCategory}/>
          {userIsAuth && <RightPanel changeDarkMode={changeDarkMode} logOutHandler={logOutHandler}/>}

          <HomePage />

          {/* Views/Tabs container */}
          <Views tabs className="safe-areas" colorTheme='teal'>
            {/* Tabbar for switching views-tabs */}
            <Toolbar tabbar labels bottom color='teal'>
              <Link tabLink="#view-home" tabLinkActive iconIos="f7:restaurant_menu" iconAurora="f7:restaurant_menu" iconMd="material:restaurant_menu" text="All Recipes" />
              {userIsAdmin(user) && <Link tabLink='#view-categories' iconIos='f7:view_list' iconAurora='f7:view_list' iconMd='material:view_list' text='Categories' />}
              {userIsAuth(user) && <Link tabLink='#view-createRecipe' iconIos='f7:add_circle' iconAurora='f7:add_circle' iconMd='material:add_circle'  text='Create Recipes' />}
            
              {userIsAuth(user) && <Link tabLink='#view-latestRecipes' iconIos='f7:restaurant' iconAurora='f7:restaurant' iconMd='material:restaurant' text='latest recipes' />}
              {userIsAuth(user) && <Link tabLink='#view-favoriteRecipes' iconIos='f7:dining' iconAurora='f7:dining' iconMd='material:dining' text='Favorite' />}
            
              {!userIsAuth(user) && <Link tabLink='#view-log-in' iconIos='f7:person_badge_plus_fill' iconAurora='f7:person_badge_plus_fill' iconMd='material:verified_user' text='Log In' />}
              {!userIsAuth(user) && <Link tabLink='#view-sign-up' iconIos='f7:person_badge_plus_fill' iconAurora='f7:person_badge_plus_fill' iconMd='material:person_add' text='Sign Up' />}
            </Toolbar>

            {/* Your main view/tab, should have "view-main" class. It also has "tabActive" prop */}
            <View id="view-home" main tab tabActive url="/" />

            {/* Categories View */}
            <View id='view-categories' name='categories' tab url='/categories-recipes/' />

            {/* Add Recipe View */}
            <View id='view-createRecipe' name='create-recipe' tab url='/recipe/recipe-create/' />

            {/* Latest Recipe View */}
            <View id='view-latestRecipes' name='latest-recipes' tab url='/recipe/latest-recipes/' />

            {/* Favorite Recipe View */}
            <View id='view-favoriteRecipes' name='favorite-recipes' tab url='/recipe/favorite-recipes/' />

            {/* Sign Up View */}
            <View id='view-sign-up' name='sign-up' tab url='/user/sign-up/' />

            {/* Sign In View */}
            <View id='view-log-in' name='log-in' tab url='/user/log-in/' />

          </Views>

      </App>
    </ErrorBoundary>
  )
}
export default MyApp;
