import 'dotenv/config.js';
import csvtojson from 'csvtojson';
import createDatabasePromise from '../db/createDatabase.js';
import databaseUtils from '../db/database.js';
import { POST_TYPES, TABLES } from '../constants.js';
import { getEnUsersData, getDateAndTimeEnUsersData } from './getEnUsersData.js';
import { findUserByName } from '../utility.js';

createDatabasePromise.then(async () => {
  const getUserDataFromDb = async (usersData) => {
    const usersPromise = usersData.map(async (user) => {
      const data = await findUserByName(user.publicName);
      return data.dataValues;
    });
    const users = await Promise.all(usersPromise);
    return users;
  };
  // Add users
  const addDataToDb = async (datas, tableName) => {
    const promises = datas.map(async (data) => {
      try {
        const Model = await databaseUtils().loadModel(tableName);
        await Model.create(data);
      } catch (e) {
        console.error(e);
        throw e;
      }
    });
    return Promise.all(promises);
  };
  const usersData = await getEnUsersData();
  await addDataToDb(usersData, TABLES.USER_TABLE);
  // Get  users from db
  const users = await getUserDataFromDb(usersData);
  const usersId = [];
  users.map(async (index, item) => {
    usersId.push(users[item].id);
  });

  // //Add posts
  const createPost = async (inputParams) => {
    const userId = Math.floor(Math.random() * usersId.length);
    const Post = databaseUtils().loadModel(TABLES.POST_TABLE);
    const newPost = await Post.create({ userId: usersId[userId], ...inputParams });
    return newPost;
  };

  const updatePost = async (answersCount, postId, language) => {
    const Post = databaseUtils().loadModel(TABLES.POST_TABLE);
    return Post.update({ answersCount }, { where: { id: postId, language } });
  };

  const fileName = 'Q2A_English.csv';
  const source = await csvtojson().fromFile(fileName);
  for (let i = 0; i < source.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const resultData = await getDateAndTimeEnUsersData();
    let answerCount = 0;
    const title = source[i].Title;
    const content = source[i].Content;
    // eslint-disable-next-line no-await-in-loop

    // eslint-disable-next-line no-await-in-loop
    const newPost = await createPost({
      type: POST_TYPES.QUESTION,
      title,
      content,
      language: 'fa',
      tags: ['english', 'simple past'],
      createdAt: resultData.askDate,
    });

    const ans1 = source[i].Answer1;
    const ans2 = source[i].Answer2;
    const ans3 = source[i].Answer3;
    // eslint-disable-next-line no-await-in-loop
    const postId = await newPost.dataValues.id;
    if (ans1.length > 0) {
      // eslint-disable-next-line no-undef,no-await-in-loop
      await createPost({
        type: POST_TYPES.ANSWER,
        content: ans1,
        language: 'fa',
        parentId: postId,
        createdAt: resultData.ans1,
      });
      answerCount += 1;
    }
    if (ans2.length > 0) {
      // eslint-disable-next-line no-undef,no-await-in-loop
      await createPost({
        type: POST_TYPES.ANSWER,
        content: ans2,
        language: 'fa',
        parentId: newPost.dataValues.id,
        createdAt: resultData.ans2,
      });
      answerCount += 1;
    }
    if (ans3.length > 0) {
      // eslint-disable-next-line no-undef,no-await-in-loop
      await createPost({
        type: POST_TYPES.ANSWER,
        content: ans3,
        language: 'fa',
        parentId: newPost.dataValues.id,
        createdAt: resultData.ans3,
      });
      answerCount += 1;
    }
    // eslint-disable-next-line no-undef,no-await-in-loop
    await updatePost(answerCount, postId, 'fa');
  }
});
