import { GraphQLUpload } from 'graphql-upload';
import {
  getAnswers,
  getComments,
  getLatestQuestions,
  getMostViewsQuestions,
  getNoAnswersQuestions,
  getPopularQuestions,
  getQuestion,
  getUserAnswers,
  getUserClapItems,
  getUserQuestions,
} from '../queries/post.js';
import { addBlogPost, updateBlogPost, addBlogComment } from '../mutations/blog.js';
import { addTag, updateTag, inactiveTag } from '../mutations/tag.js';
import { getAllTags, getTagDetail } from '../queries/tag.js';
import { getUser } from '../queries/user.js';
import { getNotifications } from '../queries/notifications.js';
import { updateUser } from '../mutations/user.js';
import { setReadAllNotifications } from '../mutations/notifications.js';
import { googleLogin, login, signUp } from '../mutations/login.js';
import { adminSignUp } from '../mutations/adminSignUp.js';
import {
  addAnswer,
  addComment,
  addQuestion,
  updateAnswer,
  updateComment,
  updateQuestion,
  increaseQuestionViewCount,
  togglePostActiveStatus,
} from '../mutations/post.js';
import { getStatistics } from '../queries/statistic.js';
import { uploadFile } from '../mutations/upload.js';
import { getBlogPosts, getBlogPost, getBlogPostItemComments } from '../queries/blog.js';

export default {
  Upload: GraphQLUpload,
  Query: {
    latestQuestions: getLatestQuestions,
    popularQuestions: getPopularQuestions,
    mostViewsQuestions: getMostViewsQuestions,
    noAnswersQuestions: getNoAnswersQuestions,
    getTags: getAllTags,
    getQuestion,
    getTagDetail,
    getUser,
    getNotifications,
    getBlogPosts,
    getBlogPost,
    getStatistics,
  },
  Mutation: {
    login,
    signUp,
    adminSignUp,
    addQuestion,
    googleLogin,
    uploadFile,
    updateUser,
    updateQuestion,
    updateBlogPost,
    updateAnswer,
    updateComment,
    addAnswer,
    addComment,
    addBlogComment,
    addTag,
    inactiveTag,
    updateTag,
    setReadAllNotifications,
    addBlogPost,
    increaseViewCount: increaseQuestionViewCount,
    togglePostActiveStatus,
  },
  BlogPost: {
    comments: getBlogPostItemComments,
  },
  Question: {
    answers: getAnswers,
    comments: getComments,
  },
  User: {
    questions: getUserQuestions,
    answers: getUserAnswers,
    clapItems: getUserClapItems,
  },
  Answer: {
    comments: getComments,
  },
};
