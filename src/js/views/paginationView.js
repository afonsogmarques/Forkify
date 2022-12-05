import View from './View.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentEl = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentEl.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn--inline');
      
      if (!btn) return;

      const goToPage = +btn.dataset.go_to_page;
      handler(goToPage);
    })
  }

  _generatePageButton(side) {
    const curPage = this._data.page;
    const numPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);
    
    if (!side) {
      return `
        <button data-go_to_page="${curPage - 1}" class="btn--inline pagination__btn--prev">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
          <span>Page ${curPage - 1}</span>
        </button>
        <h3>Page ${curPage}/${numPages}</h3>
        <button data-go_to_page="${curPage + 1}" class="btn--inline pagination__btn--next">
          <span>Page ${curPage + 1}</span>
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </button>
      `;
    };

    if (side === 'right') {
      return `
        <button data-go_to_page="${curPage - 1}" class="hidden btn--inline pagination__btn--prev">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
          <span>Page ${curPage - 1}</span>
        </button>
        <h3>Page ${curPage}/${numPages}</h3>
        <button data-go_to_page="${curPage + 1}" class="btn--inline pagination__btn--next">
          <span>Page ${curPage + 1}</span>
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </button>
      `;
    }

    if (side === 'left') {
      return `
        <button data-go_to_page="${curPage - 1}" class="btn--inline pagination__btn--prev">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
          <span>Page ${curPage - 1}</span>
        </button>
        <h3>Page ${curPage}/${numPages}</h3>
        <button data-go_to_page="${curPage + 1}" class="hidden btn--inline pagination__btn--next">
          <span>Page ${curPage + 1}</span>
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </button>
      `;
    }

    throw Error ('Argument must be either \'left\' or \'right\'.');
  }

  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );
    
    // Page 1, and there are other pages
    if (curPage === 1 && numPages > 1) {
      return this._generatePageButton('right');
    }
    // Last page
    if (curPage === numPages && numPages > 1) {
      return this._generatePageButton('left');
    }

    // Some other page
    if (curPage < numPages) {
      return this._generatePageButton();
    }

    // Page 1, and there are no other pages
    return '';
  }
}

export default new PaginationView();
