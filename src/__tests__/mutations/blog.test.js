import { addBlogPost, updateBlogPost, addBlogComment } from '../../mutations/blog.js';
import { STATUS_CODE } from '../../constants.js';
import { blogData, blogPostUpdateData, makeContext } from '../../testUtility';
import { getBlogPost } from '../../queries/blog';

describe('blog mutations api', () => {
  const testAddBlogPostWrongInput = async (language, title, content, tags, mainImage) => {
    const result = await addBlogPost(null, { title, content, tags, mainImage }, makeContext());
    if (result.statusCode !== STATUS_CODE.VALIDATION_ERROR)
      expect(`Add blog post should give error with:' ${title},${content},${tags},${mainImage}`).toBe(false);
  };

  const addNewBlogPost = async () => {
    return addBlogPost(null, blogData, makeContext());
  };

  const testUpdateBlogPostWrongInput = async (language, postId, title, content, tags, mainImage) => {
    const result = await updateBlogPost(
      null,
      {
        language,
        postId,
        title,
        content,
        tags,
        mainImage,
      },
      makeContext()
    );

    if (result.statusCode !== STATUS_CODE.VALIDATION_ERROR)
      expect(`Update BlogPost should give error with:' ${title},${content},${tags},${mainImage}`).toBe(false);
  };

  const testAddBlogCommentWrongInput = async (language, postId, content, statusCode) => {
    const result = await addBlogComment(null, { language, postId, content }, makeContext());

    if (result.statusCode !== statusCode)
      expect(`add BlogComment should give error with:' ${postId},${content}`).toBe(false);
  };

  // Add blog post
  test('if correct input for add blog post give success', async () => {
    const result = await addNewBlogPost(
      blogData.language,
      blogData.title,
      blogData.content,
      blogData.tags,
      blogData.mainImage
    );
    expect(result.statusCode).toBe(STATUS_CODE.SUCCESS);
  });

  test("if wrong input for addBlogPost doesn't work", async () => {
    await testAddBlogPostWrongInput(
      'wrong',
      blogData.title,
      blogData.content,
      blogData.tags,
      blogData.mainImage
    );
    await testAddBlogPostWrongInput(
      blogData.language,
      'wrong',
      blogData.content,
      blogData.tags,
      blogData.mainImage
    );
    await testAddBlogPostWrongInput(
      blogData.language,
      blogData.title,
      'wrong_content',
      blogData.tags,
      blogData.mainImage
    );
    await testAddBlogPostWrongInput(
      blogData.language,
      blogData.title,
      blogData.content,
      ['wrong'],
      blogData.mainImage
    );
    await testAddBlogPostWrongInput(
      blogData.language,
      blogData.title,
      blogData.content,
      ['html', 'c', 'c#', 'c++', 'python', 'openCv'],
      'mainImage'
    );
    await testAddBlogPostWrongInput('wrong', 'wrong', 'wrong_content', ['wrong'], 'wrong_mainImage');
  });

  // Update BlogPost
  test('if correct input for updateBlogPost give success', async () => {
    const blogPost = await addNewBlogPost();
    const resultUpdateBlogPost = await updateBlogPost(
      null,
      {
        language: blogData.language,
        id: blogPost.id,
        title: blogPostUpdateData.title,
        content: blogPostUpdateData.content,
        tags: blogPostUpdateData.tags,
        mainImage: blogPostUpdateData.mainImage,
      },
      makeContext()
    );

    const getUpdatedBlogPost = await getBlogPost(null, { language: blogData.language, id: blogPost.id });
    expect(resultUpdateBlogPost.statusCode).toBe(STATUS_CODE.SUCCESS);
    expect(resultUpdateBlogPost.message).toBeTruthy();
    expect(blogPostUpdateData.title).toBe(getUpdatedBlogPost.title);
    expect(blogPostUpdateData.content).toBe(getUpdatedBlogPost.content);
    expect(blogPostUpdateData.tags[0]).toBe(getUpdatedBlogPost.tag1);
    expect(blogPostUpdateData.tags[1]).toBe(getUpdatedBlogPost.tag2);
    expect(blogPostUpdateData.mainImage).toBe(getUpdatedBlogPost.mainImage);
    expect(blogPost.id).toBe(getUpdatedBlogPost.id);
  });

  test("if wrong input for updateBlogPost shouldn't work", async () => {
    const blogPost = await addNewBlogPost();
    const postId = blogPost.id;
    await testUpdateBlogPostWrongInput('wrong', postId, blogData.title, blogData.content, blogData.tags);
    await testUpdateBlogPostWrongInput(blogData.language, postId, 'wrong', blogData.content, blogData.tags);
    await testUpdateBlogPostWrongInput(
      blogData.language,
      postId,
      blogData.title,
      'wrong_content',
      blogData.tags
    );
    await testUpdateBlogPostWrongInput(blogData.language, postId, blogData.title, blogData.content, ['c++']);
    await testUpdateBlogPostWrongInput(blogData.language, postId, 'wrong', 'wrong_content', ['c++']);
  });

  // add BlogComment
  test('if correct input for BlogComment give success', async () => {
    const blogPost = await addNewBlogPost();
    const postId = blogPost.id;
    const result = await addBlogComment(
      null,
      {
        language: blogData.language,
        postId,
        content: blogPostUpdateData.content,
      },
      makeContext()
    );
    expect(result.statusCode).toBe(STATUS_CODE.SUCCESS);
  });

  test("if wrong input for BlogComment shouldn't work", async () => {
    const blogPost = await addNewBlogPost();
    const postId = blogPost.id;
    await testAddBlogCommentWrongInput(
      blogData.language,
      220,
      blogPostUpdateData.content,
      STATUS_CODE.INPUT_ERROR
    );
    await testAddBlogCommentWrongInput(blogData.language, postId, 'wrong', STATUS_CODE.VALIDATION_ERROR);
    await testAddBlogCommentWrongInput('wrong', postId, blogData.content, STATUS_CODE.VALIDATION_ERROR);
  });
});
