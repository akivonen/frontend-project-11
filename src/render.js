const renderError = ({ input, feedback, submit }, errorKey, i18n) => {
  submit.disabled = false;
  input.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = i18n.t(errorKey);
};
const renderProcessingState = ({ input, feedback, submit }, i18n) => {
  submit.disabled = true;
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.remove('text-danger');
  feedback.textContent = i18n.t('status.processing');
};
const renderCompletedState = ({ input, feedback, submit }, i18n) => {
  submit.disabled = false;
  input.classList.remove('is-invalid');
  input.textContent = '';
  input.focus();
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = i18n.t('status.completed');
};
const formStateRender = (elements, i18n, value) => {
  switch (value) {
    case 'invalid':
      renderError(elements, value, i18n);
      break;
    case 'processing':
      renderProcessingState(elements, i18n);
      break;
    case 'completed':
      renderCompletedState(elements, i18n);
      break;
    default: throw new Error(`Unknown form status value ${value}`);
  }
};
const createFeedsView = (feeds) => {
  const feedsArr = feeds.map((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;
    const p = document.createElement('h3');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.append(h3, p);
    return li;
  });
  return feedsArr;
};
const createPostsView = (posts) => {
  const postsArr = posts.map((post) => {
    const li = document.createElement('li');
    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );
    const link = document.createElement('a');
    link.classList.add('fw-bold');
    link.dataset.id = post.id;
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.href = post.link;
    link.textContent = `${post.title}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.dataset.id = post.id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = 'Просмотр';
    li.append(link, button);
    return li;
  });
  return postsArr;
};
const createListView = (listType, { feedsEl, postsEl }, data) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardBody.append(cardTitle);
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  container.append(cardBody, ul);
  switch (listType) {
    case 'feeds':
      cardTitle.textContent = 'Фиды';
      feedsEl.textContent = '';
      ul.append(...createFeedsView(data));
      feedsEl.append(container);
      break;
    case 'posts':
      cardTitle.textContent = 'Посты';
      postsEl.textContent = '';
      ul.append(...createPostsView(data));
      postsEl.append(container);
      break;
    default: throw new Error(`Unknown list type ${listType}`);
  }
};

const render = (state, elements, i18n) => (path, value) => {
  switch (path) {
    case 'status':
      formStateRender(elements, i18n, value);
      break;
    case 'feeds':
      createListView('feeds', elements, state.feeds);
      break;
    case 'posts':
      createListView('posts', elements, state.posts);
      break;
    case 'error':
      renderError(elements, state.error, i18n);
      break;
    default:
      throw new Error(`Unknown path ${path}`);
  }
};
export default render;
