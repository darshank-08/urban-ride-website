import { useState } from "react";
import styles from "./AddCar.module.css";

const AddCar = () => {
  const [data, setData] = useState({
    company: "",
    model: "",
    year: "",
    pricePerDay: "",
    location: "",
    seats: "",
    approxMileage: "",
    condition: "",
    fuelType: "",
    transmission: "",
    features: ""
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [documentFile, setDocumentFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setHeroIndex(0);
  };

  const handleDocumentChange = (e) => {
    setDocumentFile(e.target.files[0] || null);
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("https://urban-rides.onrender.com/Owner/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: formData
    });

    if (!res.ok) {
      throw new Error("File upload failed");
    }

    const url = await res.text();
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (imageFiles.length === 0) {
        setError("Please select at least one car image.");
        setLoading(false);
        return;
      }
      if (!documentFile) {
        setError("Please upload RC / Insurance PDF.");
        setLoading(false);
        return;
      }

      const orderedFiles = [
        imageFiles[heroIndex],
        ...imageFiles.filter((_, idx) => idx !== heroIndex)
      ];

      const imageUrls = await Promise.all(
        orderedFiles.map((file) => uploadFile(file))
      );

      const documentUrl = await uploadFile(documentFile);

      const payload = {
        company: data.company,
        model: data.model,
        year: Number(data.year),
        pricePerDay: Number(data.pricePerDay),
        location: data.location,
        seats: Number(data.seats),
        approxMileage: Number(data.approxMileage),
        condition: data.condition,
        fuelType: data.fuelType,
        transmission: data.transmission,
        features: data.features
          ? data.features.split(",").map((f) => f.trim()).filter(Boolean)
          : [],
        images: imageUrls,
        document: documentUrl
      };

      const res = await fetch("https://urban-rides.onrender.com/Owner/add-cars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Failed to add car");
        return;
      }

      alert("Car added successfully. Waiting for admin approval.");
      navigate("/Owner");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while uploading/adding car");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2>Add New Car</h2>
        <p>Fill in the details to add a new car to your fleet.</p>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            name="company"
            placeholder="Company (e.g. Toyota)"
            onChange={handleChange}
          />
          <input
            name="model"
            placeholder="Model (e.g. Fortuner)"
            onChange={handleChange}
          />
          <input
            type="number"
            name="year"
            placeholder="Manufacturing Year"
            onChange={handleChange}
          />
          <input
            type="number"
            name="pricePerDay"
            placeholder="Price per day ₹"
            onChange={handleChange}
          />
          <input
            name="location"
            placeholder="Car Location"
            onChange={handleChange}
          />
          <input
            type="number"
            name="seats"
            placeholder="Seats"
            onChange={handleChange}
          />
          <input
            type="number"
            name="approxMileage"
            placeholder="Mileage (km/l)"
            onChange={handleChange}
          />

          <select name="condition" onChange={handleChange}>
            <option value="">Condition</option>
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="AVERAGE">Average</option>
          </select>

          <select name="fuelType" onChange={handleChange}>
            <option value="">Fuel Type</option>
            <option value="PETROL">Petrol</option>
            <option value="DIESEL">Diesel</option>
            <option value="ELECTRIC">Electric</option>
          </select>

          <select name="transmission" onChange={handleChange}>
            <option value="">Transmission</option>
            <option value="MANUAL">Manual</option>
            <option value="AUTOMATIC">Automatic</option>
          </select>

          <input
            name="features"
            placeholder="Features (AC, GPS, Airbags)"
            onChange={handleChange}
          />

          {/* Images & preview */}
          <div className={styles.uploadGroup}>
            <span className={styles.uploadLabel}>Car Images</span>

            <label className={styles.fileBox} htmlFor="carImages">
              <span className={styles.fileTitle}>Upload car photos</span>
              <span className={styles.fileHint}>
                Click to choose – you can select multiple images
              </span>
            </label>

            <input
              id="carImages"
              type="file"
              multiple
              accept="image/*"
              className={styles.fileInput}
              onChange={handleImagesChange}
            />

            {imageFiles.length > 0 && (
              <>
                {/* Singular or plural */}
                <p className={styles.fileInfo}>
                  {imageFiles.length} image
                  {imageFiles.length > 1 ? "s" : ""} selected
                </p>

                {/* Preview grid */}
                <div className={styles.previewGrid}>
                  {imageFiles.map((file, idx) => (
                    <div key={idx} className={styles.previewItem}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${idx + 1}`}
                        className={styles.previewImage}
                      />
                      <button
                        type="button"
                        className={
                          idx === heroIndex
                            ? styles.heroButtonActive
                            : styles.heroButton
                        }
                        onClick={() => setHeroIndex(idx)}
                      >
                        {idx === heroIndex ? "Hero image" : "Set as hero"}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={styles.uploadGroup}>
            <span className={styles.uploadLabel}>RC / Insurance Document</span>

            <label className={styles.fileBox} htmlFor="rcDocument">
              <span className={styles.fileTitle}>Upload RC / Insurance PDF</span>
              <span className={styles.fileHint}>PDF only</span>
            </label>

            <input
              id="rcDocument"
              type="file"
              accept="application/pdf"
              className={styles.fileInput}
              onChange={handleDocumentChange}
            />

            {documentFile && (
              <p className={styles.fileInfo}>Selected: {documentFile.name}</p>
            )}
          </div>

          <button disabled={loading}>
            {loading ? "Submitting..." : "Add Car"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCar;