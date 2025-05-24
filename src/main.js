import {
  renderImages,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreBtn,
  hideLoadMoreBtn,
} from './js/render-functions';
import { fetchImages } from './js/pixabay-api';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector(`form`);
const gallery = document.querySelector(`.gallery`);

let currentQuery = '';
let currentPage = 1;
const perPage = 15;

hideLoadMoreBtn();

form.addEventListener(`submit`, async event => {
  event.preventDefault();

  currentQuery = event.target.elements['search-text'].value.trim();
  currentPage = 1;

  if (!currentQuery) {
    iziToast.error({ title: 'Error', message: 'Please enter a search query!' });
    return;
  }

  clearGallery();
  hideLoadMoreBtn();
  showLoader();

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
        showLoadMoreBtn();
      }
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch images. Try again later!',
    });
  } finally {
    hideLoader();
  }
});

document.querySelector('.load-more').addEventListener('click', async () => {
  currentPage++;
  showLoader();

  try {
    const response = await fetchImages(currentQuery, currentPage);
    renderImages(response.hits);
    smoothScroll();

    if (currentPage * perPage >= response.totalHits) {
      hideLoadMoreBtn();
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
    hideLoader();
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
