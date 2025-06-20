import AboutPresenter from './about-presenter';

export default class AboutPage {
  async render() {
    return `
      <section class="about-page" id="about-page"></section>
    `;
  }

  async afterRender() {
    const container = document.querySelector('#about-page');
    const presenter = new AboutPresenter({ container });
    presenter.init();
  }
}
