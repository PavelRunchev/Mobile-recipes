
import HomePage from '../pages/home.jsx';
import AboutPage from '../pages/about.jsx';

import CategoriesPage from '../pages/categories.jsx';

import LogInPage from '../pages/logIn.jsx';
import SignUpPage from '../pages/signUp.jsx';
import ForgotPasswordPage from '../pages/forgot-password.jsx';
import AdminSettingsPage from '../pages/adminSettingsPage.jsx';

import RecipeLatestPage from '../pages/recipeLatest.jsx';
import RecipeFavoritesPage from '../pages/recipeFavorites.jsx';

import MyRecipesPage from '../pages/myRecipes.jsx';

import NotFoundPage from '../pages/404.jsx';

import RecipeCreatePage from '../pages/recipeCreate.jsx';
import RecipeDetailsPage from '../pages/recipeDetails.jsx';
import RecipeUpdatePage from '../pages/recipeUpdate.jsx';

var routes = [
  { path: '/', component: HomePage },
  { path: '/home/', component: HomePage },
  { path: '/about/', component: AboutPage, },

  { path: '/user/sign-up/', component: SignUpPage },
  { path: '/user/log-in/', component: LogInPage },
  { path: '/user/forgot-password/', component: ForgotPasswordPage },
  
  { path: '/categories-recipes/', component: CategoriesPage },
  
  { path: '/recipe/recipe-create/', component: RecipeCreatePage },
  { path: '/recipe/recipe-details/:id/', component: RecipeDetailsPage },
  { path: '/recipe/recipe-update/:id/', component: RecipeUpdatePage },


  { path: '/recipe/latest-recipes/', component: RecipeLatestPage },
  { path: '/recipe/favorite-recipes/', component: RecipeFavoritesPage },
  
  { path: '/user/my-recipes/', component: MyRecipesPage },

  { path: '/user/admin-settings/', component: AdminSettingsPage },

  { path: '(.*)', component: NotFoundPage, },
];

export default routes;
