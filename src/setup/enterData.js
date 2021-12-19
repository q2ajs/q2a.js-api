import 'dotenv/config.js';
import csvtojson from 'csvtojson';
import createDatabasePromise from '../db/createDatabase.js';
import databaseUtils from '../db/database.js';
import { POST_TYPES, TABLES } from '../constants.js';

createDatabasePromise.then(async () => {
  const createPost = async (inputParams) => {
    // const user = await findUserByName('narges');
    const Post = databaseUtils().loadModel(TABLES.POST_TABLE);
    return Post.create({ userId: 1, ...inputParams });
  };

  const fileName = 'Q2A_English.csv';
  const source = await csvtojson().fromFile(fileName);
  for (let i = 0; i < source.length; i += 1) {
    const title = source[i].Title;
    const content = source[i].Content;
    // eslint-disable-next-line no-await-in-loop
    const resultOfPost = await createPost({
      type: POST_TYPES.QUESTION,
      title,
      content,
      language: 'en',
      tags: ['english', 'past'],
    });
    console.log('resultOfPost::', resultOfPost);
  }
});
