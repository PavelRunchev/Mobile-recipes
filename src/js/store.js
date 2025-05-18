
import { createStore } from 'framework7/lite';

const store = createStore({
  state: {
    authUser: {},
    userIsAuth: false,
    userIsAdmin: false,
    categories: [],
    themeIsDark: false,
    chooseCategory: '',
    feedback: [],
    recipes: null,
    currentRecipe: null,
    starRating: 0
  },

  getters: {
    authUser({ state }) {
      return state.authUser;
    },
    
    userIsAuth({ state }) {
      return state.userIsAuth;
    },

    userIsAdmin({ state }) {
      return state.userIsAdmin;
    },

    themeIsDark({ state }) {
      return state.themeIsDark;
    },

    categories({ state }) {
      return state.categories;
    },

    getFeedback({ state }) {
      return state.feedback;
    },

    getAllRecipes({ state }) {
      return state.recipes;
    },

    getCurrentRecipe({ state }) {
      return state.currentRecipe;
    },

    getChooseCategory({ state }) {
      return state.chooseCategory;
    },

    getCurrentStarRating({ state }) {
      return state.starRating;
    },

  },

  actions: {
    addCredentialUser({ state, dispatch }, user) {
      state.authUser = {...{}, ...user};
      dispatch('isAuth', user);
      dispatch('isAdmin', user);
    },

    isAuth({ state}, user) {
      if(user != undefined && user.roles.length > 0)
        state.userIsAuth = user.roles[0] === 'User';
      else
        state.userIsAuth = false;
    },

    isAdmin({ state }, user) {
      if(user != undefined && user.roles.length > 1)
        state.userIsAdmin = user.roles[1] === 'Admin';
      else {
        state.userIsAdmin = false;
      }
    },

    userLogOut({ state }) {
      state.authUser = {};
      state.userIsAuth = false;
      state.userIsAdmin = false;
    },

    setThemeIsDark({ state }, theme) {
      state.themeIsDark = theme;
    },

    changeUserEmail({ state }, newEmail) {
      state.authUser.email = newEmail;
    },

    updateUserAvatar({ state }, updateUser) {
      state.authUser.avatar = updateUser.avatar;
    },

    updateUser({ state, dispatch }, updateUser) {
      state.authUser = {...{}, ...updateUser};
      dispatch('isAuth', updateUser);
      dispatch('isAdmin', updateUser);
    },

    updateUserRating({ state }, updateUser) {
      state.authUser = updateUser;
    },

    addCategories({ state }, categories) {
      state.categories = [...categories];
    },

    addChooseCategory({ state }, category) {
      state.chooseCategory = category;
    },

    addCategory({ state }, category) {
      state.categories = [...state.categories, ...category];
    },

    removeCategory({ state }, id) {
      const withCurrentCategory = state.categories.filter(c => c.id != id);
      state.categories = [...withCurrentCategory];
    },

    getAllFeedbackFromDB({ state}, feedback) {
      state.feedback = [...feedback];
    },

    addAllRecipes({ state }, recipes) {
      state.recipes = [...recipes];
    },

    addRecipe({ state, dispatch }, recipe) {
      if(state.recipes == null)
        state.recipes = [];
      state.recipes = [...state.recipes, ...[recipe]];
      dispatch('updateRecipeInAllRecipes', recipe);
    },

    setCurrentRecipe({ state, dispatch }, recipe) {
      state.currentRecipe = {...{}, ...recipe};
      dispatch('updateRecipeInAllRecipes', recipe);
    },

    updateRecipe({ state }, recipe) {
      state.currentRecipe = recipe;
    },

    setStarRating({ state }, rating) {
      state.starRating = rating;
    },

    removeRecipe({ state }, id) {
      const filterRecipes = state.recipes.filter(c => c.id != id);
      state.recipes = [...filterRecipes];
    },

    updateRecipeInAllRecipes({ state, dispatch }, recipe) {
        for (let i = 0; i < state.recipes.length; i++) {
            if(state.recipes[i].id == recipe.id) {
              state.recipes[i] = {...recipe};
              break;
            }
        }

        dispatch('addAllRecipes', state.recipes);
    },

    removeComment({ state, dispatch }, currentRecipe, commentId) {
      const withoutCurrentComment = currentRecipe.comments.filter(c => c.id != commentId);
      let updateRecipe = currentRecipe;
      updateRecipe.comments = withoutCurrentComment;
      dispatch('setCurrentRecipe', updateRecipe);
    },

    // setAllRecipeComments({ state }, comments) {
    //   if(comments == undefined)
    //     state.recipeComments = [...[], ...[]];
    //   else
    //     state.recipeComments = [...[], ...comments];
    // },

    // addComment({ state, dispatch }, currentRecipe) {
    //   //state.recipeComments = [...state.recipeComments, ...currentRecipe.comments];
    //   dispatch('setCurrentRecipe', currentRecipe);
    // },

  },
});

export default store;
