import { addTag, updateTag, inactiveTag } from '../../mutations/tag.js';
import { makeContext, tagData, updateTagData, clearTable, questionData } from '../../testUtility.js';
import { STATUS_CODE, TABLES } from '../../constants.js';
import { addQuestion } from '../../mutations/post.js';
import { findPostById, findTag } from '../../utility.js';

describe('tag mutations api', () => {
  const addNewTag = async () => {
    return addTag(null, tagData, makeContext());
  };
  const createQuestion = async (defaultParams, newParams) => {
    const params = { ...defaultParams, ...newParams };
    return addQuestion(
      null,
      {
        language: params.language,
        title: params.title,
        content: params.content,
        tags: params.tags,
      },
      makeContext()
    );
  };

  const addTagWithTitle = async (title) => {
    if (title == null) return null;
    const newTagData = tagData;
    newTagData.title = title;
    const tag = await addTag(null, newTagData, makeContext());
    return tag;
  };

  const checkUpdateTag = async (tag1, tag2, tag3, tag4, tag5, numberOfTagToChange, newTag) => {
    await clearTable(TABLES.TAG_TABLE);
    await clearTable(TABLES.POST_TABLE);
    const promises = [];
    promises.push(addTagWithTitle(tag1));
    promises.push(addTagWithTitle(tag2));
    promises.push(addTagWithTitle(tag3));
    promises.push(addTagWithTitle(tag4));
    promises.push(addTagWithTitle(tag5));
    // eslint-disable-next-line no-await-in-loop
    const newTags = await Promise.all(promises);
    const questionsId = [];
    const questionsTag = [];

    for (let i = 0; i < 5; i += 1) {
      const tags = [tag1, tag2, tag3, tag4, tag5];
      const newQuestionData = questionData;
      newQuestionData.tags = tags;
      const tempt = newQuestionData.tags[numberOfTagToChange - 1];
      newQuestionData.tags[numberOfTagToChange - 1] = newQuestionData.tags[i];
      newQuestionData.tags[i] = tempt;
      questionsTag.push(newQuestionData.tags);
      // eslint-disable-next-line no-await-in-loop
      const question = await addQuestion(null, newQuestionData, makeContext());
      questionsId.push(question.id);
      expect(question.statusCode).toBe(STATUS_CODE.SUCCESS);
    }
    const result = await updateTag(
      null,
      {
        language: updateTagData.language,
        id: newTags[numberOfTagToChange - 1].id,
        title: newTag,
        content: updateTagData.content,
      },
      makeContext()
    );
    expect(result.statusCode).toBe(STATUS_CODE.SUCCESS);
    expect(result.message).toBeTruthy();
    const updatedTag = await findTag(tagData.language, newTag);
    expect(result.statusCode).toBe(STATUS_CODE.SUCCESS);
    expect(result.message).toBeTruthy();
    expect(newTag).toBe(updatedTag.title);
    expect(updateTagData.content).toBe(updatedTag.content);
    expect(newTags[numberOfTagToChange - 1].id).toBe(updatedTag.id);
    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const updatedPost = await findPostById(updateTagData.language, questionsId[i]);
      expect(updatedPost.dataValues[`tag${i + 1}`]).toBe(newTag);
      for (let j = 0; j < 5; j += 1) {
        if (j !== i) {
          expect(updatedPost.dataValues[`tag${j + 1}`]).toBe(questionsTag[i][j]);
        }
      }
    }
  };

  // AddTag
  test('if correct input for addTag works', async () => {
    await clearTable(TABLES.TAG_TABLE);
    const result = await addNewTag();
    expect(result.statusCode).toBe(STATUS_CODE.SUCCESS);
    expect(result.url).toBe(`/tag/${encodeURIComponent(tagData.title)}`);
  });
  test('if repeat input for addTag works', async () => {
    await clearTable(TABLES.TAG_TABLE);
    await addNewTag();
    const result = await addNewTag();
    expect(result.statusCode).toBe(STATUS_CODE.INPUT_ERROR);
  });

  // update Tag
  test('if correct input for updateTag give success', async () => {
    await checkUpdateTag(
      'test_post_tag1',
      'test_post_tag2',
      'test_post_tag3',
      'test_post_tag4',
      'test_post_tag5',
      1,
      'new_test_post_tag'
    );
    await checkUpdateTag(
      'test_post_tag1',
      'test_post_tag2',
      'test_post_tag3',
      'test_post_tag4',
      'test_post_tag5',
      1,
      'new_test_post_(tag)}!@#$%^&*('
    );
  });
  test('if repeat input for updateTag give success', async () => {
    await clearTable(TABLES.TAG_TABLE);
    await clearTable(TABLES.POST_TABLE);
    const tag = await addNewTag();
    const result = await updateTag(
      null,
      {
        language: updateTagData.language,
        id: tag.id,
        title: tagData.title,
        content: updateTagData.content,
      },
      makeContext()
    );
    expect(result.statusCode).toBe(STATUS_CODE.INPUT_ERROR);
  });
  // inactive Tag
  test('if correct input for inactive Tag works', async () => {
    await clearTable(TABLES.TAG_TABLE);
    await addNewTag();
    const getNewTag = await findTag(tagData.language, tagData.title);
    expect(getNewTag.active).toBe(true);
    const result = await inactiveTag(
      null,
      {
        language: getNewTag.language,
        id: getNewTag.id,
      },
      makeContext()
    );
    expect(result.statusCode).toBe(STATUS_CODE.SUCCESS);
  });
  test('if enter repeat tag input for inactive Tag works', async () => {
    await clearTable(TABLES.TAG_TABLE);
    await addNewTag();
    const getNewTag = await findTag(tagData.language, tagData.title);
    expect(getNewTag.active).toBe(true);
    await createQuestion(questionData, { title: 'question_test_1' });
    const result = await inactiveTag(
      null,
      {
        language: getNewTag.language,
        id: getNewTag.id,
      },
      makeContext()
    );
    expect(result.statusCode).toBe(STATUS_CODE.INPUT_ERROR);
  });
});
