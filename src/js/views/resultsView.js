import View from './View.js';
import previewView from './previewView.js';

class ResultsView extends View{
  _parentEl = document.querySelector('.results');
  _errorMsg = "No recipes found! Please try something else";
  _successMsg = 'Start by searching for a recipe or an ingredient. Have fun!';

  _generateMarkup() {
    return this._data
      .map(result => previewView.render(result, false))
      .join('');
  }
}

export default new ResultsView();
