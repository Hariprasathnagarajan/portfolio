import React, { useState, useEffect } from "react";
import {
  GrDocument,
  GrDocumentVerified,
  GrDocumentTime,
  GrDocumentExcel,
} from "react-icons/gr";
import { FaUsers, FaFileAlt, FaFolderOpen } from "react-icons/fa";
import authService from "../../ApiServices/ApiServices";

const UploaderDashboard = ({ client, totalFileSizeMB }) => {
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("name") || "User";

  const [dashboardStats, setDashboardStats] = useState({});
  const [orgCount, setOrgCount] = useState({});
  const [companyData, setCompanyData] = useState([]);
  const [dummyData, setDummyData] = useState([]); // For declaration data

  // Fetch dashboard stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await authService.DashboardViewUploader();
        setDashboardStats(stats || {});
        console.log("✅ Dashboard Stats:", stats);
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch organization details and declaration summary for Uploader
  useEffect(() => {
    const fetchUploaderData = async () => {
      try {
        const details = await authService.details();
        const orgId = details?.details?.[1]?.id;

        if (orgId) {
          // Fetch organization details
          const orgResponse = await authService.organizationIdDetails(orgId);
          const summary = orgResponse?.summary?.sub || [];
          setCompanyData(summary);

          // Fetch declaration data
          const declarationResponse =
            await authService.organizationIdDetails(orgId);
          setDummyData(declarationResponse?.summary?.sub || []);

          console.log("✅ Uploader data:", {
            companyData: summary,
            declarationData: declarationResponse?.summary?.sub,
          });
        }
      } catch (error) {
        console.error("❌ Error fetching uploader data:", error);
      }
    };

    if (role === "Uploader") {
      fetchUploaderData();
    }
  }, [role]);

  const CardAnalytics = () => {
    const isAdminOrDocumentRole = [
      "Admin",
      "Uploader",
      "Approver",
      "Reviewer",
      "Viewer",
    ].includes(role);

    let items = [];
    if (isAdminOrDocumentRole) {
      const summary = dashboardStats.document_summary || {};
      const total = parseInt(summary.total_documents || 0);
      const approved = parseInt(summary.approved_count || 0);
      const pending = parseInt(summary.pending_count || 0);
      const rejected = parseInt(summary.rejected_count || 0);

      const percent = (count) =>
        total > 0 ? Math.round((count / total) * 100) : 0;

      items = [
        {
          label: "Total Documents",
          value: total,
          percent: 100,
          color: "#2980b9",
        },
        {
          label: "Approved",
          value: approved,
          percent: percent(approved),
          color: "#43e97b",
        },
        {
          label: "Pending",
          value: pending,
          percent: percent(pending),
          color: "#f7971e",
        },
        {
          label: "Rejected",
          value: rejected,
          percent: percent(rejected),
          color: "#f953c6",
        },
      ];
    } else if (role === "Admin") {
      items = [
        {
          label: "Declarations",
          value: dashboardStats.dec_count || 0,
          percent: 90,
          color: "#0072ff",
        },
        {
          label: "Documents",
          value: dashboardStats.document_count || 0,
          percent: 65,
          color: "#9D50BB",
        },
        {
          label: "Approved",
          value: dashboardStats.approved_count || 0,
          percent: 80,
          color: "#56ab2f",
        },
        {
          label: "Pending",
          value: dashboardStats.pending_count || 0,
          percent: 50,
          color: "#f7971e",
        },
        {
          label: "Rejected",
          value: dashboardStats.rejected_count || 0,
          percent: 30,
          color: "#e53935",
        },
      ];
    } else {
      items = [
        {
          label: "Total Companies",
          value: orgCount.totalCompanies || 0,
          percent: 100,
          color: "#4285F4",
        },
        {
          label: "Active Companies",
          value: parseInt(orgCount.activeCompanies || 0),
          percent: 70,
          color: "#00C851",
        },
        {
          label: "Inactive Companies",
          value: parseInt(orgCount.inactiveCompanies || 0),
          percent: 40,
          color: "#aa66cc",
        },
        {
          label: "Deleted Companies",
          value: parseInt(orgCount.deleted_org_count || 0),
          percent: 25,
          color: "#ff4444",
        },
      ];
    }

    return (
      <div
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e0e0e0",
          transition: "transform 0.2s ease",
          padding: "10px",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "600px",
          marginTop: "10px",
          marginLeft: "10px",
          fontFamily: "sans-serif",
        }}
      >
        <h2
          style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}
        >
          {isAdminOrDocumentRole ? "Documents" : "Company Count"}
        </h2>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom:
                index !== items.length - 1 ? "1px solid #eee" : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                flex: 1,
              }}
            >
              <span style={{ flex: 1 }}>{item.label}</span>
              <div
                style={{
                  background: "#e0e0e0",
                  height: "6px",
                  width: "120px",
                  borderRadius: "6px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${item.percent}%`,
                    backgroundColor: item.color,
                    transition: "width 0.4s ease-in-out",
                  }}
                ></div>
              </div>
            </div>
            <span
              style={{
                backgroundColor: item.color + "22",
                color: item.color,
                fontWeight: "600",
                fontSize: "12px",
                padding: "5px 10px",
                borderRadius: "20px",
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const ProgressBarChart = () => {
    const pendingSizeMB = dashboardStats.storage_usage?.used_mb || 0;
    const max = 504;
    const percentage = Math.min((pendingSizeMB / max) * 100, 100).toFixed(2);
    const fullLabel = `${pendingSizeMB.toFixed(2)} MB`;

    return (
      <div
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e0e0e0",
          transition: "transform 0.2s ease",
          borderRadius: "10px",
          padding: "10px",
          flex: 1,
          minWidth: "400px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginTop: "10px",
        }}
      >
        <h3
          style={{
            fontSize: "18px",
            marginTop: "0px",
            color: "#0f172a",
            fontWeight: "700",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "10px",
          }}
        >
          Storage Usage
        </h3>
        <div
          style={{
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              background: "#007bff",
              color: "white",
              padding: "8px 12px",
              borderRadius: "9999px",
              fontWeight: "bold",
              fontSize: "13px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {fullLabel}
          </div>
          <div
            style={{
              flex: 1,
              background: "#e5e7eb",
              borderRadius: "9999px",
              height: "12px",
              overflow: "hidden",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: "100%",
                borderRadius: "9999px",
                background: "linear-gradient(90deg, #007bff, #00d4ff)",
                transition: "width 0.6s ease-in-out",
              }}
            ></div>
          </div>
        </div>
        <div
          style={{
            textAlign: "right",
            fontSize: "12px",
            color: "#64748b",
            fontWeight: "500",
          }}
        >
          {percentage}% Used
        </div>
      </div>
    );
  };

  const list = dashboardStats.declaration_document_data || [];

  const CompanyTable = () => (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #e0e0e0",
        transition: "transform 0.2s ease",
        padding: "20px",
        borderRadius: "10px",
        flex: 1,
        minWidth: "300px",
        maxHeight: "400px", // ✅ fix height
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          fontSize: "18px",
          fontWeight: "700",
          marginBottom: "16px",
          borderBottom: "1px solid #eee",
          paddingBottom: "10px",
        }}
      >
        Company Document Summary
      </h3>

      {/* ✅ Scrollable container with styled scrollbar */}
      <div
        style={{
          overflowY: "auto",
          flex: 1,
          paddingRight: "6px",
        }}
        className="custom-scroll"
      >
        {list.length > 0 ? (
          list.map((data, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div>
                <strong style={{ color: "#333" }}>
                  {data.declaration_name || "Untitled"}
                </strong>
              </div>
              <div style={{ display: "flex", gap: "20px", fontSize: "12px" }}>
                <div>
                  <FaFileAlt style={{ marginRight: "4px" }} />
                  {data.document_count || 0} Files
                </div>
                <div>
                  <FaFolderOpen style={{ marginRight: "4px" }} />
                  {data.total_storage_mb || 0} MB
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "red", textAlign: "center" }}>
            No declaration data found
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", padding: "40px" }}>
      <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginTop: "16vh",
          }}
        >
          <CardAnalytics />
          <ProgressBarChart />
          <CompanyTable />
        </div>
      </div>

      {/* ✅ Custom scrollbar styles */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #888;
        }
      `}</style>
    </div>
  );
};

export default UploaderDashboard;
