const render = (state, elements, i18n) => (path) => {
  switch (path) {
    case 'feeds':
      elements.input.textContent = '';
      elements.feedback.textContent = '';
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = i18n.t('status.completed');
      break;
    case 'error':
      elements.input.classList.add('is-invalid');
      elements.feedback.classList.add('text-danger');
      elements.feedback.textContent = i18n.t(state.error);
      break;
    default:
      throw new Error(`Unknown path ${path}`);
  }
};
export default render;
