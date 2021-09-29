import bcrypt from 'bcrypt';
import * as yup from 'yup';
import databaseUtils from '../db/database.js';
import { TABLES, LOGIN_ERRORS, ROLE } from '../constants.js';
import {
  createJWTToken,
  findUserByEmail,
  findUserByName,
  checkInputValidation,
  createInputErrorResponse,
  createSuccessResponse,
} from '../utility.js';

const adminSignUp = async (_, { email, username, password, siteName }) => {
  const newPasswordHash = await bcrypt.hash(password, 10);
  const User = databaseUtils().loadModel(TABLES.USER_TABLE);
  const SiteInformation = databaseUtils().loadModel(TABLES.SITE_INFORMATION);
  // https://stackoverflow.com/a/12019115/2586447
  const loginAdminSchema = await yup.object().shape({
    email: yup.string().email().required(),
    username: yup
      .string()
      .required()
      .min(3)
      .matches(/^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/),
    password: yup.string().required().min(6),
    siteName: yup.string().required().min(3),
  });
  const validationResult = await checkInputValidation(loginAdminSchema, {
    email,
    username,
    password,
    siteName,
  });
  if (validationResult !== true) {
    return validationResult;
  }
  const userCount = await User.count();
  if (userCount > 0) {
    return createInputErrorResponse(LOGIN_ERRORS.ADMIN_EXIST);
  }
  let user = await findUserByName(username);
  if (user) {
    return createInputErrorResponse(LOGIN_ERRORS.EXIST_USER);
  }
  user = await findUserByEmail(email);
  if (user) {
    return createInputErrorResponse(LOGIN_ERRORS.EMAIL_EXIST);
  }
  await User.create({
    email,
    publicName: username,
    password: newPasswordHash,
    isEmailVerified: false,
    role: ROLE.SUPER_ADMIN,
  });
  await SiteInformation.create({
    name: siteName,
  });
  user = await findUserByName(username);
  return createSuccessResponse(createJWTToken(user));
};

export { adminSignUp };
