import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import "../styles/profile.css";
import toast from "react-hot-toast";

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

  const fetchProfile = async () => {
    const response = await api.get("/profile");
    setProfile(response.data);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await api.put("/profile", profile);

      toast.success(response.data.message || "Profile updated successfully");
     await fetchUser();
    } catch (error) {
      console.error(error);
      toast.error("Profile update failed");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("profile_photo", file);

      const response = await api.post("/profile/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(response.data.message || "Photo uploaded successfully");
      fetchProfile();
      await fetchUser();
    } catch (error) {
      console.log(error.response?.data);
    console.log(error.response?.status);
    toast.error("Upload failed");
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content text-center">
          <h2 className="fw-bold">👤 My Profile</h2>
          <p className="text-muted">Manage your personal information.</p>

          <div className="profile-photo-card card border-0 shadow p-4 mt-4 mb-4 text-center">
            <h4 className="fw-bold">Profile Photo</h4>

            {profile.profile_photo ? (
              <img
                src={`http://127.0.0.1:8000/storage/${profile.profile_photo}`}
                alt="Profile"
                className="rounded-circle mx-auto my-3 profile-img"
                width="120"
                height="120"
              />
            ) : (
              <div
                className="rounded-circle bg-primary text-white mx-auto my-3 d-flex align-items-center justify-content-center profile-initial"
                style={{ width: "120px", height: "120px", fontSize: "40px" }}
              >
                {profile.name?.charAt(0)}
              </div>
            )}

            <input
              type="file"
              className="form-control profile-input mt-3"
              onChange={handlePhotoUpload}
            />
          </div>

          <form
            onSubmit={handleUpdate}
            className="profile-card card border-0 shadow p-4 mt-4"
          >
            <input
              type="text"
              name="name"
              className="form-control profile-input mb-3"
              placeholder="Full Name"
              value={profile.name || ""}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              className="form-control profile-input mb-3"
              placeholder="Email"
              value={profile.email || ""}
              disabled
            />

            <input
              type="text"
              name="phone"
              className="form-control profile-input mb-3"
              placeholder="Phone Number"
              value={profile.phone || ""}
              onChange={handleChange}
            />

            <input
              type="text"
              name="linkedin"
              className="form-control profile-input mb-3"
              placeholder="LinkedIn URL"
              value={profile.linkedin || ""}
              onChange={handleChange}
            />

            <input
              type="text"
              name="github"
              className="form-control profile-input mb-3"
              placeholder="GitHub URL"
              value={profile.github || ""}
              onChange={handleChange}
            />

            <textarea
              name="bio"
              className="form-control profile-input mb-3"
              rows="4"
              placeholder="Short Bio"
              value={profile.bio || ""}
              onChange={handleChange}
            />

            <button className="btn btn-primary profile-btn">
              Update Profile
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}