import databaseUtils from './db/database';
import { LANGUAGE, BLOG_POST_TYPES, POST_TYPES } from './constants';

const notificationData = {
  language: 'en',
  title: 'test_notification',
  content: 'Content of notification',
  reason: 'QUESTION_CLAPPED',
};

const blogData = {
  language: LANGUAGE.ENGLISH,
  type: BLOG_POST_TYPES.POST,
  title: 'NEXT.js — The Ultimate React Framework\n',
  content: `Next.js provides a solution to all of the commonly faced problems during development with React.js. But more importantly, it puts you and your team in the pit of success when building React applications.
Next.js has the best-in-class “Developer Experience” and many built-in features;
To name a few of them:
An intuitive page-based routing system (with support for dynamic routes)
Pre-rendering, both static generation (SSG) and server-side rendering (SSR) are supported on a per-page basis
`,
  tags: ['next.js', 'react'],
  mainImage: 'main_image_blog.png',
};
const blogCommentData = {
  language: LANGUAGE.ENGLISH,
  type: BLOG_POST_TYPES.COMMENT,
  content: `This is some test comment for blog post
`,
};

const questionData = {
  type: POST_TYPES.QUESTION,
  title: 'How to add a display filter in Alpine.JS like in Vue?',
  content:
    'How can I show date-time in a human-readable format in Alpine.js? I ' +
    'would add a filter in Vuejs to do the same and looking for a similar solution in Alpine.js.',
  tags: ['next.js', 'react.js', 'vue'],
  language: LANGUAGE.ENGLISH,
};
const answerData = {
  type: POST_TYPES.ANSWER,
  language: LANGUAGE.ENGLISH,
  content: 'some random test answer for some random question',
};
const commentData = {
  type: POST_TYPES.COMMENT,
  language: LANGUAGE.ENGLISH,
  content: 'some random comment for some random question or answer',
};
const questionUpdateData = {
  title: 'Generate combinations from 2D array',
  content:
    'After writing out longhand these combinations I can sense patterns, like there are ' +
    'some fixed positions and then index moves from left to right, then left again and everything but cannot wrap my head around the ' +
    'multidimensionallity and how to implement? Loop inside loop inside loop, recursion or what? I am looking for general directions.',
  tags: ['python', 'openCv'],
  language: LANGUAGE.ENGLISH,
};
const blogPostUpdateData = {
  title: 'NEXT.js — The Ultimate React Framework',
  content:
    'Next.js provides a solution to all of the commonly faced problems during development with React.js. But more importantly, ' +
    'it puts you and your team in the pit of success when building React applications.',
  tags: ['Next.js', 'React'],
  mainImage: 'update_mainImage.png',
  language: LANGUAGE.ENGLISH,
};
const tagData = {
  language: LANGUAGE.ENGLISH,
  title: 'next.js',
  content: `test tag description:
  Next.js provides a solution to all of the commonly faced problems during development with React.js. But more importantly, `,
  used: 1,
};

const updateTagData = {
  language: LANGUAGE.ENGLISH,
  title: 'test_update_tag_title',
  content:
    'Next.js provides a solution to all of the commonly faced problems during development with React.js. But more importantly, ' +
    'it puts you and your team in the pit of success when building React applications.',
  used: 1,
};

const clearTable = async (tableName) => {
  const Table = databaseUtils().loadModel(tableName);

  await Table.destroy({
    where: {},
    truncate: true,
  });
};

const makeContext = () => {
  const user = global.test_user;
  const context = { user: { id: user.id, publicName: user.publicName } };
  return context;
};

const createData = async (tableName, params, addUserId = false) => {
  const inputs = { ...params };
  const Table = databaseUtils().loadModel(tableName);
  if (addUserId) {
    const user = global.test_user;
    inputs.userId = user.id;
  }
  const result = await Table.create(inputs);
  return result;
};

const createDuplicateData = async (count, tableName, params, addUserId = false) => {
  const promises = [];
  for (let i = 0; i < count; i += 1) promises.push(createData(tableName, params, addUserId));
  return Promise.all(promises);
};

const compartDataToBeResult = (data, result) => {
  Object.keys(data).forEach((key) => {
    expect(result[key]).toBe(data[key]);
  });
};
const checkIfHaveEnoughItems = async (functionToCall, dataToPass, countToBe) => {
  const result = await functionToCall(dataToPass);
  expect(result).toHaveLength(countToBe);
};

export {
  questionData,
  questionUpdateData,
  blogPostUpdateData,
  tagData,
  blogCommentData,
  createData,
  blogData,
  answerData,
  commentData,
  createDuplicateData,
  notificationData,
  compartDataToBeResult,
  clearTable,
  makeContext,
  checkIfHaveEnoughItems,
  updateTagData,
};
