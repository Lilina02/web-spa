// Sesuaikan import path supaya tepat dari folder 'favorit' ke 'utils'
import FavoriteStoryIdb from '../../utils/favorite-story-idb.js';

export default class FavoritePresenter {
  constructor({ view }) {
    this._view = view;
  }

  async init() {
    try {
      // Show loading state while fetching data
      this._view.showLoading();
      
      const stories = await FavoriteStoryIdb.getAll();

      if (!stories || stories.length === 0) {
        this._view.showEmptyState();
        return;
      }

      this._view.showStories(stories);
    } catch (error) {
      console.error('Error loading favorite stories:', error);
      this._view.showError(error.message || 'Gagal memuat cerita favorit.');
    }
  }

  async refreshData() {
    await this.init();
  }
}