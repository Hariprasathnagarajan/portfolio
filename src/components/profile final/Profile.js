import React, { useState, useEffect, useRef } from "react";
import "./Profile.css";
import avatar from "../../assets/images/candidate-profile.png";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import authService from "../../ApiServices/ApiServices";
import Loader from "react-js-loader";
import { Pencil } from "lucide-react";
import { API_URL2 } from "../../ApiServices/ApiServices";
import ArrowBackIosNewSharpIcon from "@mui/icons-material/ArrowBackIosNewSharp";

function ProfileCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const [cropperVisible, setCropperVisible] = useState(false);

  // Display states (saved values)
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [mail, setMail] = useState("");
  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [organization, setOrganization] = useState("");

  const [iconColor, setIconColor] = useState("#000");
  const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage"));
  const [imageToCrop, setImageToCrop] = useState(null);

  const cropperRef = useRef();
  const fileInputRef = useRef();

  // Edit states (temporary)
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editMail, setEditMail] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editCountryCode, setEditCountryCode] = useState("+91");
const handleSaveCroppedImage = async () => {
  if (cropperRef.current && cropperRef.current.cropper) {
    const canvas = cropperRef.current.cropper.getCroppedCanvas({ width: 300, height: 300 });
    if (!canvas) return alert("Failed to crop image.");

    canvas.toBlob(async (blob) => {
      if (!blob) return alert("Failed to crop image.");

      const formData = new FormData();
      formData.append("image", blob, "profile.png");

      try {
        setIsLoading(true);
        await updateLoadingState(20);

        const response = await authService.profile(formData); // Upload to server

       if (response && (response.profile_image?.image || response.organization_image?.image)) {
          // ✅ Use API URL instead of local blob
          const url = response.profile_image?.image || response.organization_image?.image;
          const fullImageUrl = `${API_URL2.replace(/\/$/, "")}${url}`;

          setProfileImage(fullImageUrl);
          localStorage.setItem("profileImage", fullImageUrl);

          // Dispatch event so other components update
          window.dispatchEvent(new Event("profileImageUpdated"));

          alert("Profile image updated successfully!");
          setCropperVisible(false);
        } else {
          console.error("Unexpected response:", response);
          alert("Failed to update profile image.");
        }

        await updateLoadingState(100, 300);
      } catch (error) {
        console.error("Error uploading cropped image:", error);
        alert("An error occurred while uploading image.");
      } finally {
        setIsLoading(false);
      }
    }, "image/png");
  }
};

  // Toggle edit card
  const [showEditCard, setShowEditCard] = useState(false);

  const countryOptions = [
    { code: "+91", name: "India", mobileLength: 10 },
    { code: "+971", name: "UAE", mobileLength: 9 },
    { code: "+1", name: "USA", mobileLength: 10 },
  ];

  const getInitials = (name) => {
    if (!name.trim()) return "U";
    return name
      .split(" ")
      .map((n) => n.charAt(0).toUpperCase())
      .join("");
  };

  const capitalizeFirst = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const getRandomColor = () =>
    `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;

  useEffect(() => {
    setIconColor(getRandomColor());
  }, []);

  const updateLoadingState = async (percentage, delay = 0) => {
    setLoadingPercentage(percentage);
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
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
  const firstName = details_data.details[1].first_name;
  const email = details_data.details[1].email;
  const userRole = details_data.details[5].name;
  const orgName = localStorage.getItem("company_name");

  const fullMobile = details_data.details[3].mobile || "";
  const orgCountryCode = details_data.details[3].organization.country_code || "+91";


  // Display states
  setName(firstName);
  setMail(email);
  setRole(userRole);
  setOrganization(orgName || "");

  setMobile(fullMobile);
  setCountryCode(orgCountryCode);


  // Edit states
  setEditName(firstName);
  setEditRole(userRole);
  setEditMail(email);
  setEditMobile(fullMobile);
  setEditCountryCode(orgCountryCode);

} else if (details_data.type === "Organization") {
  const orgDetails = details_data.details[1]; // org_data
  const roleDetails = details_data.details[3]; // role_data
  const authUserDetails = details_data.details[5]; // auth_user_data

  const fullMobile = orgDetails.mobile || "";
  let foundCode = "+91";
  let mobileNum = fullMobile;

  for (const option of countryOptions) {
    if (fullMobile.startsWith(option.code)) {
      foundCode = option.code;
      mobileNum = fullMobile.substring(option.code.length);
      break;
    }
  }

  // Display states
  setName(authUserDetails.first_name);
  setMail(authUserDetails.email);
  setRole(roleDetails.name);
  setOrganization(orgDetails.company_name);
  setMobile(mobileNum);
  setCountryCode(foundCode);

  // Edit states
  setEditName(authUserDetails.first_name);
  setEditRole(roleDetails.name);
  setEditMail(authUserDetails.email);
  setEditMobile(mobileNum);
  setEditCountryCode(foundCode);
}

        await updateLoadingState(70);
        const image = await authService.getprofile();
        try {
          const url = image.profile_image?.image || image.organization_image?.image;
          if (url) {
            const baseUrl = API_URL2;
            const fullImageUrl = `${baseUrl.replace(/\/$/, "")}${url}`;
            setProfileImage(fullImageUrl);
            localStorage.setItem("profileImage", fullImageUrl);
          }
        } catch {
          localStorage.setItem("profileImage", avatar);
        }

        await updateLoadingState(100, 300);
      } catch (error) {
        console.error("Error fetching profile details:", error);
        localStorage.setItem("profileImage", avatar);
        await updateLoadingState(100, 300);
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

const handleSaveDetails = async () => {
  setIsLoading(true);
  try {
    await updateLoadingState(20);
    const data = await authService.details();
    await updateLoadingState(40);

    let userUuid = null;

    if (data.type === "User") {
      // In User type, UUID is inside details[3].id (string)
      userUuid = data.details[3]?.id;
    } else if (data.type === "Organization") {
      // In Org type, UUID is inside details[1].id (string)
      userUuid = data.details[1]?.id;
    }

    if (!userUuid) {
      alert("Error: UUID not found in API response.");
      setIsLoading(false);
      return;
    }

    const selectedCountry = countryOptions.find(
      (opt) => opt.code === editCountryCode
    );
    const expectedLength = selectedCountry ? selectedCountry.mobileLength : 0;

    if (editMobile.length !== expectedLength) {
      alert(
        `Phone number for ${selectedCountry.name} must be ${expectedLength} digits long.`
      );
      setIsLoading(false);
      return;
    }

    const updatedProfile = {
      first_name: editName,
      email: editMail,
      mobile: editMobile,
      country_code: editCountryCode,
    };

    await updateLoadingState(60);
    const response = await authService.saveprofile(userUuid, updatedProfile); // ✅ use uuid

    await updateLoadingState(80);
    if (response) {
      setName(editName);
      setMail(editMail);
      setMobile(editMobile);
      setCountryCode(editCountryCode);
      setShowEditCard(false);
      alert("Profile details updated successfully!");
    } else {
      alert("Failed to update profile details.");
    }

    await updateLoadingState(100, 300);
  } catch (error) {
    console.error("Error updating profile details:", error);
    alert("An error occurred while updating profile details.");
    setIsLoading(false);
  } finally {
    setIsLoading(false);
  }
};


  const handleClearEdits = () => {
    setEditName(name);
    setEditRole(role);
    setEditMail(mail);
    setEditMobile(mobile);
    setEditCountryCode(countryCode);
  };

  const isEdited =
    editName !== name ||
    editRole !== role ||
    editMail !== mail ||
    editMobile !== mobile ||
    editCountryCode !== countryCode;

  const currentMobileMaxLength =
    countryOptions.find((opt) => opt.code === editCountryCode)?.mobileLength ||
    15;

  if (isLoading) {
    return (
      <div className="loading-popup">
        <div className="loading-popup-content">
          <Loader type="box-up" bgColor={"#000b58"} color={"#000b58"} size={100} />
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
            <div
              className="edit-icon-wrapper"
              onClick={() => fileInputRef.current.click()}
            >
              <Pencil size={18} className="pencil-icon" />
            </div>
          </div>
        
          <h2 className="profile-name">{name}</h2>
          <p className="profile-role">Role: {role}</p>
          <p className="profile-role">Organization: {organization}</p>
          <p className="profile-location">Email: {mail}</p>
          <p className="profile-role">Phone: {countryCode} {mobile}</p>

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
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImageToCrop(reader.result);
                  setCropperVisible(true);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>

        {showEditCard && (
          <div className="profile-edit-card">
            <div className="edit-card-header">
              <button className="backbutton" onClick={() => setShowEditCard(false)}>
                <ArrowBackIosNewSharpIcon />
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

              <div className="input-group phone-input-group">
                <label>Phone number:</label>
                <div className="phone-input-fields">
                  <select
                    value={editCountryCode}
                    onChange={(e) => {
                      setEditCountryCode(e.target.value);
                      setEditMobile("");
                    }}
                    className="country-code-select"
                  >
                    {countryOptions.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.code} ({option.name})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={editMobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setEditMobile(val);
                    }}
                    maxLength={currentMobileMaxLength}
                    placeholder="Mobile number"
                    className="mobile-number-input"
                  />
                </div>
              </div>
            </div>

            <div className="edit-actions">
              <button
                className="save-btn clear-btn"
                onClick={handleClearEdits}
                disabled={!isEdited}
              >
                Clear
              </button>
              <button
                className="save-btn"
                onClick={handleSaveDetails}
                disabled={!isEdited}
              >
                Save details
              </button>
            </div>
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
            <button className="btn-save-crop" onClick={handleSaveCroppedImage}>
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