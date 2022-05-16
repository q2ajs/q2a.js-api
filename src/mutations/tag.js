import * as yup from 'yup';
import {
  checkInputValidation,
  createAddSuccessResponse,
  findUserByName,
  createSuccessResponse,
  getQuestionsOrderBy,
  createInputErrorResponse,
  findTag,
  findTagById,
} from '../utility.js';
import { LANGUAGE, TABLES } from '../constants.js';
import databaseUtils from '../db/database.js';

const tagSchema = yup.object().shape({
  title: yup.string().required().max(48).min(3),
  content: yup.string().required().min(64),
  language: yup.mixed().oneOf([LANGUAGE.PERSIAN, LANGUAGE.ENGLISH]).required(),
});
const languageSchema = yup.object().shape({
  language: yup.mixed().oneOf([LANGUAGE.PERSIAN, LANGUAGE.ENGLISH]).required(),
});
const createTag = async (inputParams, context) => {
  const user = await findUserByName(context.user.publicName);
  const Tag = databaseUtils().loadModel(TABLES.TAG_TABLE);
  return Tag.create({ userId: user.id, ...inputParams });
};

const addTag = async (_, { language, title, content }, context) => {
  const validationResult = await checkInputValidation(tagSchema, { language, title, content });
  if (validationResult !== true) {
    return validationResult;
  }
  const tag = await findTag(language, title);
  if (tag === null) {
    const resultOfPost = await createTag(
      {
        title,
        content,
        language,
      },
      context
    );
    const newTag = resultOfPost.dataValues;
    return createAddSuccessResponse(newTag.id, `/tag/${encodeURIComponent(title)}`);
  }
  return createInputErrorResponse('Tag already exists.');
};

const updateTag = async (_, { language, id, title, content }, context) => {
  const validationResult = await checkInputValidation(tagSchema, { language, title, content });
  if (validationResult !== true) {
    return validationResult;
  }
  const Tag = databaseUtils().loadModel(TABLES.TAG_TABLE);
  const POST = databaseUtils().loadModel(TABLES.POST_TABLE);
  const tag = await findTag(language, title);
  const prevTag = await findTagById(language, id);
  if (tag === null) {
    const questions = await getQuestionsOrderBy(language, prevTag.title, [['createdAt', 'DESC']], -1, -1);
    if (questions != null) {
      const promises = [];
      for (let i = 0; i < questions.length; i += 1) {
        const tags = [];
        tags.push(
          questions[i].dataValues.tag1,
          questions[i].dataValues.tag2,
          questions[i].dataValues.tag3,
          questions[i].dataValues.tag4,
          questions[i].dataValues.tag5
        );
        const questionTags = {};
        tags.forEach((value, index) => {
          if (value === prevTag.title) {
            questionTags[`tag${index + 1}`] = title;
          } else {
            questionTags[`tag${index + 1}`] = value;
          }
        });
        promises.push(
          POST.update(questionTags, { where: { id: questions[i].dataValues.id, language } }, context)
        );
      }
      await Promise.all(promises);
    }
    await Tag.update(
      {
        title,
        content,
      },
      { where: { id, language } }
    );

    return createSuccessResponse(`/tag/${encodeURIComponent(title)}`);
  }
  return createInputErrorResponse('This tag exists.');
};

const inactiveTag = async (_, { language, id }, context) => {
  const validationResult = await checkInputValidation(languageSchema, { language });
  if (validationResult !== true) {
    return validationResult;
  }
  const Tag = databaseUtils().loadModel(TABLES.TAG_TABLE);
  const tag = await Tag.findOne({
    where: {
      language,
      id,
    },
  });
  const questions = await getQuestionsOrderBy(language, tag.title, [['createdAt', 'DESC']], 1, 0);
  if (questions.length === 0) {
    await Tag.update(
      {
        active: false,
      },
      { where: { id, language } },
      context
    );
    return createSuccessResponse();
  }
  return createInputErrorResponse('There should be no this tag for the question');
};

export { addTag, updateTag, inactiveTag };
