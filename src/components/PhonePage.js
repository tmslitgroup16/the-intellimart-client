import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import logo from '../images/logo_white.png';
import OtpInput from "otp-input-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { auth, db } from "../firebase.config";
import { RecaptchaVerifier, signInWithPhoneNumber, updateProfile } from "firebase/auth";
import { toast, Toaster } from "react-hot-toast";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { CgSpinner } from "react-icons/cg";
import '../styles/OtpInputStyles.css';

const PhonePage = () => {

  const navigate=useNavigate();
  const [otp, setOtp] = useState("");
  const [ph, setPh] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function onCaptchVerify() {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            onSignup();
          },
          "expired-callback": () => {},
        },
      );
    }
  }

  function onSignup() {
    setLoading(true);
    onCaptchVerify();
    
    const appVerifier = window.recaptchaVerifier;

    const formatPh = "+" + ph;

    signInWithPhoneNumber(auth, formatPh, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setLoading(false);
        setShowOTP(true);
        setErrorMsg("");
        toast.success("OTP sent successfully!");
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        if(error.code === "auth/invalid-phone-number")
          setErrorMsg("Invalid Phone number!");
      });
  }

  function onOTPVerify() {
    setLoading(true);
    window.confirmationResult
      .confirm(otp)
      .then(async (res) => {
        
        const user = res.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        await setDoc(userDocRef, {
          email: user.email || "",
          fullName: user.fullName || "",
          phoneNumber: user.phoneNumber,
          uid: user.uid,
          credits: 0,
        });
      }
      else{
        await updateProfile(user, {
          displayName: userDocSnapshot.data().fullName,
        });
      }

        console.log(res);
        setUser(res.user);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        if(err.code === "auth/invalid-verification-code")
          setErrorMsg("Invalid OTP!");
        else
          setErrorMsg("Something went wrong. Please try again!");
      });
  }

return (
  <div className="background main">
      <Toaster toastOptions={{ duration: 4000 }} />
      <div id="recaptcha-container"></div>
      {user ? (navigate("/recommendation-1")
      ) : (
        <>
      <div className="p-4">
          <img src={logo} alt="Intellimart logo" style={{ height: '8rem' }} />
      </div>
      
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="text-center mt-16 mb-3">
          <h1 style={{ fontFamily: "'Dancing Script', cursive", fontSize: '4rem', textShadow: '0 0 10px yellow' }}>
              Welcome to IntelliMart
          </h1>
      </div>
      <div className="mb-64 rounded-lg shadow-md relative z-10 ">
          <h1 className="text-4xl text-center text-black-500 mb-6" style={{ fontFamily: "'Cinzel',serif" }}>Login with Phone Number</h1>
          <div className="max-w-md mx-auto text-black">
          {showOTP ? ( <>
            <OtpInput
                value={otp}
                onChange={setOtp}
                OTPLength={6}
                otpType="number"
                disabled={false}
                autoFocus
                className="otp-container "
              ></OtpInput>
              <b className='text-red-500 mt-2 flex justify-center'>{errorMsg}</b>
              <button
                className="w-[full] mt-2 py-2 text-white primary rounded-md relative flex justify-center mx-auto"
                onClick={onOTPVerify}
                disabled={loading}
                style={{ width: '90%', }}
              >
                {loading && (
                  <CgSpinner size={20} className="absolute animate-spin" />
                )}
                <span className={loading ? 'ml-8 opacity-0' : 'ml-0'}>Verify OTP</span>
              </button>

              <button
                  className="w-[full] mt-2 py-2 text-white primary rounded-md relative flex justify-center mx-auto"
                  onClick={() => window.location.reload()}
                  style={{ width: '90%', }}
              >
                  Go Back
              </button>
              </>
          ) : ( <>
            <div className="flex flex-col items-center">
              <div style={{ marginLeft: '15px', width: '70%' }}> {/* Container with left margin */}
                <PhoneInput 
                  country={"in"} value={ph} onChange={setPh}
                  inputStyle={{ width: '95%' }}
                />
              </div>
              <b className='text-red-500'>{errorMsg}</b>
              <button
                className="w-full py-2 mt-5 text-white primary rounded-md relative mx-auto"
                onClick={onSignup}
                disabled={loading}
                style={{ width: '70%'}}
              >
                {loading && (
                  <CgSpinner size={20} className="absolute animate-spin" />
                )}
                <span>Send OTP via SMS</span>
              </button>
            </div>


              </>
          )}
              <div className="text-center pt-2 text-yellow-100">
                  To Login with Email,{' '}
                  <Link className="underline text-red-500" to="/login">
                      Click here
                  </Link>
              </div>

              <div className="text-center pb-2 text-yellow-100">
                  To Register with Email,{' '}
                  <Link className="underline text-red-500" to="/register">
                      Click here
                  </Link>
              </div>
          </div>
      </div>
      </div>
      </>
      )}
  </div>
);

}

export default PhonePage