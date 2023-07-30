import React, { useState } from "react";
import { useRegisterUserMutation } from "../Apis/authApi";
import { inputHelper, toastNotify } from "../Helper";
import { apiResponse } from "../Interfaces";
import { SD_Roles } from "../Utility/SD";
import { useNavigate } from "react-router-dom";
import { MainLoader } from "../Components/Page/Common";
interface FormData {
  userName: string,
  email: string;
    password: string,
    role: string,
    name: string,
    confirmPassword: string,
    phoneNumber: string;
}

function Register() {
  const [registerUser] = useRegisterUserMutation();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    userName: "",
    email: "",
    password: "",
    confirmPassword: '',
    role: "",
    name: "",
    phoneNumber: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const handleUserInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const tempData = inputHelper(e, formData);
    setFormData(tempData);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const response: apiResponse = await registerUser({
      userName: formData.userName,
      password: formData.password,
      role: formData.role,
      name: formData.name,
      phoneNumber : formData.phoneNumber,
    });
    if (response.data && validateForm()) {
      toastNotify("Registeration successful! Please login to continue.");
      navigate("/login");
    } else if (response.error) {
      toastNotify(response.error.data.errorMessages[0], "error");
    }
    setLoading(false);
  };
  const validateForm = () => {
    const { name, email, phoneNumber, password, confirmPassword } = formData;
    const errors: Partial<FormData> = {};

    if (!name) {
      errors.name = 'Full Name is required';
    } else if (!isValidFullName(name)) {
      errors.name = 'Full Name should contain alphabets only and not exceed 50 characters';
    }

    if (!email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Invalid email format';
    }

    if (!phoneNumber) {
      errors.phoneNumber = 'Phone Number is required';
    } else if (!isValidPhoneNumber(phoneNumber)) {
      errors.phoneNumber = 'Invalid phone number format , please ensure 10 digit number';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (!isValidPassword(password)) {
      errors.password =
        'Password must have at least 8 characters, 1 special character, 1 number, and 1 alphabet';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidFullName = (name: string) => {
    const nameRegex = /^[A-Za-z\s]{1,50}$/;
    return nameRegex.test(name);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhoneNumber = (phoneNumber: string) => {
    const phoneNumberRegex = /^\d{10}$/;
    return phoneNumberRegex.test(phoneNumber);
  };

  const isValidPassword = (password: string) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };



  return (
    <div className="container text-center">
    {loading && <MainLoader />}
    <form method="post" onSubmit={handleSubmit}>
      <h1 className="mt-5">Register</h1>
      <div className="mt-5">
        <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
          <input
            type="text"
            className="form-control"
            placeholder="Enter Username"
            required
            name="userName"
            value={formData.userName}
            onChange={handleUserInput}
          />  
        </div>
        <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
          <input
            type="text"
            className="form-control"
            placeholder="Enter Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>
        <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
          <input
            type="email"
            className="form-control"
            placeholder="Enter Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
          <input
            type="tel"
            className="form-control"
            placeholder="Enter Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
          {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
        </div>
        <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
          <input
            type="password"
            className="form-control"
            placeholder="Enter Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>
        <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
          <input
            type="password"
            className="form-control"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {errors.confirmPassword && (
            <span className="error">{errors.confirmPassword}</span>
          )}
        </div>
        <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
          <select
            className="form-control form-select"
            required
            value={formData.role}
            name="role"
            onChange={handleUserInput}
          >
            <option value="">--Select Role--</option>
            <option value={`${SD_Roles.CUTOMER}`}>Customer</option>
            <option value={`${SD_Roles.ADMIN}`}>Admin</option>
          </select>
        </div>
      </div>
      <div className="mt-5">
        <button type="submit" className="btn btn-success" disabled={loading}>
          Register
        </button>
      </div>
    </form>
  </div>
  );
}

export default Register;