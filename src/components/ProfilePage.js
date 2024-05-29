import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPen, faSave } from '@fortawesome/free-solid-svg-icons';
import defaultProfilePic from '../images/default-profile-pic.jpg';
import '../styles/profile-card-styles.css';
import { updateProfile } from "firebase/auth";
import { auth, db } from "../firebase.config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
    });
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            const userDocRef = doc(db, "users", auth.currentUser.uid);
            const userDocSnapshot = await getDoc(userDocRef);

            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                setUserDetails(userData);
            }
        };

        fetchUserDetails();
    }, []);

    const PhoneAuthProvider = () => {
        if (auth.currentUser) {
            for (const provider of auth.currentUser.providerData) {
                return provider.providerId;
            }
        }
    }

    const handleSave = async () => {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
            fullName: userDetails.fullName,
            email: userDetails.email,
            phoneNumber: userDetails.phoneNumber,
        });

        await updateProfile(auth.currentUser, {
            displayName: userDetails.fullName,
        });

        alert("Details updated successfully!");
    };

    return (
        <>
            <div className="container ">
                <div className="profile-card-wrapper">
                    <div className="profile-card-left flex items-center justify-center ">
                        <img src={defaultProfilePic} alt="user" width="100" />
                        <div className="flex flex-col items-center justify-center">
                            <h4>User ID</h4>
                            <p>{auth.currentUser ? auth.currentUser.uid : 'No user'}</p>
                        </div>
                    </div>
                    <div className="profile-card-right">
                        <div className="info">
                            <h3 className="text-center">My Profile</h3>
                            <div className="info_data">
                                <div className="data">
                                    <h4>Name</h4>
                                    <input
                                        type="name"
                                        value={userDetails.fullName}
                                        onChange={(e) =>
                                            setUserDetails({ ...userDetails, fullName: e.target.value })
                                        }
                                        disabled={!isEditMode}
                                    />
                                </div>
                                <div className="data">
                                    <h4>Email</h4>
                                    <input
                                        type="email"
                                        value={userDetails.email}
                                        onChange={(e) =>
                                            setUserDetails({ ...userDetails, email: e.target.value })
                                        }
                                        disabled={PhoneAuthProvider() === 'phone' || !isEditMode}
                                    />
                                </div>
                                <div className="data">
                                    <h4>Phone</h4>
                                    <input
                                        type="text"
                                        value={userDetails.phoneNumber}
                                        onChange={(e) =>
                                            setUserDetails({ ...userDetails, phoneNumber: e.target.value })
                                        }
                                        disabled={PhoneAuthProvider() === 'phone' || !isEditMode}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="social_media">
                            <ul>
                                <li>
                                    <button
                                        className="icon-button"
                                        onClick={() => {
                                            if (isEditMode) {
                                                handleSave();
                                            }
                                            setIsEditMode(!isEditMode);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={isEditMode ? faSave : faUserPen} />
                                        {!isEditMode && (
                                            <span className="hover-text">Edit Profile</span>
                                        )}
                                        {isEditMode && (
                                            <span className="hover-text">Save</span>
                                        )}

                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <button
                    className="bg-gradient-to-r from-teal-500 to-teal-700 text-white px-6 py-3 text-lg fixed bottom-4 left-4"
                    onClick={() => navigate('/')}
                >
                    Go Back
                </button>
            </div>
        </>
    )
}

export default ProfilePage;
