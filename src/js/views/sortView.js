import View from "./View";

class sortView extends View {
  _parentEl = document.querySelector('.sort-container');

  addHandlerSort(handler) {
    this._parentEl.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn-sort');

      if (!btn) return;

      handler(btn.dataset.sort);
    }); 
  }

  _generateMarkup () {
    return this._data.results.length > 1 
    ? `
      <button class="btn--inline btn-sort" data-sort="duration">Sort by duration ⏰</button>
      <button class="btn--inline btn-sort" data-sort="ingredients">Sort by ingredients 🥫</button>
    ` 
    : '';
  }
}

export default new sortView();