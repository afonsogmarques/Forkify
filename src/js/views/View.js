import icons from 'url:../../img/icons.svg';

export default class View {
  _data;

  constructor() {
    const logo = document.querySelector('.header__logo');
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', function(){
      window.location.href = '/';
    })
  }

  /**
   * Render the received object to the DOM
   * @param { Object | Object[] } data Data to be rendered
   * @param { boolean } [render = true] If false, create markup string instead of rendering to the DOM
   * @returns { undefined | string } A markup string is returned if render = false
   * @this { Object } View instance
   * @author Afonso Marques
   * @todo Nothing to do
   */

  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.displayError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    // empty container
    this._clear();

    // insert html into container
    this._parentEl.insertAdjacentHTML('afterbegin', markup);
  }

  update(data) {
    this._data = data;

    const newMarkup = this._generateMarkup();

    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const curElements = Array.from(this._parentEl.querySelectorAll('*'));

    // updates changed text
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        curEl.textContent = newEl.textContent;
      }
      // updates changed attributes
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }

  _clear() {
    this._parentEl.innerHTML = '';
  }

  renderSpinner() {
    const markup = `
      <div class="spinner">
        <svg>
        <use href="${icons}#icon-loader"></use>
        </svg>
      </div>
      `;
    this._clear();
    this._parentEl.insertAdjacentHTML('afterbegin', markup);
  }

  displayError(message = this._errorMsg) {
    const markup = `
      <div class="error">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;
    this._clear();
    this._parentEl.insertAdjacentHTML('afterbegin', markup);
  }

  displayMessage(message = this._successMsg) {
    const markup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;
    this._clear();
    this._parentEl.insertAdjacentHTML('afterbegin', markup);
  }
}
