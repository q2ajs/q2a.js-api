import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { signUp, login } from '../../mutations/login.js';
import { findUserById } from '../../utility.js';
import { LOGIN_ERRORS, STATUS_CODE } from '../../constants.js';

describe('login workflow', () => {
  const data = {
    username: 'test_name_login',
    email: 'test_login@test.com',
    password: '123654',
  };
  const userSignUp = async (email, username, password) => {
    const user = await signUp(null, {
      email,
      username,
      password,
    });
    return user;
  };
  const testSignUpWrongInput = async (email, username, password, statusCode) => {
    const result = await userSignUp(email, username, password);
    expect(result.statusCode).toBe(statusCode);
  };

  const testLoginWrongInput = async (username, password, errorMessage) => {
    let user;
    try {
      user = await login(null, { username, password });
    } catch (e) {
      expect(e.message).toBe(errorMessage);
    }
    if (user) expect(`Login should give error with:' ${username},${password},`).toBe(false);
  };

  test('Sign up with correct username and password works', async () => {
    const result = await userSignUp(data.email, data.username, data.password, data.language);
    const decodedUser = await jwt.decode(result.message);
    const userInDb = await findUserById(decodedUser.id);
    const isValidPassword = await bcrypt.compare(data.password, userInDb.password);
    expect(decodedUser.publicName).toBe(data.username);
    expect(`${decodedUser.exp - decodedUser.iat}`).toBe(process.env.JWT_EXPIRE_TIME); // 7 days
    expect(userInDb.publicName).toBe(data.username);
    expect(userInDb.email).toBe(data.email);
    expect(isValidPassword).toBe(true);
  });

  test("if Sign up with the wrong username or password don't work", async () => {
    await testSignUpWrongInput(
      'wrong_email',
      data.username,
      'correct_password',
      STATUS_CODE.VALIDATION_ERROR
    );
    await testSignUpWrongInput(data.email, data.username, '12', STATUS_CODE.VALIDATION_ERROR);
    await testSignUpWrongInput('wrong_email', 'ab', 'er', STATUS_CODE.VALIDATION_ERROR);
    await testSignUpWrongInput(data.email, ')wrong_username', data.password, STATUS_CODE.VALIDATION_ERROR);
    await testSignUpWrongInput(data.email, 'a__wrong_username', data.password, STATUS_CODE.VALIDATION_ERROR);
    await testSignUpWrongInput(data.email, 'er', data.password, STATUS_CODE.VALIDATION_ERROR);
    await testSignUpWrongInput(data.email, '_wrong_username', data.password, STATUS_CODE.VALIDATION_ERROR);
  });

  test('if Login with the correct username and password works', async () => {
    const user = await login(null, { username: 'test_name', password: '123654' });
    expect(user).toBeTruthy();
  });

  test('if Login with wrong username or password should not work', async () => {
    await testLoginWrongInput('test_name', 'wrong_password', LOGIN_ERRORS.INVALID_LOGIN);
    await testLoginWrongInput('wrong_test_name', '123654', LOGIN_ERRORS.NO_USER);
    await testLoginWrongInput('wrong_test_name', 'wrong_password', LOGIN_ERRORS.NO_USER);
  });
});
