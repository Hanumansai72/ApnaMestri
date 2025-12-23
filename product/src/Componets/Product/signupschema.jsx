import * as yup from 'yup';

export const signupSchema = yup.object({
  Full_Name: yup
    .string()
    .min(6, 'Name must be at least 6 characters')
    .required('Name is required'),

  Emailaddress: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),

  Phone_Number: yup
    .number()
    .min(10, 'Password must be at least 10 characters')
    .required('Password is required'),
    
    Password: yup
  .string()
  .oneOf([yup.ref('Password')], 'Passwords do not match')
  .required('Confirm password is required'),
  confirmPassword: yup
  .string()
  .oneOf([yup.ref('Password')], 'Passwords do not match')
  .required('Confirm password is required'),



});
