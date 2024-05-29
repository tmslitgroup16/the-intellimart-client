import React, { useState } from 'react';
import logo from '../images/logo_white.png';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';
import { createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword } from "firebase/auth";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase.config";
import { CgSpinner } from "react-icons/cg";

const LoginPage = () => {

  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: "",
    pass: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!values.email) {
      setErrorMsg("Enter your email first");
      return;
    }
    setErrorMsg("");

    const auth = getAuth();

    try {
      const newUserCredential = await createUserWithEmailAndPassword(auth, values.email, "tempPassword");

      setErrorMsg("No such account found with this email id.");

      await deleteUser(newUserCredential.user);

    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        //console.log("Email already exists.");
        sendPasswordResetEmail(auth, values.email)
          .then(() => {
            alert("Password reset email sent!");
          })
          .catch((error) => {
            setErrorMsg(error.message);
          });
      } else {
        console.error("Error checking email existence:", error.message);
      }
    }
  };



  const handleSubmission = (e) => {
    e.preventDefault();
    setLoading(true);
    if (!values.email || !values.pass) {
      setErrorMsg("Fill up all the fields");
      setLoading(false);
      return;
    }
    else
      setErrorMsg("");

    setSubmitButtonDisabled(true);

    signInWithEmailAndPassword(auth, values.email, values.pass)
      .then((res) => {
        const user = res.user;
        setSubmitButtonDisabled(false);
        if (!user) {
          setErrorMsg("No account found! Please create an account before login.");
          setLoading(false);
        } else {
          navigate("/recommendation-1");
        }
      })
      .catch((err) => {
        setSubmitButtonDisabled(false);
        //setErrorMsg(err.message);
        console.log(err.message);
        if (err.code === "auth/invalid-credential")
          setErrorMsg("Invalid credentials!");
        else
          setErrorMsg("Somethig went wrong. Please try again!");
        setLoading(false);
      });
  };

  return (
    <div className="background main">
      <div className="p-4">
        <img src={logo} alt="Intellimart logo" style={{ height: '8rem' }} />
      </div>
      <div className="text-center mb-3">
        <h1 style={{ fontFamily: "'Dancing Script', cursive", fontSize: '4rem', textShadow: '0 0 10px yellow' }}>
          Welcome to IntelliMart
        </h1>
      </div>
      <div className="mb-64 rounded-lg shadow-md relative z-10 ">
        <h1 className="text-4xl text-center text-black-500 mb-6" style={{ fontFamily: "'Cinzel',serif" }}>Login with Email</h1>
        <form className="max-w-md mx-auto text-black" onSubmit={handleSubmission}>
          <input
            className="w-full mb-2 px-3 py-2 border"
            type="email"
            placeholder="Email"
            name="email"
            onChange={(event) =>
              setValues((prev) => ({ ...prev, email: event.target.value }))
            }
          />
          <input
            className="w-full mb-2 px-3 py-2 border"
            type="password"
            placeholder="Password"
            name="password"
            onChange={(event) =>
              setValues((prev) => ({ ...prev, pass: event.target.value }))
            }
          />
          <b className='text-red-500'>{errorMsg}</b>
          <button
            className="w-full mt-2 py-2 text-white primary rounded-md relative" // Add relative positioning
            onClick={handleSubmission}
            disabled={submitButtonDisabled}
          >
            {loading && ( 
              <CgSpinner size={20} className="absolute animate-spin" />
            )}
            Login
          </button>

          <div className="text-center py-2 text-yellow-100">
            Forgot paswword?{' '}
            <Link className="underline text-red-500" onClick={handleForgotPassword}>
              Click here
            </Link>
          </div>

          <div className="text-center py-2 text-yellow-100">
            To Register with Email,{' '}
            <Link className="underline text-red-500" to="/register">
              Click here
            </Link>
          </div>

          <div className="text-center py-2 text-yellow-100">
            To Register/Login with Phone number,{' '}
            <Link className="underline text-red-500" to="/phone">
              Click here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage