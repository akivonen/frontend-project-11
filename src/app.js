import * as yup from 'yup';
import onChange from 'on-change';
import render from './render.js';

const app = () => {
  const state = {
    feeds: [],
    error: null,
  };
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
  };
  const watchedState = onChange(state, render(state, elements));
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const schema = yup.string().url().required().notOneOf(state.feeds);
    const formData = new FormData(e.target);
    const url = formData.get('url');
    schema.validate(url)
      .then(() => {
        watchedState.feeds.push(url);
      })
      .catch((error) => {
        watchedState.error = error.message;
        state.error = null;
      });
  });
};

export default app;
