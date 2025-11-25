import React, { useState, useEffect, useRef } from "react";
import "./Profile.css";
import avatar from "../../assets/images/candidate-profile.png";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import authService from "../../ApiServices/ApiServices";
import removeIcon from "../../assets/images/remove_icon.png";
import editIcon from "../../assets/images/edit_icon.png";
import { useParams } from "react-router-dom";
import Loader from "react-js-loader";
import {API_URL1} from '../../ApiServices/ApiServices';

function ProfileCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const [cropperVisible, setCropperVisible] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [mail, setMail] = useState("");
  const [iconColor, setIconColor] = useState("#000");
  const [mobile, setMobile] = useState("");
  const [imageToCrop, setImageToCrop] = useState(null);
  const cropperRef = useRef();
  const fileInputRef = useRef();
  const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage"));

  // State variables for editing
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editMail, setEditMail] = useState("");
  const [editMobile, setEditMobile] = useState("");

  // State for handling transitions
  const [showEditCard, setShowEditCard] = useState(false);

  const getInitials = (name) => {
    if (!name.trim()) return "U";
    return name
      .split(" ")
      .map((n) => n.charAt(0).toUpperCase())
      .join("");
  };

  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
  };

  useEffect(() => {
    setIconColor(getRandomColor());
  }, []);

  const updateLoadingState = async (percentage, delay = 0) => {
    setLoadingPercentage(percentage);
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  };

  useEffect(() => {
    const updateProfileImage = async () => {
      setProfileImage(localStorage.getItem("profileImage"));
    };

    const fetchProfileDetails = async () => {
      setIsLoading(true);
      try {
        await updateLoadingState(10);
        const details_data = await authService.details();
        
        await updateLoadingState(40);
        if (details_data.type === "User") {
          setName(details_data.details[1].first_name);
          setMail(details_data.details[1].email);
          setRole(details_data.details[5].name);
          setMobile(details_data.details[3].mobile);
          setEditName(details_data.details[1].first_name);
          setEditRole(details_data.details[5].name);
          setEditMail(details_data.details[1].email);
          setEditMobile(details_data.details[3].mobile);
        } else if (details_data.type === "Organization") {
          setName(details_data.details[5].first_name);
          setMail(details_data.details[5].email);
          setMobile(details_data.details[1].mobile);
          localStorage.setItem('Company_name', details_data.details[5].first_name);
          
          const fetchedRole = details_data.details[3].name;
          if (fetchedRole === 'ADMIN' || fetchedRole === 'Organization Admin') {
            localStorage.setItem('role', 'ADMIN');
            setRole('ADMIN');
          }

          setEditName(details_data.details[5].first_name);
          setEditRole(details_data.details[3].name);
          setEditMail(details_data.details[5].email);
          setEditMobile(details_data.details[1].mobile);
        }

        await updateLoadingState(70);
        const image = await authService.getprofile();
        try {
          const url = image.profile_image?.image || image.organization_image?.image;
          if (url) {
            const baseUrl = API_URL1;
            const fullImageUrl = `${baseUrl.replace(/\/$/, "")}${url}`;
            setProfileImage(fullImageUrl);
            localStorage.setItem("profileImage", fullImageUrl);
          }
        } catch (error) {
          localStorage.setItem("profileImage", avatar);
        }

        await updateLoadingState(100, 300); // Stay at 100% for 300ms
      } catch (error) {
        console.error("Error fetching profile details:", error);
        localStorage.setItem("profileImage", avatar);
        await updateLoadingState(100, 300); // Ensure we reach 100% even on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileDetails();
    window.addEventListener("profileImageUpdated", updateProfileImage);

    return () => {
      window.removeEventListener("profileImageUpdated", updateProfileImage);
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result);
        setCropperVisible(true);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const handleSaveCrop = async () => {
    setIsLoading(true);
    try {
      await updateLoadingState(20);
      const cropper = cropperRef.current?.cropper;
      if (cropper) {
        const croppedCanvas = cropper.getCroppedCanvas();
        await updateLoadingState(40);
        croppedCanvas.toBlob(async (blob) => {
          const formData = new FormData();
          formData.append("image", blob, "profile.jpg");

          try { 
            await updateLoadingState(60);
            const response = await authService.profile(formData);
            await updateLoadingState(80);
            let url = response?.profile_image?.image || response?.organization_image?.image;
            if (url) {
              // Use the same base URL logic as fetching profile image
              let baseUrl = process.env.REACT_APP_API_BASE_URL;
              if (!baseUrl) {
                // Try to get from window.location.origin if not set
                baseUrl = window.location.origin;
              }
              const fullImageUrl = `${baseUrl.replace(/\/$/, "")}${url}`;
              setProfileImage(fullImageUrl);
              localStorage.setItem("profileImage", fullImageUrl);
              window.dispatchEvent(new Event("profileImageUpdated"));
              alert("Profile image has been successfully changed.");
            } else {
              alert("Failed to update profile image.");
            }
            await updateLoadingState(100, 300);
          } catch (error) {
            console.error("Error uploading profile image:", error);
            alert("Error uploading image.");
            await updateLoadingState(100, 300);
          } finally {
            setIsLoading(false);
          }
        }, "image/jpeg");
        setCropperVisible(false);
      }
    } catch (error) {
      await updateLoadingState(100, 300);
      setIsLoading(false);
    }
  };

  const handleSaveDetails = async () => {
    setIsLoading(true);
    try {
      await updateLoadingState(20);
      const data = await authService.details();
      
      await updateLoadingState(40);
      let userId = null;

      if (data.type === "User") {
        userId = data.details[5].id;
      } else if (data.type === "Organization") {
        userId = data.details[1].id;
      }

      if (!userId) {
        console.error("User ID not found.");
        alert("Error: User ID is missing.");
        await updateLoadingState(100, 300);
        setIsLoading(false);
        return;
      }

      const updatedProfile = {
        first_name: editName,
        email: editMail,
        mobile: editMobile,
      };

      await updateLoadingState(60);
      const response = await authService.saveprofile(userId, updatedProfile);
      
      await updateLoadingState(80);
      if (response) {
        setName(editName);
        setMail(editMail);
        setMobile(editMobile);
        setShowEditCard(false);
        alert("Profile details updated successfully!");
      } else {
        alert("Failed to update profile details.");
      }
      
      await updateLoadingState(100, 300);
    } catch (error) {
      console.error("Error updating profile details:", error);
      alert("An error occurred while updating profile details.");
      await updateLoadingState(100, 300);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveProfileImage = async () => {
    setIsLoading(true);
    try {
      await updateLoadingState(20);
      const data = await authService.details();
      
      await updateLoadingState(50);
      let id = data.details[3]?.id || data.details[1]?.id;
      if (id) {
        await authService.delprofile(id);
        setProfileImage(avatar);
        localStorage.removeItem("profileImage");
        window.dispatchEvent(new Event("profileImageUpdated"));
      } else {
        console.error("No valid ID found for profile image removal.");
        alert("Error: No valid ID found for profile image removal.");
      }
      
      await updateLoadingState(100, 300);
    } catch (error) {
      console.error("Error removing profile image:", error);
      await updateLoadingState(100, 300);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-popup">
        <div className="loading-popup-content">
          <Loader
            type="box-up"
            bgColor={"#000b58"}
            color={"#000b58"}
            size={100}
          />
          <p>{loadingPercentage}% Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`profile-container ${showEditCard ? "shift-left" : ""}`}>
        <div className="profile-card">
          <div className="profile-photo">
            {profileImage && profileImage !== avatar ? (
              <img className="profile_img" src={profileImage} alt="Profile" />
            ) : (
              <div className="profile-initials" style={{ background: iconColor }}>
                {getInitials(name)}
              </div>
            )}

            {profileImage && profileImage !== avatar && (
              <img
                src={removeIcon}
                alt="Remove"
                className="remove-profile-icon"
                onClick={handleRemoveProfileImage}
              />
            )}
          </div>

          <h2 className="profile-name">{capitalizeFirst(name)}</h2>
          <p className="profile-role">Role: {role}</p>
          <p className="profile-location">Email: {mail}</p>
          <p className="profile-role">Phone: {mobile}</p>

          <div className="divider-container">
            <div className="profile-divider"></div>
          </div>

          <button className="edit-btn" onClick={() => setShowEditCard(true)}>
            Edit
          </button>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        {showEditCard && (
          <div className="profile-edit-card">
            <div className="edit-card-header">
              <button className="backbutton" onClick={() => setShowEditCard(false)}>
                &lt;&nbsp; Back
              </button>
              <h2 className="profile-title">Profile</h2>
              <div></div>
            </div>

            <div className="profile-form">
              <div className="input-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Role:</label>
                <input type="text" value={editRole} disabled />
              </div>

              <div className="input-group">
                <label>Email address:</label>
                <input type="email" value={editMail} disabled />
              </div>

              <div className="input-group">
                <label>Phone number:</label>
                <input
                  type="text"
                  value={editMobile}
                  onChange={(e) => setEditMobile(e.target.value)}
                />
              </div>
            </div>

            <button className="save-btn" onClick={handleSaveDetails}>
              Save details
            </button>
          </div>
        )}
      </div>

      <div className={`cropper-modal ${cropperVisible ? "show" : ""}`}>
        <div className="cropper-modal-content">
          <h2 className="cropper-header">Crop Your Photo</h2>
          <div className="cropper-container">
            <Cropper
              ref={cropperRef}
              src={imageToCrop}
              style={{ height: "220px", width: "100%" }}
              aspectRatio={1}
              guides={false}
            />
          </div>
          <div className="cropper-actions">
            <button onClick={handleSaveCrop} className="btn-save-crop">
              Save
            </button>
            <button
              onClick={() => setCropperVisible(false)}
              className="btn-cancel-crop"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileCard;