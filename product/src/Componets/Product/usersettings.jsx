import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import axios from 'axios';
import NavaPro from './navbarproduct';
import Footer from './footer';

const ProfileSettingsRedesigned = () => {
    const [profile, setProfile] = useState({
        Full_Name: '',
        Emailaddress: '',
        Phone_Number: '',
        Location: '',
        Password: ''
    });

    const [initialProfile, setInitialProfile] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const id = localStorage.getItem("userid");

    useEffect(() => {
        if (id) {
            axios.get(`https://backend-d6mx.vercel.app/myprofile/${id}`)
                .then(res => {
                    const fetchedData = {
                        Full_Name: res.data.Full_Name || '',
                        Emailaddress: res.data.Emailaddress || '',
                        Phone_Number: res.data.Phone_Number || '',
                        Location: res.data.Location || '',
                        Password: ''
                    };
                    setProfile(fetchedData);
                    setInitialProfile(fetchedData);
                })
                .catch(err => {
                    console.log("Error fetching profile:", err);
                });
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleReset = (e) => {
        e.preventDefault();
        if (initialProfile) {
            setProfile(initialProfile);
        }
        setNewPassword('');
        setConfirmNewPassword('');
    };

    const handleSaveChanges = (e) => {
        e.preventDefault();
        
        if (newPassword && newPassword !== confirmNewPassword) {
            alert("New passwords do not match!");
            return;
        }

        const dataToSave = { ...profile };
        
        if (newPassword) {
            dataToSave.Password = newPassword;
        } else {
            delete dataToSave.Password;
        }

        console.log("Data to save:", dataToSave);

        // Uncomment for real API call:
        /*
        axios.put(`https://backend-d6mx.vercel.app/myprofile/${id}`, dataToSave)
            .then(res => {
                alert("Profile updated successfully!");
                setInitialProfile(profile);
            })
            .catch(err => {
                console.error("Failed to update profile:", err);
                alert("An error occurred while saving changes.");
            });
        */
        alert("Changes would be saved here. Check the console for the data object.");
    };

    return (
        <>
            <style>
                {`
                    body {
                        background-color: #1a1a2e;
                        color: #f0f0f0;
                        font-family: 'Poppins', sans-serif;
                    }
                    .settings-container {
                        max-width: 1200px;
                        margin: 50px auto;
                        padding: 20px;
                    }
                    .settings-form {
                        background-color: #2c3e50;
                        border-radius: 15px;
                        overflow: hidden;
                        padding: 30px;
                    }
                    .user-header {
                        background: linear-gradient(90deg, #FFD700, #FFC107);
                        padding: 25px;
                        margin: -30px -30px 30px -30px;
                        display: flex;
                        align-items: center;
                        gap: 20px;
                        color: #000;
                        font-weight: bold;
                    }
                    .user-icon {
                        font-size: 24px;
                        background-color: rgba(0, 0, 0, 0.2);
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .form-group-custom {
                        margin-bottom: 20px;
                    }
                    .form-group-custom label {
                        display: block;
                        font-size: 0.9rem;
                        color: #bdc3c7;
                        margin-bottom: 8px;
                        font-weight: 500;
                    }
                    .form-control-custom {
                        width: 100%;
                        padding: 12px 15px;
                        background-color: #34495e;
                        border: 1px solid #7f8c8d;
                        border-radius: 8px;
                        color: #ecf0f1;
                        font-size: 1rem;
                        transition: border-color 0.3s, box-shadow 0.3s;
                    }
                    .form-control-custom:focus {
                        outline: none;
                        border-color: #FFD700;
                        box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.3);
                    }
                    .form-control-custom[disabled] {
                        background-color: #2c3e50;
                        cursor: not-allowed;
                    }
                    .section-title {
                        color: #ecf0f1;
                        margin-top: 30px;
                        margin-bottom: 20px;
                        font-weight: 600;
                        border-bottom: 1px solid #34495e;
                        padding-bottom: 10px;
                    }
                    .password-input-wrapper {
                        position: relative;
                        display: flex;
                        align-items: center;
                    }
                    .toggle-password {
                        position: absolute;
                        right: 15px;
                        cursor: pointer;
                        color: #95a5a6;
                    }
                    .toggle-password:hover {
                        color: #ecf0f1;
                    }
                    .form-actions {
                        display: flex;
                        justify-content: flex-start;
                        gap: 15px;
                        margin-top: 30px;
                    }
                    .btn-custom {
                        padding: 12px 25px;
                        border: none;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                    }
                    .btn-save {
                        background-color: #FFD700;
                        color: black;
                    }
                    .btn-save:hover {
                        opacity: 0.9;
                        transform: translateY(-2px);
                    }
                    .btn-reset {
                        background-color: transparent;
                        color: #bdc3c7;
                        border: 1px solid #7f8c8d;
                    }
                    .btn-reset:hover {
                        background-color: #34495e;
                        color: white;
                    }
                `}
            </style>

            <NavaPro /> 
            <Container className="settings-container">
                <form className="settings-form" onSubmit={handleSaveChanges}>
                    <div className="user-header">
                        <div className="user-icon"><i className="fa-solid fa-user"></i></div>
                        <div>
                            <h4 className="mb-0">{profile.Full_Name || 'User Settings'}</h4>
                            <p className="mb-0 small">{profile.Emailaddress}</p>
                        </div>
                    </div>
                    
                    <div className="form-group-custom">
                        <label htmlFor="Full_Name">Full Name</label>
                        <input
                            type="text"
                            id="Full_Name"
                            name="Full_Name"
                            className="form-control-custom"
                            value={profile.Full_Name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group-custom">
                        <label htmlFor="Emailaddress">Email Address</label>
                        <input
                            type="email"
                            id="Emailaddress"
                            name="Emailaddress"
                            className="form-control-custom"
                            value={profile.Emailaddress}
                            disabled
                        />
                    </div>
                    
                    <div className="form-group-custom">
                        <label htmlFor="Phone_Number">Phone Number</label>
                        <input
                            type="text"
                            id="Phone_Number"
                            name="Phone_Number"
                            className="form-control-custom"
                            value={profile.Phone_Number}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group-custom">
                        <label htmlFor="Location">Location</label>
                        <input
                            type="text"
                            id="Location"
                            name="Location"
                            className="form-control-custom"
                            value={profile.Location}
                            onChange={handleChange}
                        />
                    </div>

                    <h5 className="section-title">Change Password</h5>
                    <div className="form-group-custom">
                        <label htmlFor="newPassword">New Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                id="newPassword"
                                className="form-control-custom"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <i 
                                className={`toggle-password fa-solid ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            ></i>
                        </div>
                    </div>

                    <div className="form-group-custom">
                        <label htmlFor="confirmNewPassword">Confirm New Password</label>
                         <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmNewPassword"
                                className="form-control-custom"
                                placeholder="Confirm new password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                            />
                            <i 
                                className={`toggle-password fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            ></i>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-custom btn-save">
                           <i className="fa-solid fa-save me-2"></i> Save Changes
                        </button>
                        <button type="button" className="btn-custom btn-reset" onClick={handleReset}>
                            <i className="fa-solid fa-rotate-left me-2"></i> Reset
                        </button>
                    </div>
                </form>
            </Container>
            <Footer /> 
        </>
    );
};

export default ProfileSettingsRedesigned;
