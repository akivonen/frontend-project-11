const massSetAttributes = (el, attributesArr) => {
  attributesArr.forEach(([attr, value]) => {
    el.setAttribute(attr, value);
  });
};
const renderError = ({ input, feedback, submit }, errorKey, i18n) => {
  submit.disabled = false;
  input.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = i18n.t(`errors.${errorKey}`);
};
const renderProcessingState = ({ input, feedback, submit }, i18n) => {
  submit.disabled = true;
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-success', 'text-danger');
  feedback.textContent = i18n.t('status.processing');
};
const renderCompletedState = ({
  form, input, feedback, submit,
}, i18n) => {
  submit.disabled = false;
  input.classList.remove('is-invalid');
  form.reset();
  input.focus();
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = i18n.t('status.completed');
};
const formStateRender = (elements, i18n, value) => {
  switch (value) {
    case 'failed':
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
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  const buttonAttrs = [
    ['type', 'button'],
    ['data-id', postId],
    ['data-bs-toggle', 'modal'],
    ['data-bs-target', '#modal'],
  ];
  massSetAttributes(button, buttonAttrs);
  button.textContent = i18n.t('elements.buttonView');
  return button;
};
const createFeedsView = ({ feeds }) => {
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
const createPostsView = (state, i18n) => {
  const postsArr = state.posts.map((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const link = document.createElement('a');
    link.classList.add(state.UIstate.viewedPosts.includes(post.id) ? 'fw-normal' : 'fw-bold');
    const linkAttrs = [
      ['href', post.link],
      ['data-id', post.id],
      ['target', '_blank'],
      ['rel', 'noopener noreferrer'],
    ];
    massSetAttributes(link, linkAttrs);
    link.textContent = `${post.title}`;
    const button = createButtonView(post.id, i18n);
    li.append(link, button);
    return li;
  });
  return postsArr;
};
const contentMapping = {
  feeds: (state) => createFeedsView(state),
  posts: (state, i18n) => createPostsView(state, i18n),
};
const renderList = (listType, elements, state, i18n) => {
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
  ul.append(...contentMapping[listType](state, i18n));
  container.append(cardBody, ul);
  listEl.append(container);
};
const renderModal = (state, { modalEl }, id) => {
  const header = modalEl.querySelector('.modal-title');
  const body = modalEl.querySelector('.modal-body');
  const a = modalEl.querySelector('.full-article');
  const [{ title, description, link }] = state.posts
    .filter((p) => p.id === id);
  header.textContent = title;
  body.textContent = description;
  a.href = link;
  const currPost = document.querySelector(`[data-id="${id}"]`);
  currPost.classList.remove('fw-bold');
  currPost.classList.add('fw-normal');
};
const render = (state, elements, i18n) => (path, value) => {
  switch (path) {
    case 'status':
      formStateRender(elements, i18n, value);
      break;
    case 'feeds':
      renderList('feeds', elements, state, i18n);
      break;
    case 'posts':
      renderList('posts', elements, state, i18n);
      break;
    case 'UIstate.modalId':
      renderModal(state, elements, value);
      break;
    case 'error':
      renderError(elements, state.error, i18n);
      break;
    default:
      throw new Error(`Unknown path ${path}`);
  }
};
export default render;
