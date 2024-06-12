import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import { uniqueId } from 'lodash';
import parse from './parse.js';
import render from './render.js';
import resources from './locales/index.js';

const proxify = (url) => {
  const proxifiedUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxifiedUrl.searchParams.append('disableCache', true);
  proxifiedUrl.searchParams.append('url', url);
  return proxifiedUrl.toString();
};
const requestData = (url) => axios.get(proxify(url));

const handleData = (data) => {
  const { title, description, posts } = data;
  const feed = {
    id: uniqueId(),
    title,
    description,
    posts,
  };
  const handledPosts = posts.map((post) => ({
    id: uniqueId(),
    feedId: feed.id,
    title: post.title,
    description: post.description,
    link: post.link,
    pubDate: post.pubDate,
  }));
  return { feed, posts: handledPosts };
};

const app = () => {
  const state = {
    status: 'filling',
    feeds: [],
    posts: [],
    error: null,
  };
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('[type="submit"]'),
    feedsEl: document.querySelector('.feeds'),
    postsEl: document.querySelector('.posts'),
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
  })
    .then(() => {
      const watchedState = onChange(state, render(state, elements, i18n));
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const schema = yup.string().url().required().notOneOf(state.feeds);
        const formData = new FormData(e.target);
        const url = formData.get('url');
        schema.validate(url)
          .then(() => {
            state.error = null;
            watchedState.status = 'processing';
            return requestData(url);
          })
          .then(({ data }) => {
            const parsedData = (parse(data.contents, url));
            if (Object.hasOwn(parsedData, 'error')) {
              watchedState.status = 'invalid';
              watchedState.error = 'parsingError';
            }
            watchedState.status = 'completed';
            const handledFeed = handleData(parsedData);
            watchedState.feeds.push(handledFeed.feed);
            watchedState.posts.push(...handledFeed.posts);
          })
          .catch((error) => {
            console.log(error)
            watchedState.status = 'invalid';
            watchedState.error = error.message.key;
          });
      });
    });
};

export default app;
