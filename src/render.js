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
const createButtonView = (postId, i18n) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.dataset.id = postId;
  button.dataset.bsToggle = 'modal';
  button.dataset.bsTarget = '#modal';
  button.textContent = i18n.t('elements.buttonView');
  return button;
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
const createPostsView = (posts, i18n) => {
  const postsArr = posts.map((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const link = document.createElement('a');
    link.classList.add('fw-bold');
    link.dataset.id = post.id;
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.href = post.link;
    link.textContent = `${post.title}`;
    const button = createButtonView(post.id, i18n);
    li.append(link, button);
    return li;
  });
  return postsArr;
};
const contentMapping = {
  feeds: (data) => createFeedsView(data),
  posts: (data, i18n) => createPostsView(data, i18n),
};
const createListView = (listType, elements, data, i18n) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t(`elements.lists.${listType}`);
  cardBody.append(cardTitle);
  const listEl = elements[`${listType}El`];
  listEl.textContent = '';
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  ul.append(...contentMapping[listType](data, i18n));
  container.append(cardBody, ul);
  listEl.append(container);
};

const render = (state, elements, i18n) => (path, value) => {
  switch (path) {
    case 'status':
      formStateRender(elements, i18n, value);
      break;
    case 'feeds':
      createListView('feeds', elements, state.feeds, i18n);
      break;
    case 'posts':
      createListView('posts', elements, state.posts, i18n);
      break;
    case 'error':
      renderError(elements, state.error, i18n);
      break;
    default:
      throw new Error(`Unknown path ${path}`);
  }
};
export default render;
