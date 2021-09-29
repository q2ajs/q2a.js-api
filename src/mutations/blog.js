import * as yup from 'yup';
import {
  checkInputValidation,
  createAddSuccessResponse,
  findUserByName,
  createSuccessResponse,
  createInputErrorResponse,
} from '../utility.js';
import { BLOG_POST_TYPES, LANGUAGE, TABLES } from '../constants.js';
import databaseUtils from '../db/database.js';

const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'svg'];
const blogPostSchema = yup.object().shape({
  title: yup.string().required().min(10),
  content: yup.string().required().min(25),
  tags: yup.array().required().min(2).max(5),
  mainImage: yup.mixed().test('Image type', 'Your image type is wrong.', (value) => {
    if (value) {
      try {
        const type = value.split('.').pop().toLowerCase();
        return SUPPORTED_FORMATS.includes(type);
      } catch (e) {
        return false;
      }
    }
    return true;
  }),
  language: yup.mixed().oneOf([LANGUAGE.PERSIAN, LANGUAGE.ENGLISH]).required(),
});

const commentSchema = yup.object().shape({
  content: yup.string().required().min(10),
  language: yup.mixed().oneOf([LANGUAGE.PERSIAN, LANGUAGE.ENGLISH]).required(),
});

const updatePost = async (inputParams, postId, language) => {
  const BlogPost = databaseUtils().loadModel(TABLES.BLOG_POST_TABLE);
  return BlogPost.update({ ...inputParams }, { where: { id: postId, language } });
};
const getParentPost = async (parentId) => {
  const BlogPost = await databaseUtils().loadModel(TABLES.BLOG_POST_TABLE);
  const User = databaseUtils().loadModel(TABLES.USER_TABLE);
  const blogPost = await BlogPost.findOne({
    where: {
      id: parentId,
    },
    include: [User],
  });
  return blogPost;
};

const createBlogPost = async (inputParams, context) => {
  const user = await findUserByName(context.user.publicName);
  const BlogPost = databaseUtils().loadModel(TABLES.BLOG_POST_TABLE);
  return BlogPost.create({ userId: user.id, ...inputParams });
};

const addBlogPost = async (_, params, context) => {
  const inputParams = { ...params };
  const validationResult = await checkInputValidation(
    yup.object().shape({
      title: yup.string().required().min(10),
      content: yup.string().required().min(100),
      tags: yup.array().required().min(2).max(5),
      mainImage: yup.mixed().test('Image type', 'Your image type is wrong.', (value) => {
        if (value) {
          try {
            const type = value.split('.').pop().toLowerCase();
            return SUPPORTED_FORMATS.includes(type);
          } catch (e) {
            return false;
          }
        }
        return true;
      }),
      language: yup.mixed().oneOf([LANGUAGE.PERSIAN, LANGUAGE.ENGLISH]).required(),
    }),
    inputParams
  );
  if (validationResult !== true) {
    return validationResult;
  }
  const questionTags = {};
  inputParams.tags.forEach((tag, index) => {
    questionTags[`tag${index + 1}`] = tag;
  });
  inputParams.type = BLOG_POST_TYPES.POST;
  const user = await findUserByName(context.user.publicName);
  const Post = databaseUtils().loadModel(TABLES.BLOG_POST_TABLE);
  const result = await Post.create({ userId: user.id, ...inputParams, ...questionTags });
  const newPost = result.dataValues;
  return createAddSuccessResponse(newPost.id, `/blog/${newPost.id}/${encodeURIComponent(params.title)}`);
};
// updated BlogPost
const updateBlogPost = async (_, { language, id, title, content, tags, mainImage }) => {
  const validationResult = await checkInputValidation(blogPostSchema, {
    language,
    title,
    content,
    tags,
    mainImage,
  });
  if (validationResult !== true) {
    return validationResult;
  }
  const blogPostTags = {};
  tags.forEach((tag, index) => {
    blogPostTags[`tag${index + 1}`] = tag;
  });
  await updatePost(
    {
      title,
      content,
      ...blogPostTags,
      mainImage,
    },
    id,
    language
  );
  return createSuccessResponse(`/blog/${id}/${encodeURIComponent(title)}`);
};
// add Comment to blog
const addBlogComment = async (_, { language, postId, content }, context) => {
  const validationResult = await checkInputValidation(commentSchema, { language, content });
  if (validationResult !== true) {
    return validationResult;
  }
  const parentBlogPost = await getParentPost(postId);
  if (parentBlogPost === null) {
    return createInputErrorResponse('Post not found');
  }
  const createBlogPostResult = await createBlogPost(
    {
      type: BLOG_POST_TYPES.COMMENT,
      content,
      language,
      parentId: postId,
    },
    context
  );
  const createBlogPostId = createBlogPostResult.id;
  return createAddSuccessResponse(createBlogPostId);
};

export { addBlogPost, updateBlogPost, addBlogComment };
