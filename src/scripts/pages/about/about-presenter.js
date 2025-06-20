import AboutView from './about-view';

export default class AboutPresenter {
  constructor({ container }) {
    this._container = container;
    this._view = new AboutView();
  }

  init() {
    this._renderContent();
    this._view.initScrollAnimations();
  }

  _renderContent() {
    this._container.innerHTML = this._view.getTemplate();
  }
}
