import { renderImages, clearGallery } from './js/render-functions';
import { fetchImages } from './js/pixabay-api';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector(`form`);
const gallery = document.querySelector(`.gallery`);
const loader = document.querySelector(`.loader`);
const loadMoreBtn = document.querySelector(`.load-more`);

let currentQuery = '';
let currentPage = 1;
const perPage = 15;

loadMoreBtn.classList.add(`visually-hidden`);

form.addEventListener(`submit`, async event => {
  event.preventDefault();

  currentQuery = event.target.elements['search-text'].value.trim();
  currentPage = 1;

  if (!currentQuery) {
    iziToast.error({ title: 'Error', message: 'Please enter a search query!' });
    return;
  }

  clearGallery();
  loadMoreBtn.classList.add('visually-hidden');
  loader.classList.remove('visually-hidden');

  try {
    const response = await fetchImages(currentQuery, currentPage);
    if (response.hits.length === 0) {
      iziToast.warning({
        title: 'Oops!',
        message: 'No images found. Try again!',
      });
    } else {
      renderImages(response.hits);
      if (response.totalHits > perPage) {
        loadMoreBtn.classList.remove('visually-hidden');
      }
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch images. Try again later!',
    });
  } finally {
    loader.classList.add('visually-hidden');
  }
});
loadMoreBtn.addEventListener('click', async () => {
  currentPage++;
  loader.classList.remove('visually-hidden');

  try {
    const response = await fetchImages(currentQuery, currentPage);
    renderImages(response.hits);
    smoothScroll();

    if (currentPage * perPage >= response.totalHits) {
      loadMoreBtn.classList.add('visually-hidden');
      iziToast.info({
        title: 'Info',
        message: "You've reached the end of search results.",
      });
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Failed to load more images. Try again later!',
    });
  } finally {
    loader.classList.add('visually-hidden');
  }
});
function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
