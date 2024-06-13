import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import { uniqueId } from 'lodash';
import parse from './parse.js';
import render from './render.js';
import resources from './locales/index.js';

const requestTimeout = 10000;
const updateTimeout = 5000;

const proxify = (url) => {
  const proxifiedUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxifiedUrl.searchParams.append('disableCache', true);
  proxifiedUrl.searchParams.append('url', url);
  return proxifiedUrl.toString();
};
const requestData = (url) => axios.get(proxify(url), { timeout: requestTimeout });
const getPostsIds = (posts, feedId) => posts.map((post) => ({
  ...post,
  id: uniqueId(),
  feedId,
}));
const handleData = (state, data) => {
  const feed = { ...data, id: uniqueId() };
  const newPosts = feed.posts.filter((newPost) => !state.posts
    .map((post) => (post.link))
    .includes(newPost.link));
  const newPostsWithIds = getPostsIds(newPosts);
  return { feed, posts: newPostsWithIds };
};
const handleResponse = (url, content, state) => {
  const parsedData = parse(url, content);
  return handleData(state, parsedData);
};
const handleError = (error) => {
  if (error.isParserError) {
    return 'parserError';
  }
  if (error.isAxiosError && error.code === 'ECONNABORTED') {
    return 'timeoutError';
  }
  if (error.isAxiosError && error.code === 'ERR_NETWORK') {
    return 'netWorkError';
  }
  return error.message.key ?? 'unknown error';
};
const updatePosts = (watchedState) => {
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
    .finally(() => setTimeout(() => updatePosts(watchedState), updateTimeout));
};

const app = () => {
  const state = {
    status: 'filling',
    feeds: [],
    posts: [],
    error: null,
    UIstate: {
      modalId: null,
      viewedPosts: [],
    },
  };
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('[type="submit"]'),
    feedsEl: document.querySelector('.feeds'),
    postsEl: document.querySelector('.posts'),
    modalEl: document.querySelector('#modal'),
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
            watchedState.feeds.unshift(feed);
            watchedState.posts.unshift(...posts);
          })
          .catch((error) => {
            watchedState.status = 'failed';
            watchedState.error = handleError(error);
          });
      });
      elements.postsEl.addEventListener('click', (event) => {
        const { id } = event.target.dataset;
        if (id) {
          watchedState.UIstate.modalId = id;
          state.UIstate.viewedPosts.push(id);
        }
      });
      updatePosts(watchedState);
    });
};

export default app;
