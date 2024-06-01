const render = (state, elements) => (path) => {
  switch (path) {
    case 'feeds':
      elements.input.textContent = '';
      elements.feedback.textContent = '';
      if (elements.input.classList.contains('is-invalid')) {
        elements.input.classList.remove('is-invalid');
      }
      break;
    case 'error':
      elements.feedback.textContent = state.error;
      elements.input.classList.add('is-invalid');
      break;
    default:
      throw new Error(`Unknown path ${path}`);
  }
};
export default render;
