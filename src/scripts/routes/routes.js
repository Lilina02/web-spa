import HomePage from '../pages/home/home-page.js';
import AboutPage from '../pages/about/about-page.js';
import FavoritePage from '../pages/favorit/favorite-page.js';
import LoginPage from '../pages/login/login-page.js';
import RegisterPage from '../pages/register/register-page.js';
import AddStoryPage from '../pages/tambah/add-story-page.js';


const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
   '/favorite': new FavoritePage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/tambah': new AddStoryPage(),
   
};

export default routes;
