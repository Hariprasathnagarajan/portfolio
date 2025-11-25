import React from "react";
import { useParams } from "react-router-dom";
import ProductOwnerDashboard from "./ProductOwnerDashboard";
import AdminDashboard from "./AdminDashboard";
import UploaderDashboard from "./UploaderDashboard";
import ReviewerDashboard from "./ReviewerDashboard";
import ViewerDashboard from "./ViewerDashboard";

const DashboardApp = () => {
  const { id } = useParams();
  const username = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role");

  const isUploader = role === "Uploader";
  const isReviewer = role === "Reviewer";
  const isViewer = role === "Viewer";
  const isAdmin = role === "Admin" || role === "Client Admin";
  const isAdminOrDocumentRole = ["Admin", "Uploader", "Approver", "Reviewer", "Viewer"].includes(role);
  const isProductOwner = ["Product Owner", "Product Admin"].includes(role);
  
  return (
    <div className="dashboard-body bg">
      <div className="dashboard-container">
      

        {isProductOwner && <ProductOwnerDashboard />}
        {isAdmin && <AdminDashboard />}
        {isUploader && <UploaderDashboard />}
        {isReviewer && <ReviewerDashboard />}
        {isViewer && <ViewerDashboard />}
      </div>
    </div>
  );
};

export default DashboardApp;