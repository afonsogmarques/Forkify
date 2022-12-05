import 'regenerator-runtime/runtime'; // polyfill async await
import 'core-js/stable'; // pollyfill everything else

import * as model from './model.js';
import { MODAL_CLOSE_SEC, SAFETY_WAIT } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import sortView from './views/sortView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

///////////////////////////////////////
const controlRecipes = async function () {
  try {
    // get recipe id from url bar
    const id = window.location.hash.slice(1);

    // return if there is no id
    if (!id) return;

    // render spinner while recipe loads
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1) update bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2) Loading recipe
    await model.loadRecipe(id);

    // 3) Render recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.displayError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    // 1) Get search query from searchView
    const query = searchView.getQuery();
    if (!query) return;

    resultsView.renderSpinner();

    // 2) wait for query results
    await model.loadSearchResults(query);

    // 3) render results
    resultsView.render(model.getSearchResultsPage());

    // 4) render sort buttons
    // sortView.render(model.state.search);

    // 5) render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (goToPage) {
  // 3) render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 4) render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (numOfServings) {
  // update recipe servings (in state)
  model.updateServings(numOfServings);
  // Update the recipe view
  recipeView.update(model.state.recipe);
};

const controlBookmark = function () {
  // 1) Add or remove bookmark
  model.state.recipe.bookmarked
    ? model.removeBookmark(model.state.recipe.id)
    : model.addBookmark(model.state.recipe);

  // 2) Update recipeView
  recipeView.update(model.state.recipe);

  // 3) render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlLoadBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlUpload = async function (newRecipe) {
  try {
    // render spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success Message
    addRecipeView.displayMessage();

    // Re-render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change id in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    wait(MODAL_CLOSE_SEC)
      .then(() => {
        if (addRecipeView.checkWindowOpen()) addRecipeView.toggleWindow();
        return wait(SAFETY_WAIT);
      })
      .then(() => {
        addRecipeView.resetForm();
      });

  } catch (err) {
    console.error(`🪲 ${err}`);
    addRecipeView.displayError(err.message);
  }
};

const wait = function (seconds) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, seconds * 1000);
  });
};

const controlSort = function(criteria) {

}

const init = async function () {
  bookmarksView.addHandlerRender(controlLoadBookmarks);
  // detect hash change in url and show recipe based on id
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlUpload);
  sortView.addHandlerSort(controlSort);
};

init();
