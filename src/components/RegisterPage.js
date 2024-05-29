import React, { useState } from 'react';
import logo from '../images/logo_white.png';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';
import { createUserWithEmailAndPassword, deleteUser, updateProfile } from "firebase/auth";
import { auth, db, doc, setDoc } from "../firebase.config";
import { collection } from "firebase/firestore";
import { CgSpinner } from "react-icons/cg";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: "",
    email: "",
    pass: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [code, setCode] = useState("");
  const [otp, setOtp] = useState("");
  const [isOTP, setIsOTP] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!values.name || !values.email || !values.pass) {
      setErrorMsg("Fill up all the fields");
      setLoading(false);
      return;
    }
    setErrorMsg("");

    try {
      const newUserCredential = await createUserWithEmailAndPassword(auth, values.email, "tempPassword");
      await deleteUser(newUserCredential.user);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErrorMsg("Email already in use.");
        setLoading(false);
        return;
      }
    }
    setErrorMsg("");

    try {
      const data = { "email": values.email }
      console.log(typeof (data), data);
      const response = await fetch('http://localhost:5000/send_otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.status === 'success') {
        setOtp(result.otp);
        setIsOTP(true);
        setCode("");
        setLoading(false);
        alert("OTP sent successfully!");
      } else {
        console.error('Error sending OTP:', result.error_message);
        setErrorMsg("Something went wrong. Try again!");
        setLoading(false);
      }
    } catch (error) {
      console.error('Error sending OTP:', error.message);
    }
  };

  const handleSubmission = (e) => {
    e.preventDefault();
    setLoading(true);
    if (!code) {
      setErrorMsg("Enter the OTP");
      setLoading(false);
      return;
    }
    setErrorMsg("");

    if (otp !== code) {
      setErrorMsg("Incorrect OTP!");
      setLoading(false);
      return;
    }
    setErrorMsg("");

    createUserWithEmailAndPassword(auth, values.email, values.pass)
      .then(async (res) => {
        const user = res.user;

        const docRef = collection(db, "users");
        await setDoc(doc(docRef, user.uid), {
          email: values.email,
          fullName: values.name,
          phoneNumber: values.phoneNumber || "",
          uid: user.uid,
          credits: 0,
        });


        await updateProfile(user, {
          displayName: values.name,
        });

        navigate("/login");
        setLoading(false);
        alert("Account created!");
      })
      .catch((err) => {
        setErrorMsg("Something went wrong. Please try again!");
        setLoading(false);
      });
  };

  return (
    <div className="background main">
      <div className="p-4 ">
        <img src={logo} alt="Intellimart logo" style={{ height: '8rem' }} />
      </div>
      <div className="text-center mb-3">
        <h1 style={{ fontFamily: "'Dancing Script', cursive", fontSize: '4rem', textShadow: '0 0 10px yellow' }}>
          Welcome to IntelliMart
        </h1>
      </div>
      <div className="mb-64 rounded-lg shadow-md relative z-10 ">
        <h1 className="text-4xl text-center text-black-500 mb-6" style={{ fontFamily: "'Cinzel',serif" }}>Register with Email</h1>
        <form className="max-w-md my-5 mx-auto text-black" //onSubmit={sendOTP} 
        >
          {!isOTP ? (<>
            <input type="text"
              placeholder="Full name"
              onChange={(event) =>
                setValues((prev) => ({ ...prev, name: event.target.value }))
              }
            />
            <input type="email"
              placeholder="Email"
              onChange={(event) =>
                setValues((prev) => ({ ...prev, email: event.target.value }))
              }
            />
            <input type="password"
              placeholder="Password"
              onChange={(event) =>
                setValues((prev) => ({ ...prev, pass: event.target.value }))
              }
            />

            <b className='text-red-500'>{errorMsg}</b>
            <button className="primary relative" onClick={sendOTP}>
              {loading && (
                <CgSpinner size={20} className="absolute animate-spin" />
              )}
              <span>Proceed</span>
            </button>

          </>) : (<>

            <input type="text"
              value={code}
              placeholder="OTP"
              onChange={(event) =>
                setCode(event.target.value)
              }
            />
            <b className='text-red-500'>{errorMsg}</b>
            <button className="primary relative w-[200px]" onClick={handleSubmission}>
              {loading && (
                <CgSpinner size={20} className="absolute animate-spin" />
              )}
              <span>Register</span>
            </button>

            <button
              className="w-full mt-2 py-2 text-white primary rounded-md"
              onClick={() => window.location.reload()}
            >
              Go Back
            </button>
          </>)}
          <div className="text-center py-2 text-yellow-100">
            To Login with Email,{' '}
            <Link className="underline text-red-500" to='/login'>Click here</Link>
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

export default RegisterPage