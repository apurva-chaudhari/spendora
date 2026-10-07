import { useState } from "react";
import { useNavigate } from "react-router-dom";
import billService from "../services/billService";

const ScanBill = () => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ocrText, setOcrText] = useState("");

  const handleFileChange = (e) => {
    setError("");
    setSuccess("");

    const file = e.target.files[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select a bill image.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await billService.uploadBill(selectedFile);

      setSuccess("Bill uploaded and scanned successfully.");
      setOcrText(data.rawText || "");

      navigate("/review-bill", {
        state: {
          bill: data.bill,
        },
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to upload bill.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Scan Bill</h1>

      <p>
        Upload your bill and Spendora will extract the important information.
      </p>

      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>

      <form onSubmit={handleUpload}>
        <div>
          <label>Select Bill Image</label>

          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
          />
        </div>

        {selectedFile && <p>Selected file: {selectedFile.name}</p>}

        {error && <p>{error}</p>}

        {success && <p>{success}</p>}

        {ocrText && (
          <div>
            <h2>Extracted Bill Text</h2>

            <pre>{ocrText}</pre>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload Bill"}
        </button>
      </form>
    </div>
  );
};

export default ScanBill;
