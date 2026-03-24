"use client";

import { useState } from "react";
import DeanSidebar from "./DeanSidebar";
import ProfileModal from "./ProfileModal";

const defaultProfile = {
  name: "Dr. Alice Carter",
  title: "Academic Dean",
  email: "alice.carter@university.edu",
  phone: "+1 (555) 012-3456",
  department: "College of Engineering",
};

export default function DeanSidebarWithModal() {
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState(defaultProfile);

  return (
    <>
      <DeanSidebar
        profile={profile}
        onEditProfile={() => setShowModal(true)}
      />
      <ProfileModal
        isOpen={showModal}
        profile={profile}
        onClose={() => setShowModal(false)}
        onSave={(updated) => {
          setProfile(updated);
          setShowModal(false);
        }}
      />
    </>
  );
}
