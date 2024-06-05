import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import render from './render.js';
import resources from './locales/index.js';

const app = () => {
  const state = {
    status: 'filling',
    feeds: [],
    error: null,
  };
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
  };
  yup.setLocale({
    string: {
      url: () => ({ key: 'errors.isNotUrl' }),
    },
    mixed: {
      required: () => ({ key: 'errors.emptyField' }),
      notOneOf: () => ({ key: 'errors.alreadyExists' }),
    },
  });
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    const watchedState = onChange(state, render(state, elements, i18n));
    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      // watchedState.status = 'processing';
      const schema = yup.string().url().required().notOneOf(state.feeds);
      const formData = new FormData(e.target);
      const url = formData.get('url');
      schema.validate(url)
        .then(() => {
          state.error = null;
          watchedState.feeds.push(url);
        })
        .catch((error) => {
          watchedState.error = error.message.key;
        });
    });
  });
};

export default app;
