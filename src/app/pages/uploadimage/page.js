"use client";
import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import "primeflex/primeflex.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import { generateDownloadSignedUrl } from "@/app/util/io";

const BUCKET_NAME = "sdhub"; // Your bucket name
const REGION = "blr1";        // Your bucket region

const UploadImage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const toast = useRef(null);

  const onFileSelect = (e) => {
    setSelectedFile(e.files[0]);
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      toast.current.show({
        severity: "warn",
        summary: "No File",
        detail: "Please select a file to upload",
        life: 3000,
      });
      return;
    }

    try {
      // Get signed upload URL from backend
      const response = await fetch(
        `/api/v1/uploads/get-signed-url?filename=${encodeURIComponent(selectedFile.name)}&type=${encodeURIComponent(selectedFile.type)}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get signed URL: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const signedUrl = data.data.url;

      // Log only the signed upload URL
      console.log("Signed upload URL:", signedUrl);

      if (!signedUrl) {
        throw new Error("Signed URL not found in response");
      }

      // Upload file with signed URL
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (uploadResponse.ok) {
        // Construct public URL for displaying image (not logged)
        const publicUrl = `https://${BUCKET_NAME}.${REGION}.digitaloceanspaces.com/${encodeURIComponent(selectedFile.name)}`;
        setUploadedImageUrl(publicUrl);

        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "File uploaded successfully",
          life: 3000,
        });
      } else {
        toast.current.show({
          severity: "error",
          summary: "Upload Failed",
          detail: "Upload failed, please try again",
          life: 3000,
        });
      }
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.message || "Something went wrong",
        life: 3000,
      });
      console.error(err);
    }
  };

  const fetchImage = async () => {
    try {
      // Assuming the image name is known or stored after upload
      const imageName = selectedFile ? selectedFile.name : null;
      if (!imageName) {
        toast.current.show({
          severity: "warn",
          summary: "No Image",
          detail: "No image to fetch, please upload first",
          life: 3000,
        });
        return;
      }
      console.log("Fetching image with name:", imageName);
      const finalSignedUrl = await generateDownloadSignedUrl(imageName);
      console.log("Generated signed download URL:", finalSignedUrl);
      setUploadedImageUrl(finalSignedUrl);
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err || "Failed to fetch image",
        life: 3000,
      });
      console.error(err);
    }
  };

  return (
    <div className="p-d-flex p-flex-column p-ai-center p-jc-center" style={{ minHeight: "80vh" }}>
      <Toast ref={toast} />

      <div className="p-field p-mb-3" style={{ marginBottom: "1rem" }}>
        <FileUpload
          name="file"
          mode="basic"
          chooseLabel="Select Image"
          accept="image/*"
          onSelect={onFileSelect}
          onClear={() => setSelectedFile(null)}
          multiple={false}
        />
      </div>

      <Button
        className="p-mt-3"
        icon="pi pi-upload"
        label="Upload"
        onClick={uploadFile}
        disabled={!selectedFile}
        style={{ marginTop: "0.5rem" }}
      />

      <br/>

      <Button onClick={fetchImage} label="Fetch Image from Backend" icon="pi pi-refresh" className="p-button-secondary  mt-3" />

      {uploadedImageUrl && (
        <div className="p-mt-4" style={{ textAlign: "center" }}>
          <h3>Uploaded Image:</h3>
          <img
            alt="Uploaded"
            src={uploadedImageUrl}
            style={{ maxWidth: "400px", maxHeight: "400px", borderRadius: 8 }}
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};

export default UploadImage;
