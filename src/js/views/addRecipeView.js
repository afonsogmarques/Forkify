import View from './View.js';
import icons from 'url:../../img/icons.svg';

class AddRecipeView extends View {
  _parentEl = document.querySelector('.upload');
  _successMsg = 'Recipe was successfuly uploaded!';
  _units = ['g', 'oz', 'l'];

  _addIngBtn = document.querySelector('.btn__add--ingredient');
  _ingredients = 0;

  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');

  constructor() {
    super();
    this._addHandlerToggleWindow();
    this._addHandlerAddIngredient();
    this._addHandlerRemoveIngredient();
  }

  checkWindowOpen() {
    return ![this._overlay, this._window].every(el =>
      el.classList.contains('hidden')
    );
  }

  toggleWindow() {
    [this._overlay, this._window].forEach(el => el.classList.toggle('hidden'));
  }

  _addHandlerToggleWindow() {
    [this._btnOpen, this._btnClose].forEach(btn => {
      btn.addEventListener('click', () => this.toggleWindow());
    });
  }

  _generateInputErr(message, name, elementType = 'input') {
    // Create error message element
    const p = document.createElement('p');
    p.classList.add('input--error');
    p.innerHTML = message;

    // select corresponding input
    const input = Number.isFinite(+name[0])
      ? this._parentEl.querySelector(`${elementType}[name="${name}"]`)
          .parentElement
      : this._parentEl.querySelector(`${elementType}[name="${name}"]`);

    // Delete previous error message it if it already exists
    if (input.nextElementSibling?.classList.contains('input--error'))
      input.parentNode.removeChild(input.nextSibling);

    // render new error message
    input.after(p);
  }

  _validateURL(stringURL) {
    try {
      const url = new URL(stringURL);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch (err) {
      return false;
    }
  }

  _validateImage(stringURL) {
    return /\.(jpg|jpeg|png|webp)$/.test(stringURL);
  }

  _checkInputs(data) {
    let anyError = false;

    if (data.title.length < 3) {
      this._generateInputErr('Title must have at least 3 characters!', 'title');
      anyError = true;
    }
    if (!this._validateURL(data.sourceUrl)) {
      this._generateInputErr(
        'Please enter a valid URL. <em>https://example.com</em>',
        'sourceUrl'
      );
      anyError = true;
    }
    if (!this._validateURL(data.image)) {
      this._generateInputErr(
        'Please enter a valid URL. <em>https://example.com</em>',
        'image'
      );
      anyError = true;
    }
    if (data.publisher.length < 3) {
      this._generateInputErr(
        'Publisher must have at least 3 characters!',
        'publisher'
      );
      anyError = true;
    }
    if (!Number.isFinite(+data.cookingTime) || +data.cookingTime < 1) {
      this._generateInputErr(
        'Prep time must be a number higher than 0',
        'cookingTime'
      );
      anyError = true;
    }
    if (!Number.isFinite(+data.servings) || +data.servings < 1) {
      this._generateInputErr(
        'Servings must be a number higher than 0',
        'servings'
      );
      anyError = true;
    }

    const renderIgredientErrors = function (...names) {
      [...names].forEach(name => {
        const ings = Object.entries(data)
          .filter(el => el[0].startsWith('ingredient', 2) && el[1])
          .filter(el => el[0].endsWith(name));

        ings.forEach(ing => {
          if (ing[1] && name === 'quantity') {
            if (+ing[1] < 0 || !/^\d+$/.test(ing[1])) {
              this._generateInputErr(
                `${
                  name[0].toUpperCase() + name.slice(1)
                } must be a positive number or 0`,
                `${ing[0][0]}-ingredient--${name}`
              );

              anyError = true;
            }
          }

          if (ing[1] && name === 'unit') {
            if (!this._units.includes(ing[1])) {
              this._generateInputErr(
                `Invalid ${name}`,
                `${ing[0][0]}-ingredient--${name}`,
                'select'
              );

              anyError = true;
            }
          }

          if (ing[1] && name === 'description') {
            if (ing[1].length < 3) {
              this._generateInputErr(
                `${
                  name[0].toUpperCase() + name.slice(1)
                } must have at least 3 characters`,
                `${ing[0][0]}-ingredient--${name}`
              );

              anyError = true;
            }
          }
        });
      });
    }.bind(this);

    renderIgredientErrors('quantity', 'unit', 'description');

    return anyError;
  }

  _clearErrors() {
    const els = this._parentEl.querySelectorAll('.input--error');
    els.forEach(el => el.remove());
  }

  _addHandlerAddIngredient() {
    this._addIngBtn.addEventListener(
      'click',
      function () {
        const markup = `
          <label>New ingredient</label>
          <div class="ingredient--container-${this._ingredients + 1}">
            <div class="ingredient--container">
              <input
                type="number"
                name="${this._ingredients + 1}-ingredient--quantity"
                placeholder="0"
              />
              <select name="${this._ingredients + 1}-ingredient--unit">
                <option value="" selected>-</option>
                <option value="g">g</option>
                <option value="oz">Oz</option>
                <option value="L">L</option>
              </select>
              <input
                required
                type="text"
                class="description"
                name="${this._ingredients + 1}-ingredient--description"
                placeholder="Avocado"
              />
              <button type="button" style="margin: 0; padding: 0 2rem" class="btn btn__remove--ingredient" data-remove="${this._ingredients + 1}">X</button>
            </div>
          </div>
        `;

        this._ingredients++;
        this._addIngBtn.insertAdjacentHTML('beforebegin', markup);
        if (this._ingredients >= 6) return this._addIngBtn.remove();
      }.bind(this)
    );
  }

  _addHandlerRemoveIngredient() {
    this._parentEl.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn__remove--ingredient');

      if (!btn) return;

      const currentIng = this._parentEl.querySelector(`.ingredient--container-${btn.dataset.remove}`);

      currentIng.previousElementSibling.remove();
      currentIng.remove();

      if (this._ingredients <= 6) this._parentEl.querySelector('.upload__column__2').append(this._addIngBtn);

      this._ingredients--;
    }.bind(this));
  }

  addHandlerUpload(handler) {
    this._parentEl.addEventListener(
      'submit',
      function (e) {
        e.preventDefault();

        this._clearErrors();

        const dataArr = [...new FormData(this._parentEl)];
        const data = Object.fromEntries(dataArr);

        if (!this._checkInputs(data)) handler(data);
      }.bind(this)
    );
  }

  resetForm() {
    const markup = `
      <div class="upload__column">
        <h3 class="upload__heading">Recipe data</h3>
        <div>
          <label>Title</label>
          <input value="Gaspacho" required name="title" type="text" />
        </div>
        <div>
          <label>URL</label>
          <input value="https://example.com" required name="sourceUrl" type="text" />
        </div>
        <div>
          <label>Image URL</label>
          <input value="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1287&q=80" required name="image" type="text" />
        </div>
        <div>
          <label>Publisher</label>
          <input value="Afonso Marques" required name="publisher" type="text" />
        </div>
        <div>
          <label>Prep time</label>
          <input value="15" required name="cookingTime" type="number" />
        </div>
        <div>
          <label>Servings</label>
          <input value="4" required name="servings" type="number" />
        </div>
      </div>

      <div class="upload__column upload__column__2">
        <h3 class="upload__heading">Ingredients</h3>
        <button type="button" class="btn btn__add--ingredient">Add ingredient +</button>
      </div>

      <button class="btn upload__btn">
        <svg>
          <use href="${icons}#icon-upload-cloud"></use>
        </svg>
        <span>Upload</span>
      </button>  
    `;

    // empty container
    this._clear();

    // insert html into container
    this._parentEl.insertAdjacentHTML('afterbegin', markup);
  }
}

export default new AddRecipeView();
