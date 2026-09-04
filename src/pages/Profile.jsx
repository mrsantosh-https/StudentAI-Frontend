import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import "../styles/profile.css";
import toast from "react-hot-toast";

const STORAGE_URL = "http://127.0.0.1:8000/storage";

export default function Profile() {
  const { fetchUser } = useUser();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    bio: "",
    profile_photo: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Fetch Profile
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await api.get("/profile");

        if (!isMounted) return;

        const user = response.data?.user || response.data;

        setProfile({
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
          linkedin: user?.linkedin || "",
          github: user?.github || "",
          bio: user?.bio || "",
          profile_photo: user?.profile_photo || "",
        });
      } catch (error) {
        console.error("Profile fetch error:", error);

        if (isMounted) {
          toast.error(
            error.response?.data?.message ||
              "Failed to load profile"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Handle Input Change
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value ?? "",
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Update Profile
  |--------------------------------------------------------------------------
  */

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);

      const response = await api.put("/profile", {
        name: profile.name ?? "",
        phone: profile.phone ?? "",
        linkedin: profile.linkedin ?? "",
        github: profile.github ?? "",
        bio: profile.bio ?? "",
      });

      toast.success(
        response.data?.message ||
          "Profile updated successfully"
      );

      const updatedUser = response.data?.user;

      if (updatedUser) {
        setProfile((previousProfile) => ({
          ...previousProfile,
          name: updatedUser.name ?? "",
          email: updatedUser.email ?? "",
          phone: updatedUser.phone ?? "",
          linkedin: updatedUser.linkedin ?? "",
          github: updatedUser.github ?? "",
          bio: updatedUser.bio ?? "",
          profile_photo:
            updatedUser.profile_photo ??
            previousProfile.profile_photo ??
            "",
        }));
      }

      await fetchUser();
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      const errors = error.response?.data?.errors;

      if (errors) {
        const firstError =
          Object.values(errors)?.[0]?.[0];

        toast.error(
          firstError ||
            "Profile update failed"
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "Profile update failed"
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Upload Profile Photo
  |--------------------------------------------------------------------------
  */

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Allowed file types
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Only JPG, JPEG and PNG images are allowed"
      );
      e.target.value = "";
      return;
    }

    // Maximum 2 MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error(
        "Image size must be less than 2 MB"
      );
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("profile_photo", file);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/profile/photo",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Laravel response:",
          data
        );

        if (data.errors?.profile_photo) {
          toast.error(
            data.errors.profile_photo[0]
          );
        } else {
          toast.error(
            data.message ||
              "Photo upload failed"
          );
        }

        return;
      }

      toast.success(
        data.message ||
          "Photo uploaded successfully"
      );

      // Update profile immediately
      if (data.user) {
        setProfile((previousProfile) => ({
          ...previousProfile,
          name: data.user.name ?? previousProfile.name ?? "",
          email: data.user.email ?? previousProfile.email ?? "",
          phone: data.user.phone ?? previousProfile.phone ?? "",
          linkedin:
            data.user.linkedin ??
            previousProfile.linkedin ??
            "",
          github:
            data.user.github ??
            previousProfile.github ??
            "",
          bio:
            data.user.bio ??
            previousProfile.bio ??
            "",
          profile_photo:
            data.user.profile_photo ??
            previousProfile.profile_photo ??
            "",
        }));
      } else {
        setProfile((previousProfile) => ({
          ...previousProfile,
          profile_photo:
            data.profile_photo ?? "",
        }));
      }

      await fetchUser();

      // Reset file input
      e.target.value = "";
    } catch (error) {
      console.error(
        "Photo upload error:",
        error
      );

      toast.error(
        "Unable to upload profile photo"
      );
    } finally {
      setUploading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Remove Profile Photo
  |--------------------------------------------------------------------------
  */

  const handleRemovePhoto = async () => {
    if (!profile.profile_photo) {
      toast.error(
        "No profile photo to remove."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove your profile photo?"
    );

    if (!confirmed) return;

    try {
      setRemoving(true);

      const response = await api.delete(
        "/profile/photo"
      );

      toast.success(
        response.data?.message ||
          "Profile photo removed successfully."
      );

      setProfile((previousProfile) => ({
        ...previousProfile,
        profile_photo: "",
      }));

      await fetchUser();
    } catch (error) {
      console.error(
        "Remove photo error:",
        error
      );

      const errors =
        error.response?.data?.errors;

      if (errors?.profile_photo) {
        toast.error(
          errors.profile_photo[0]
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to remove profile photo."
        );
      }
    } finally {
      setRemoving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <Topbar />

          <div className="dashboard-content text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p className="mt-3">
              Loading profile...
            </p>
          </div>
        </main>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Profile UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content text-center">

          <h2 className="fw-bold">
            👤 My Profile
          </h2>

          <p className="text-muted">
            Manage your personal information.
          </p>

          {/* Profile Photo */}

          <div className="profile-photo-card card border-0 shadow p-4 mt-4 mb-4 text-center">

            <h4 className="fw-bold">
              Profile Photo
            </h4>

            {profile.profile_photo ? (
              <img
                src={`${STORAGE_URL}/${profile.profile_photo}`}
                alt="Profile"
                className="rounded-circle mx-auto my-3 profile-img"
                width="120"
                height="120"
              />
            ) : (
              <div
                className="rounded-circle bg-primary text-white mx-auto my-3 d-flex align-items-center justify-content-center profile-initial"
                style={{
                  width: "120px",
                  height: "120px",
                  fontSize: "40px",
                }}
              >
                {profile.name
                  ? profile.name
                      .charAt(0)
                      .toUpperCase()
                  : "U"}
              </div>
            )}

            {/* Upload */}

            <input
              type="file"
              className="form-control profile-input mt-3"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handlePhotoUpload}
              disabled={
                uploading || removing
              }
            />

            <small className="text-muted d-block mt-2">
              JPG, JPEG, PNG — Maximum 2 MB
            </small>

            {/* Upload Status */}

            {uploading && (
              <p className="text-primary mt-2 mb-0">
                Uploading photo...
              </p>
            )}

            {/* Remove */}

            {profile.profile_photo && (
              <button
                type="button"
                className="btn btn-outline-danger mt-3"
                onClick={handleRemovePhoto}
                disabled={
                  uploading || removing
                }
              >
                {removing
                  ? "Removing..."
                  : "Remove Profile Photo"}
              </button>
            )}
          </div>

          {/* Profile Form */}

          <form
            onSubmit={handleUpdate}
            className="profile-card card border-0 shadow p-4 mt-4"
          >

            {/* Name */}

            <input
              type="text"
              name="name"
              className="form-control profile-input mb-3"
              placeholder="Full Name"
              value={profile.name ?? ""}
              onChange={handleChange}
              required
            />

            {/* Email */}

            <input
              type="email"
              name="email"
              className="form-control profile-input mb-3"
              placeholder="Email"
              value={profile.email ?? ""}
              disabled
            />

            {/* Phone */}

            <input
              type="text"
              name="phone"
              className="form-control profile-input mb-3"
              placeholder="Phone Number"
              value={profile.phone ?? ""}
              onChange={handleChange}
            />

            {/* LinkedIn */}

            <input
              type="text"
              name="linkedin"
              className="form-control profile-input mb-3"
              placeholder="LinkedIn URL"
              value={profile.linkedin ?? ""}
              onChange={handleChange}
            />

            {/* GitHub */}

            <input
              type="text"
              name="github"
              className="form-control profile-input mb-3"
              placeholder="GitHub URL"
              value={profile.github ?? ""}
              onChange={handleChange}
            />

            {/* Bio */}

            <textarea
              name="bio"
              className="form-control profile-input mb-3"
              rows="4"
              placeholder="Short Bio"
              value={profile.bio ?? ""}
              onChange={handleChange}
            />

            {/* Update */}

            <button
              type="submit"
              className="btn btn-primary profile-btn"
              disabled={
                updating ||
                uploading ||
                removing
              }
            >
              {updating
                ? "Updating..."
                : "Update Profile"}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}