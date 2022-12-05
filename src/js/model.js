import { API_URL, API_KEY, RESULTS_PER_PAGE } from './config.js';
// import { AJAX, AJAX } from './helpers.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RESULTS_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;

  return {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image_url,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    // 1) Load recipe
    const data = await AJAX(`${API_URL}/${id}?key=${API_KEY}`);

    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    // Temporary error handling
    console.error(`🪲🪲 ${err} 🪲🪲`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    state.search.page = 1;

    // 1) fetch search results
    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);

    // 2) store results in state
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
  } catch (err) {
    // Temporary error handling
    console.error(`🪲🪲 ${err} 🪲🪲`);
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  let start = (page - 1) * state.search.resultsPerPage; //0;
  let end = page * state.search.resultsPerPage; //9;

  return state.search.results.slice(start, end);
};

export const updateServings = function (numOfServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * numOfServings) / state.recipe.servings;
  });

  state.recipe.servings = numOfServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  // add bookmark to bookmarks array
  state.bookmarks.push(recipe);

  // flag current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const removeBookmark = function (id) {
  // get index of bookmark to be deleted
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);

  // delete bookmark
  state.bookmarks.splice(index, 1);

  // flag current recipe as not bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingArray = Object.entries(newRecipe).filter(entry =>
      entry[0].startsWith('ingredient', 2)
    );

    const ingredients = ingArray
      .reduce((acc, ing) => {
        if (ing[0].endsWith('description')) acc[+ing[0][0] - 1] += ing[1];
        else acc[+ing[0][0] - 1] += ing[1] ? `${ing[1]},` : 'null,';
        return acc;
      }, [])
      .map(ings => ings.split(','))
      .map(ings => [ings.at(0).replace('undefined', ''), ...ings.slice(1)])
      .map(ing => {
        return {
          quantity: ing[0] === '0' || ing[0] === 'null' ? null : +ing[0],
          unit: ing[1] === 'null' ? null : ing[1],
          description: ing[2],
        };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
