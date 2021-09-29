import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { adminSignUp } from '../../mutations/adminSignUp.js';
import { findUserById } from '../../utility.js';
import { ROLE, LOGIN_ERRORS, TABLES, STATUS_CODE } from '../../constants.js';
import { clearTable } from '../../testUtility.js';
import databaseUtils from '../../db/database';

describe('Admin signUp workflow', () => {
  const data = {
    email: 'test_admin_signUp@test.com',
    username: 'test_admin',
    password: '123654544',
    siteName: 'Q2A',
  };
  const userSignUp = async (email, username, password, siteName) => {
    const user = await adminSignUp(null, {
      email,
      username,
      password,
      siteName,
    });
    return user;
  };
  const createUser = async () => {
    const { User } = global;
    const oldUser = await User.create({
      publicName: 'test_name',
      profileImage: 'test_image.png',
      email: 'test@test.com',
      isEmailVerified: true,
      about: 'about_test',
      theme: 'light',
      role: 'SUPER_ADMIN',
    });

    return { oldUser };
  };
  const testAdminSignUpWrongInput = async (email, username, password, siteName, statusCode) => {
    // await expect(userSignUp(email, username, password, siteName)).rejects.toThrow(LOGIN_ERRORS.INVALID_LOGIN);
    const result = await userSignUp(email, username, password, siteName);
    expect(result.statusCode).toBe(statusCode);
  };
  test('if admin Sign up with correct username and password works', async () => {
    await clearTable(TABLES.SITE_INFORMATION);
    await clearTable(TABLES.USER_TABLE);
    const jwtResult = await userSignUp(data.email, data.username, data.password, data.siteName);
    const decodedJwt = await jwt.decode(jwtResult.message);
    const decodedUser = await findUserById(decodedJwt.id);
    const isValidPassword = await bcrypt.compare(data.password, decodedUser.password);
    expect(decodedUser.publicName).toBe(data.username);
    expect(`${decodedJwt.exp - decodedJwt.iat}`).toBe(process.env.JWT_EXPIRE_TIME); // 7 days
    expect(decodedUser.publicName).toBe(data.username);
    expect(decodedUser.email).toBe(data.email);
    expect(isValidPassword).toBe(true);
    expect(decodedUser.role).toBe(ROLE.SUPER_ADMIN);
    const SiteInformation = databaseUtils().loadModel(TABLES.SITE_INFORMATION);
    const siteInformation = await SiteInformation.findOne({
      where: {
        name: data.siteName,
      },
    });
    expect(siteInformation.name).toBe(data.siteName);
  });
  test("if Admin Sign up and user already exist in database, it shouldn't work", async () => {
    await clearTable(TABLES.USER_TABLE);
    await clearTable(TABLES.SITE_INFORMATION);
    await createUser();
    const result = await userSignUp(data.email, data.username, data.password, data.siteName);
    expect(result.statusCode).toBe(STATUS_CODE.INPUT_ERROR);
    expect(result.message).toBe(LOGIN_ERRORS.ADMIN_EXIST);
  });
  test("if Admin Sign up with wrong username or password ,it shouldn't work", async () => {
    await clearTable(TABLES.USER_TABLE);
    await clearTable(TABLES.SITE_INFORMATION);
    await testAdminSignUpWrongInput(
      'wrong_email',
      data.username,
      'correct_password',
      data.siteName,
      STATUS_CODE.VALIDATION_ERROR
    );
    await testAdminSignUpWrongInput(
      data.email,
      data.username,
      '12',
      data.siteName,
      STATUS_CODE.VALIDATION_ERROR
    );
    await testAdminSignUpWrongInput('wrong_email', 'ab', 'er', data.siteName, STATUS_CODE.VALIDATION_ERROR);
    await testAdminSignUpWrongInput(
      data.email,
      ')wrong_username',
      data.password,
      data.siteName,
      STATUS_CODE.VALIDATION_ERROR
    );
    await testAdminSignUpWrongInput(
      data.email,
      'a__wrong_username',
      data.password,
      data.siteName,
      STATUS_CODE.VALIDATION_ERROR
    );
    await testAdminSignUpWrongInput(
      data.email,
      'er',
      data.password,
      data.siteName,
      STATUS_CODE.VALIDATION_ERROR
    );
    await testAdminSignUpWrongInput(
      data.email,
      '_wrong_username',
      data.password,
      data.siteName,
      STATUS_CODE.VALIDATION_ERROR
    );
  });
});
