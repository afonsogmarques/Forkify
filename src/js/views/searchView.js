import View from "./View";

class SearchView extends View {
  _parentEl = document.querySelector('.search');
  _searchBar = document.querySelector('.search__field');

  constructor() {
    super();
    this._searchBar.focus();
  }

  getQuery() {
    const query = this._parentEl.querySelector('.search__field').value;
    this._clearInput();
    return query;
  }

  _clearInput() {
    this._parentEl.querySelector('.search__field').value = '';
  }

  addHandlerSearch(handler) {
    this._parentEl.addEventListener('submit', function(e) {
      e.preventDefault();
      handler();
    });
  }
}

export default new SearchView();