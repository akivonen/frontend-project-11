const getPosts = (data) => {
  const postsArr = Array.from(data.querySelectorAll('item'));
  const posts = postsArr.map((post) => {
    const postKeys = ['title', 'description', 'link', 'pubDate'];
    const postEntries = postKeys.map((key) => [key, post.querySelector(key).textContent]);
    return Object.fromEntries(postEntries);
  });
  return posts;
};

const parse = (url, xml) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(xml, 'application/xml');
  const errorNode = data.querySelector('parsererror');
  if (errorNode) {
    const error = new Error(errorNode.textContent);
    error.isParserError = true;
    throw error;
  }
  const title = data.querySelector('title').textContent;
  const description = data.querySelector('description').textContent;
  return {
    title, description, url, posts: getPosts(data),
  };
};
export default parse;
