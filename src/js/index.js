
import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Like from "./models/Like";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likeView from "./views/likeView";
import {elements, renderLoader, clearLoader, elementString} from "./views/base";

/** Global state of the app
* - Search object
* - Current recipe object
* - Shopping list object
* - Liked recipes
*/
const state = {};

const controlSearch = async () =>{
  // 1) Get query from view
  const query = searchView.getInput();

  if (query){
  // 2) New search object and add to state
  state.search = new Search(query);

  // 3) Prepare UI for results
  searchView.clearInput();
  searchView.clearResult();
  renderLoader(elements.searchRes);

  try{
    // 4) Search for Recipes
    await state.search.getResutls();

    // 5) Render result on UI
    clearLoader();
    searchView.renderResult(state.search.result)
  }catch(error){
    alert("error has occured while searching recipe");
    clearLoader();
  }
  }
}

elements.searchForm.addEventListener("submit", e =>{
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", e =>{
  const btn = e.target.closest(".btn-inline");
  if(btn){
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResult();
    searchView.renderResult(state.search.result, goToPage);
  }
});

// RECIPE controller
const controlRecipe = async ()=>{
  // Get id from url
  const id = window.location.hash.replace("#", "");

  if(id){
    //Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    //Highlight selected search item
    if(state.search)searchView.highlightSelected(id);

    //Create a new recipe object
    state.recipe = new Recipe(id);

    try{
      //Get recipe data
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      //Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServing();

      //Render recipes
      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.like.isLiked(id));

    }catch(error){
      alert("Error has occured while processing recipe");
      console.log(error);
    }
  }
};

["hashchange", "load"].forEach(event => window.addEventListener(event, controlRecipe));

//LIST CONTROLLER
const controlList = () => {
    // Create a new list IF there in none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// Handling delete and update list item event
elements.shopping.addEventListener("click", e =>{

  const id = e.target.closest(".shopping__item").dataset.itemid;

  // Handling the delete buttons
  if(e.target.matches(".shopping__delete, .shopping__delete *")){

    // Delete from state
    state.list.deleteItem(id);

    //Delete frou UI
    listView.deleteItem(id);

    //Handling the count update
  }else if(e.target.matches(".shopping__count-value")){
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});

//LIKE CONTROLLER
const controlLike = () => {
  if(!state.like) state.like = new Like();
  const currentID = state.recipe.id;

  // User has not yet like current recipe
  if(!state.like.isLiked(currentID)){
    // Add like to the state
    const newLike = state.like.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img,
    );

    // Toggle the like button
    likeView.toggleLikeBtn(true);

    // Add like to UI list
    likeView.renderLike(newLike);
    console.log(state.like);

  // User HAS yet like current recipe
  }else{
    // Removo like to the state
    state.like.deleteLike(currentID);

    // Toggle the like button
    likeView.toggleLikeBtn(false);

    // Remove like from UI list
    likeView.deleteLike(currentID);
    console.log(state.like);
  }
  likeView.toggleLikeMenu(state.like.getnumLike());
};

// Restore liked Recipes

window.addEventListener("load", ()=>{
   state.like = new Like();

   // Restore likes
   state.like.readStorage();

   // Toggle like menu button
   likeView.toggleLikeMenu(state.like.getnumLike());

   // Render the existing Likes
   state.like.like.forEach(like => likeView.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener("click", e =>{
  if(e.target.matches(".btn-decrease, .btn-decrease *")){
    //Decrease button is clicked
    if(state.recipe.servings > 1){
      state.recipe.updateServings("dec");
      recipeView.updateServingIngredients(state.recipe);
    }
  }else if(e.target.matches(".btn-increase, .btn-increase *")){
    //Increase button is clicked
    state.recipe.updateServings("inc ");
    recipeView.updateServingIngredients(state.recipe);
  }else if(e.target.matches(".recipe__btn--add, .recipe__btn--add *")){
    //Add ingredient to shopping list
    controlList();
  }else if(e.target.matches(".recipe__love, .recipe__love *")){
    //Like controller
    controlLike();
  }
});
