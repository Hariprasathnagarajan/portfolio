import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from 'jspdf';
import './contractform.css';
import authService from '../../ApiServices/ApiServices';
import { useNavigate } from 'react-router-dom';
import { Sync } from '@mui/icons-material';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
const CompanyContractForm = () => {
  const [signature, setSignature] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mode, setMode] = useState('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [showFontList, setShowFontList] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [uploadedImage, setUploadedImage] = useState(null);
  const sigCanvas = useRef();
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('');
  const [contractDocuments, setContractDocuments] = useState(null);
  const [companyName, setCompanyName] = useState(localStorage.getItem('registeredCompanyName') || '');
  const [contractTitle, setContractTitle] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
    const [companyAddresss, setCompanyAddresss] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [dateOfAgreement, setDateOfAgreement] = useState('');
  const [id, setId] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
    const [selectedFees, setSelectedFees] = useState({});
const handleFeeToggle = (auditType) => {
  setSelectedFees((prev) => ({
    ...prev,
    [auditType]: !prev[auditType]   // toggle selection
  }));
};
const isFormValid =
  companyName.trim() &&
  contractTitle.trim() &&
  companyAddress.trim() &&
  signature &&
  Object.values(selectedFees).some(isSelected => isSelected); // Check if at least one fee is selected
  const currentDate = new Date().toLocaleDateString();
const formatDateDMY = (dateStr) => {
  if (!dateStr) return '';
  // Handles both YYYY-MM-DD and Date objects
  const dateObj = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};
  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'type') {
      if (sigCanvas.current) sigCanvas.current.clear();
      setSignature(null);
      setUploadedImage(null);
    } else if (newMode === 'draw') {
      setTypedSignature('');
      setSignature(null);
      setUploadedImage(null);
    } else if (newMode === 'upload') {
      if (sigCanvas.current) sigCanvas.current.clear();
      setTypedSignature('');
      setSignature(null);
    }
  };
  const [consultantAddress, setConsultantAddress] = useState('');
const [clientIncorporation, setClientIncorporation] = useState('');
const [terminationDays, setTerminationDays] = useState('');
const getFormattedAgreementDate = () => {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();
  return `${day}th day of ${month}, ${year}`;
};
  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
    setSignature(null);
    setUploadedImage(null);
    setTypedSignature('');
  };

  const handleSave = () => {
    if (mode === 'draw') {
      if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
        alert("Please draw your signature first.");
        return;
      }
      const signatureData = sigCanvas.current.toDataURL();
      setSignature(signatureData);
    } else if (mode === 'type') {
      if (!typedSignature.trim()) {
        alert("Please type your signature first.");
        return;
      }
      setSignature(typedSignature);
    }
    setShowPopup(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        setSignature(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details_data = await authService.details();
        console.log(details_data);

        if (details_data.type === "Organization") {
          const Company_name = details_data.details[1].company_name;
          setCompanyName(Company_name);
          setId(details_data.details[1].id);
          localStorage.setItem("registeredCompanyName", Company_name);
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };

    const savedName = localStorage.getItem('registeredCompanyName');
    if (savedName) {
      setCompanyName(savedName);
    }

    fetchDetails();
  }, []);

const generatePDF = async () => {
  // Create a clone of the contract form element
   setLoading(true); // Start loading
  const element = document.querySelector(".contract-form");
  const clone = element.cloneNode(true);
  
  // Hide input fields and buttons in the clone
  const inputs = clone.querySelectorAll('input, textarea, button');
  inputs.forEach(input => {
    if (input.id !== 'date-of-agreement') { // Keep the date display
      input.style.display = 'none';
    }
  });
  
  // Hide the "Save and Download PDF" button
  const downloadButton = clone.querySelector('.action-buttons button');
  if (downloadButton) {
    downloadButton.style.display = 'none';
  }
  
  // Remove underline from the witness paragraph
  const underlineParagraph = clone.querySelector('.underline');
  if (underlineParagraph) {
    underlineParagraph.style.textDecoration = 'none';
    underlineParagraph.classList.remove('underline');
  }
  
  // Replace input fields with their values
  const inputFields = clone.querySelectorAll('input[type="text"], textarea');
  inputFields.forEach(input => {
    const value = input.value || input.placeholder;
    const span = document.createElement('span');
    span.textContent = value;
    span.style.display = 'inline';
    span.className = 'pdf-value';
    input.parentNode.replaceChild(span, input);
  });
  
  // Replace checkboxes with checkmarks or empty boxes
  const checkboxes = clone.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    const span = document.createElement('span');
    span.textContent = checkbox.checked ? '✓' : ' ';
    span.style.marginRight = '5px';
    checkbox.parentNode.replaceChild(span, checkbox);
  });
  
  // Hide the signature popup trigger, show the actual signature
  const signatureBox = clone.querySelector('.signature-box');
  if (signatureBox) {
    signatureBox.style.cursor = 'default';
    const clickText = signatureBox.querySelector('p');
    if (clickText && clickText.textContent === 'Click here to Sign') {
      clickText.style.display = 'none';
    }
  }
  
  // Remove the original signature blocks to prevent duplication
  const originalSignatureBlocks = clone.querySelectorAll('.signature-block');
  originalSignatureBlocks.forEach(block => block.remove());
  
  // Remove the form section with input fields
  const formSection = clone.querySelector('form');
  if (formSection) {
    formSection.remove();
  }
  
  // Create the formatted signature blocks manually
  const signatureContainer = document.createElement('div');
  signatureContainer.innerHTML = `
    <div >
      <p>For NAVIGATE Customs Audit Consultancy LLC:</p>
      <p>Name: Snaweed</p>
      <p>Designation: Product Owner</p>
      <p>Signature: PO</p>
      <p>Date: ${formatDateDMY(currentDate)}</p>
    </div>
    
    <div >
      <p>For ${clientName || "[Client Name]"}:</p>
      <p>Name: ${companyName}</p>
      <p>Designation: ${contractTitle}</p>
      <p>Place: ${companyAddress}</p>
      <p>Signature: ${signature ? 
        (mode === 'upload' && uploadedImage ? 
          '<img src="' + uploadedImage + '" alt="Client Signature" style="max-width: 150px; max-height: 60px;" />' : 
          (mode === 'type' ? 
            '<span style="font-family: ' + selectedFont + '">' + signature + '</span>' : 
            '<img src="' + signature + '" alt="Client Signature" style="max-width: 150px; max-height: 60px;" />'
          )
        ) : '[Signature]'
      }</p>
      <p>Date: ${formatDateDMY(currentDate)}</p>
    </div>
  `;
  
  // Add the signature container to the clone
  clone.appendChild(signatureContainer);
  
  // Temporarily append the clone to the document to render it
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  document.body.appendChild(clone);
  
  try {
    // Use html2canvas to capture the modified clone
    const canvas = await html2canvas(clone, {
  scale: 1,                // less pixels → much smaller PDF
  useCORS: true,
  allowTaint: true
});
    
    // Remove the clone from the document
    document.body.removeChild(clone);
    
    // Create PDF from the canvas
    //const imgData = canvas.toDataURL('image/png');
    const imgData = canvas.toDataURL('image/jpeg', 0.7);
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;
    
    doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Save the PDF
    const pdfBlob = doc.output('blob');
    const contractFile = new File([pdfBlob], `${companyName}_contract.pdf`, { type: 'application/pdf' });
    
    try {
      await handleSubmit1({ preventDefault: () => {} }, contractFile);
      // Save locally first
doc.save(`${companyName}_contract.pdf`);

// Then upload without blocking
handleSubmit1({ preventDefault: () => {} }, contractFile)
  .then(() => navigate("/Comfirm"))
  .catch(err => {
    setError(err.message || "An unexpected error occurred");
    setTimeout(() => setError(null), 3000);
  });

    } catch (error) {
      setError(error.message || "An unexpected error occurred");
      setTimeout(() => setError(null), 3000);
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    document.body.removeChild(clone);
    setError("Failed to generate PDF. Please try again.");
    setTimeout(() => setError(null), 3000);
  }
  finally {
    setLoading(false); // Stop loading no matter what
  }
};
// Add this with your other useState declarations
const [clientNameWidth, setClientNameWidth] = useState(200);

// Add this function with your other functions
const adjustClientNameWidth = (value) => {
  const minWidth = 200;
  const width = Math.max(minWidth, value.length * 10 + 20);
  setClientNameWidth(width);
};

  const handleSubmit1 = async (e, contractFile) => {
    e.preventDefault();
  
    if (!contractFile) {
      setError("Please upload the Master Services Agreement (MSA) before proceeding.");
      setTimeout(() => setError(null), 8000);
      return;
    }
  
    const formData = new FormData();
    formData.append('contractDocuments', contractFile);
  
    try {
      const response = await authService.updateOrganization(id, formData);
      console.log("Update Response:", response);
      return true;
    } catch (error) {
      setError(error.message || "Something went wrong.");
      setTimeout(() => setError(null), 8000);
      throw error;
    }
  };

  const isSaveEnabled =
    (mode === 'draw' && sigCanvas.current && sigCanvas.current.isEmpty() === false) ||
    (mode === 'type' && typedSignature.trim() !== '') ||
    (mode === 'upload' && uploadedImage);

  return (
    <div className="contract-form">
      <div className="date-display">
       <p>Date: {formatDateDMY(currentDate)}</p>
        <div className="divider"></div>
      </div>

      <h1>CUSTOMS AUDIT SERVICES AGREEMENT</h1>
        
     <p>This Agreement is entered into on this {getFormattedAgreementDate()} by and between:</p>
      
      <div className="party-details">
       <p>NAVIGATE Customs Audit Consultancy LLC, a company duly incorporated under the laws of the United Arab Emirates with its registered office at &nbsp;
  <t></t><t></t><input
    type="text"
    value={consultantAddress}
     style={{ 
    fontWeight: 'bold',
    fontStyle: 'italic'
  }}
    onChange={(e) => setConsultantAddress(e.target.value)}
    className="dash-input"
  />   <t></t>
  (hereinafter referred to as the "Consultant"),
</p>
     
      
      <p>and</p>
      
     
      <p>
  <input
  type="text"
  value={clientName}
  onChange={(e) => {
    // Limit to 50 characters
    if (e.target.value.length <= 50) {
      setClientName(e.target.value);
      adjustClientNameWidth(e.target.value);
    }
  }}
  className="dash-input expandable-input"
  placeholder="Client Name"
  style={{ 
    width: `${clientNameWidth}px`,
    fontWeight: 'bold',
    fontStyle: 'italic'
  }}
  maxLength={50} // HTML attribute for additional safety
/> <t></t>, a company / establishment duly incorporated under the laws of 
 <t></t> <input
    type="text"
    value={clientIncorporation}
    style={{ 
    fontWeight: 'bold',
    fontStyle: 'italic'
  }}
    onChange={(e) => setClientIncorporation(e.target.value)}
    className="dash-input"
  />  <t></t> , 
  with its registered office at &nbsp;
   <t></t>   <t></t> 
  <input
    type="text"
    value={companyAddresss}
     style={{ 
    fontWeight: 'bold',
    fontStyle: 'italic'
  }}
    onChange={(e) => setCompanyAddresss(e.target.value)}
    className="dash-input"
  /> <t></t> 
  (hereinafter referred to as the "Client").</p>
      </div>
      
      <p>Collectively referred to as the "Parties" and individually as a "Party."</p>
      
      <h2>1. DEFINITIONS</h2>
      <p><span className="clause-title">1.1</span> "Services" means the customs audit and consultancy services described in Clause 3 (Scope of Work).</p>
      <p><span className="clause-title">1.2</span> "Deliverables" means all reports, recommendations, and documentation provided to the Client pursuant to this Agreement.</p>
      <p><span className="clause-title">1.3</span> "Confidential Information" means all non-public information disclosed by one Party to the other, including but not limited to commercial, operational, and technical data.</p>
      
      <h2>2. TERM</h2>
      <p>This Agreement shall commence on the Effective Date and shall continue until completion of the Services unless terminated earlier in accordance with Clause 10.</p>
      
      <h2>3. SCOPE OF WORK</h2>
      <p>The Consultant shall provide the following professional customs audit and consultancy services to the Client, which may include but are not limited to:</p>
      
      <p><span className="clause-title">3.1 Types of Audit Services:</span></p>
      <ul>
        <li>a) Post-Clearance Audit – Review of customs declarations, invoices, packing lists, certificates of origin, and related shipping documentation to ensure compliance with UAE customs regulations.</li>
        <li>b) Process & Compliance Audit – Assessment of internal customs clearance processes for regulatory compliance and efficiency.</li>
        <li>c) Documentation Audit – Verification of supporting import/export documents against declarations.</li>
        <li>d) Valuation Audit – Examination of declared customs values in line with WTO Valuation Agreement.</li>
        <li>e) Classification Audit – Review of HS codes assigned to goods for correctness.</li>
        <li>f) Duty & Tax Audit – Verification of duties, VAT, and excise applied on imports/exports.</li>
      </ul>
      
      <p><span className="clause-title">3.2 Additional Specialized Audit Services:</span></p>
      <ol>
        <li>Warehouse Systems Audit – Review of warehouse operations, inventory systems, and compliance procedures to support applications for obtaining a customs warehouse license.</li>
        <li>Archival Systems Audit – Evaluation of physical and electronic record-keeping systems for obtaining archival system approval from relevant authorities.</li>
        <li>AEO (Authorised Economic Operator) Preparatory Audit – Pre-assessment of operations, compliance, and security standards to meet UAE AEO program requirements.</li>
        <li>Freezone Clearance Letter Support – Audit and review for issuance of clearance letters by Freezone authorities.</li>
        <li>Freezone Stock Reconciliation for FZ Audits – Detailed verification of stock records against physical inventory for Freezone compliance audits.</li>
        <li>Concurrent Audit – Ongoing periodic review of customs documentation and processes during operations.</li>
        <li>Warehouse Stock Reconciliation Audit – Comprehensive verification of physical stock versus system records for customs compliance.</li>
      </ol>
      
      <h2>4. CLIENT RESPONSIBILITIES</h2>
      <p>The Client shall:</p>
      <ul>
        <li>a) Provide timely access to all required records, systems, facilities, and personnel.</li>
        <li>b) Ensure accuracy and completeness of information provided.</li>
        <li>c) Obtain all necessary third-party permissions for data access.</li>
      </ul>
      
      <h2>5. CONSULTANT RESPONSIBILITIES</h2>
      <p>The Consultant shall:</p>
      <ul>
        <li>a) Perform Services in accordance with UAE laws, applicable customs regulations, and professional standards.</li>
        <li>b) Maintain confidentiality of Client information.</li>
        <li>c) Provide audit reports and recommendations in a timely manner.</li>
      </ul>
      
      <h2>6. FEES & PAYMENT TERMS</h2>
      <p>The fees for the Services are as follows:</p>
      
    <table className="contract-table">
        <thead>
          <tr>
            <th>Audit Type</th>
            <th>Description</th>
            <th>Fee (AED)</th>
            <th>Billing Frequency</th>
            <th>Payment Terms</th>
          </tr>
        </thead>
<tbody>
  <tr>
    <td>Post-Clearance Audit</td>
    <td>Review of customs declarations and supporting documents</td>
    <td>
      <input 
        type="checkbox" 
        checked={!!selectedFees["Post-Clearance Audit"]}
        onChange={() => handleFeeToggle("Post-Clearance Audit")}
      />
    </td>
    <td>Per audit</td>
    <td>Within 15 days</td>
  </tr>
  <tr>
    <td>Process & Compliance Audit</td>
    <td>Assessment of customs processes for compliance</td>
    <td>
      <input 
        type="checkbox" 
        checked={!!selectedFees["Process & Compliance Audit"]}
        onChange={() => handleFeeToggle("Process & Compliance Audit")}
      />
    </td>
    <td>Per audit</td>
    <td>Within 15 days</td>
  </tr>
  <tr>
    <td>Documentation Audit</td>
    <td>Verification of import/export supporting documents</td>
    <td>
      <input 
        type="checkbox" 
        checked={!!selectedFees["Documentation Audit"]}
        onChange={() => handleFeeToggle("Documentation Audit")}
      />
    </td>
    <td>Per audit</td>
    <td>Within 15 days</td>
  </tr>
  <tr>
    <td>Valuation Audit</td>
    <td>Review of customs value declarations</td>
    <td>
      <input 
        type="checkbox" 
        checked={!!selectedFees["Valuation Audit"]}
        onChange={() => handleFeeToggle("Valuation Audit")}
      />
    </td>
    <td>Per audit</td>
    <td>Within 15 days</td>
  </tr>
  <tr>
    <td>Classification Audit</td>
    <td>Review of HS codes assigned to goods</td>
    <td>
      <input 
        type="checkbox" 
        checked={!!selectedFees["Classification Audit"]}
        onChange={() => handleFeeToggle("Classification Audit")}
      />
    </td>
    <td>Per audit</td>
    <td>Within 15 days</td>
  </tr>
  <tr>
    <td>Duty & Tax Audit</td>
    <td>Verification of duties, VAT, and excise applied</td>
    <td>
      <input 
        type="checkbox" 
        checked={!!selectedFees["Duty & Tax Audit"]}
        onChange={() => handleFeeToggle("Duty & Tax Audit")}
      />
    </td>
    <td>Per audit</td>
    <td>Within 15 days</td>
  </tr>
  <tr>
    <td>Warehouse Systems Audit</td>
    <td>For obtaining customs warehouse license</td>
    <td>
      <input 
        type="checkbox" 
        checked={!!selectedFees["Warehouse Systems Audit"]}
        onChange={() => handleFeeToggle("Warehouse Systems Audit")}
      />
    </td>
    <td>Per audit</td>
    <td>Within 15 days</td>
  </tr>
  <tr>
    <td>Archival Systems Audit</td>
    <td>For obtaining archival system approval</td>
    <td>
      <input 
        type="checkbox" 
        checked={!!selectedFees["Archival Systems Audit"]}
        onChange={() => handleFeeToggle("Archival Systems Audit")}
      />
    </td>
    <td>Per audit</td>
    <td>Within 15 days</td>
  </tr>
  <tr>
    <td>AEO Preparatory Audit</td>
    <td>Pre-assessment for AEO certification readiness</td>
    <td>
      <input 
        type="checkbox" 
        checked={!!selectedFees["AEO Preparatory Audit"]}
        onChange={() => handleFeeToggle("AEO Preparatory Audit")}
      />
    </td>
    <td>Per audit</td>
    <td>Within 15 days</td>
  </tr>
  <tr>
    <td>Freezone Clearance Letter Support</td>
    <td>Review for Freezone authority clearance</td>
    <td>
      <input 
        type="checkbox" 
        checked={!!selectedFees["Freezone Clearance Letter Support"]}
        onChange={() => handleFeeToggle("Freezone Clearance Letter Support")}
      />
    </td>
    <td>Per request</td>
    <td>Within 15 days</td>
  </tr>
  <tr>
    <td>Freezone Stock Reconciliation</td>
    <td>Stock verification for Freezone audits</td>
    <td>
      <input 
        type="checkbox" 
        checked={!!selectedFees["Freezone Stock Reconciliation"]}
        onChange={() => handleFeeToggle("Freezone Stock Reconciliation")}
      />
    </td>
    <td>Per audit</td>
    <td>Within 15 days</td>
  </tr>
  <tr>
    <td>Concurrent Audit</td>
    <td>Ongoing review during operations</td>
    <td>
      <input 
        type="checkbox" 
        checked={!!selectedFees["Concurrent Audit"]}
        onChange={() => handleFeeToggle("Concurrent Audit")}
      />
    </td>
    <td>Monthly</td>
    <td>Within 15 days</td>
  </tr>
  <tr>
    <td>Warehouse Stock Reconciliation Audit</td>
    <td>Stock vs system records verification</td>
    <td>
      <input 
        type="checkbox" 
        checked={!!selectedFees["Warehouse Stock Reconciliation Audit"]}
        onChange={() => handleFeeToggle("Warehouse Stock Reconciliation Audit")}
      />
    </td>
    <td>Per audit</td>
    <td>Within 15 days</td>
  </tr>
</tbody>

      </table>
      
      <p><span className="clause-title">6.1</span> All fees are exclusive of VAT, which will be charged as applicable.</p>
      <p><span className="clause-title">6.2</span> Any additional services outside the agreed scope will be subject to a separate quotation and approval.</p>
      
      <h2>7. CONFIDENTIALITY</h2>
      <p>Both Parties agree to maintain the confidentiality of all Confidential Information and not to disclose it to any third party except as required by law.</p>
      
      <h2>8. COMPLIANCE</h2>
      <br/>
      <p>The Consultant shall adhere to all applicable UAE laws, customs regulations, and Freezone authority requirements during the performance of Services.</p>
      
      <h2>9. LIMITATION OF LIABILITY</h2>
      <p>The Consultant shall not be liable for indirect, incidental, or consequential losses. Liability for direct damages shall not exceed the total fees paid under this Agreement.</p>
      
      <h2>10. TERMINATION</h2>
     <p>Either Party may terminate this Agreement with &nbsp;
      <t></t>
  <input
    type="text"
    value={terminationDays} 
    onChange={(e) => setTerminationDays(e.target.value)}
    className="dash-input"
    style={{width: '40px',
    fontWeight: 'bold',
    fontStyle: 'italic'
  }}
  />    <t></t>
  days' written notice. Termination shall not affect accrued rights or obligations.</p>
      
      <h2>11. GOVERNING LAW & JURISDICTION</h2>
      <p>This Agreement shall be governed by and construed in accordance with the laws of the United Arab Emirates. The Parties submit to the exclusive jurisdiction of the courts of Dubai, UAE.</p>
      
      <h2>12. ENTIRE AGREEMENT</h2>
      <p>This Agreement constitutes the entire understanding between the Parties and supersedes all prior agreements, whether oral or written.</p>
      
      <p className="underline">IN WITNESS WHEREOF, the Parties hereto have executed this Agreement as of the date first written above.</p>
      
      <div className="signature-block">
        <p>For NAVIGATE Customs Audit Consultancy LLC:</p>
        <p>Name: Snaweed</p>
        <p>Designation: Product Owner</p>
        <div className="signature-line"></div>
        <p>Signature: PO</p>
  <p>Date: {formatDateDMY(currentDate)}</p>
      </div>
      
      <div className="signature-block">
  <br />
  <p><b>For {clientName || "[Client Name]"}:</b></p>
</div>


      <form>
        <div className="contract-section">
          <div className="left-column">
            <label htmlFor="company-name">Name:</label>
            <input
              type="text"
              id="company-name"
              className='input1'
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />

            <label htmlFor="contract-title">Designation:</label>
            <input
              type="text"
              id="contract-title"
              className='input1'
              value={contractTitle}
              onChange={(e) => setContractTitle(e.target.value)}
              required
            />

            <label htmlFor="place">Place:</label>
            <textarea
              id="place"
              rows="4"
              value={companyAddress}
              className='input1'
              onChange={(e) => setCompanyAddress(e.target.value)}
              required
            />
          </div>

          <div className="right-column">
            <label htmlFor="date-of-agreement">Date:</label>
<div
  id="date-of-agreement"
  className="input1"
  style={{
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    background: '#f9f9f9',
    minHeight: '38px'
  }}
>
  {formatDateDMY(currentDate)}
</div>
            
            <div className="signature-box" onClick={() => setShowPopup(true)}>
              {signature ? (
                mode === 'upload' && uploadedImage ? (
                  <img src={uploadedImage} alt="Uploaded Signature" />
                ) : mode === 'type' ? (
                  <p style={{ fontFamily: selectedFont }}>{signature}</p>
                ) : (
                  <img src={signature} alt="Drawn Signature" />
                )
              ) : (
                <p>Click here to Sign</p>
              )}
            </div>
          </div>
        </div>

        <div className="action-buttons">
<button
  type="button"
  onClick={generatePDF}
  disabled={!isFormValid || loading}
  style={{
    opacity: isFormValid && !loading ? 1 : 0.5,
    cursor: isFormValid && !loading ? 'pointer' : 'not-allowed'
  }}
>
  {loading ? "Saving and Downloading..." : "Save and Download PDF"}
</button>
        </div>
      </form>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button onClick={() => setShowPopup(false)} className="close-button">
              ×
            </button>

            <div className="signature-mode-buttons">
              <button 
                onClick={() => handleModeChange('draw')}
                className={mode === 'draw' ? 'active' : ''}
              >
                Draw
              </button>
              <button 
                onClick={() => handleModeChange('type')}
                className={mode === 'type' ? 'active' : ''}
              >
                Type
              </button>
              <button 
                onClick={() => handleModeChange('upload')}
                className={mode === 'upload' ? 'active' : ''}
              >
                Upload
              </button>
            </div>

            {mode === 'draw' && (
              <SignatureCanvas
                ref={sigCanvas}
                penColor="#333"
                canvasProps={{
                  className: "signature-canvas"
                }}
                onEnd={() => {
                  const signatureData = sigCanvas.current.toDataURL();
                  setSignature(signatureData);
                }}
              />
            )}

            {mode === 'type' && (
              <div>
                <input
                  type="text"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  onFocus={() => setShowFontList(true)}
                  className="signature-input input1"
                  placeholder="Type your signature"
                  style={{ fontFamily: selectedFont }}
                />
                {showFontList && (
                  <div className="font-list">
                    {['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana'].map((font) => (
                      <div
                        key={font}
                        className="font-option"
                        style={{ fontFamily: font }}
                        onClick={() => {
                          setSelectedFont(font);
                          setShowFontList(false);
                        }}
                      >
                        {font}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {mode === 'upload' && (
              <div className="upload-section">
                <label className="upload-label">
                  Upload Signature
                  <input
                    type="file"
                    className='input1'
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            )}

            <div className="popup-action-buttons">
              <button onClick={clearSignature} className="clear-button">Clear</button>
              <button onClick={handleSave} className="save-button" disabled={!isSaveEnabled}>
                Save Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default CompanyContractForm;