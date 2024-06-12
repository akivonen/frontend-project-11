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
const handleData = (state, data) => {
  const feed = { ...data, id: uniqueId() };
  const posts = feed.posts.map((post) => ({
    ...post,
    id: uniqueId(),
    feedId: feed.id,
  }));
  const newPosts = posts.filter((newPost) => !state.posts
    .map((post) => (post.link))
    .includes(newPost.link));
  return { feed, posts: newPosts };
};
const handleResponse = (url, content, state) => {
  const parsedData = parse(url, content);
  return handleData(state, parsedData);
};
const refreshPosts = (watchedState) => {
  const promises = watchedState.feeds.map((feed) => requestData(feed.url)
    .then(({ data }) => {
      const { posts } = handleResponse(feed.url, data.contents, watchedState);
      if (posts.length) {
        watchedState.posts.unshift(...posts);
      }
    })
    .catch((error) => {
      console.log(`Error: ${error}, Feed url: ${feed.url}`);
    }));
  return Promise.all(promises)
    .finally(() => setTimeout(() => refreshPosts(watchedState), 5000));
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
        const listedFeedLinks = state.feeds.map((feed) => feed.url);
        const schema = yup.string().url().required().notOneOf(listedFeedLinks);
        const formData = new FormData(e.target);
        const url = formData.get('url');
        schema.validate(url)
          .then(() => {
            state.error = null;
            watchedState.status = 'processing';
            return requestData(url);
          })
          .then(({ data }) => {
            watchedState.status = 'completed';
            const { feed, posts } = handleResponse(url, data.contents, state);
            watchedState.feeds.push(feed);
            watchedState.posts.push(...posts);
            setTimeout(() => refreshPosts(watchedState), 5000);
          })
          .catch((error) => {
            watchedState.status = 'invalid';
            watchedState.error = error;
          });
      });
    });
};

export default app;
