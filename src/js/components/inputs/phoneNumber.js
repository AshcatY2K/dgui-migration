import DGInput from './input.js';

export default class DGPhoneNumber extends DGInput {
  constructor() {
    super();

    this.html = `<div class="form-outline">
        <input type="tel" class="form-control" pattern="[\\d\\+\\-\\(\\)xX ]*"
          title="Phone number can only contain numbers, +, -, (, ), x or X and spaces"/>
        <label class="form-label"></label>
        <div class="invalid-feedback"></div>
        <div class="form-helper"></div>
      </div>
      <div class="form-text">May contain +, -, (), x and numbers</div>` ;
  }

  static getDisplayValue ( value ) {
    return DGInput.getDisplayValue( value );
  }
}

window.customElements.define('dg-phone-number', DGPhoneNumber);
