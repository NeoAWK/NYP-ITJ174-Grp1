import React, { useState, useContext, useEffect } from 'react';
import { Box, Typography, TextField, Button, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import UserContext from '../contexts/UserContext';
import { ToastContainer, toast } from 'react-toastify';

function Profile() {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Redirect to login if not logged in
    useEffect(() => {
        if (!localStorage.getItem("accessToken")) {
            navigate("/login");
        }
    }, [navigate]);

    const formik = useFormik({
        initialValues: {
            name: user?.name || "",
            email: user?.email || "",
            mobileNo: user?.mobileNo || ""
        },
        enableReinitialize: true,
        validationSchema: yup.object({
            mobileNo: yup.string().trim()
                .transform((value, originalValue) => originalValue === '' ? null : value)
                .nullable()
                .matches(/^[0-9]+$/, "Only numbers are allowed")
                .min(8, 'Mobile number must be at least 8 characters')
                .max(15, 'Mobile number must be at most 15 characters')
        }),
        onSubmit: async (data) => {
            let uploadedFilename = null;
            try {
                let profilePicture = user.profilePicture;

                // 1. Handle File Upload if a new image is selected
                if (imageFile) {
                    const formData = new FormData();
                    formData.append('file', imageFile);
                    const uploadRes = await http.post('/file/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    profilePicture = uploadRes.data.filename;
                    uploadedFilename = profilePicture;
                }

                // 2. Update Profile Data
                const updateData = {
                    mobileNo: data.mobileNo.trim() || null,
                    profilePicture: profilePicture
                };

                await http.put(`/user/update`, updateData);
                
                // Update local context
                setUser({ ...user, ...updateData });
                
                toast.success("Profile updated successfully!");

                // 3. Redirect to Home after a short delay
                setTimeout(() => {
                    navigate("/");
                }, 1500);

            } catch (err) {
                if (uploadedFilename) {
                    await http.delete(`/file/upload/${encodeURIComponent(uploadedFilename)}`).catch(() => {});
                }
                toast.error(err.response?.data?.message || "An error occurred during update.");
            }
        }
    });

    const onFileChange = (e) => {
        let file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                toast.error("Maximum file size is 1MB");
                return;
            }
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Local preview
        }
    };

    return (
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ mb: 2 }}>User Profile</Typography>
            
            <Box component="form" sx={{ maxWidth: '500px', width: '100%' }} onSubmit={formik.handleSubmit}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Avatar 
                        src={previewUrl || (user?.profilePicture ? `${import.meta.env.VITE_FILE_BASE_URL}${user.profilePicture}` : "")}
                        sx={{ width: 100, height: 100, margin: '0 auto' }} 
                    />
                    <Button variant="contained" component="label" sx={{ mt: 1 }}>
                        Upload Profile Picture
                        <input hidden accept="image/*" type="file" onChange={onFileChange} />
                    </Button>
                </Box>

                <TextField
                    fullWidth margin="dense" label="Name"
                    name="name" value={formik.values.name} disabled
                />
                <TextField
                    fullWidth margin="dense" label="Email"
                    name="email" value={formik.values.email} disabled
                />
                <TextField
                    fullWidth margin="dense" label="Mobile Number"
                    name="mobileNo"
                    value={formik.values.mobileNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.mobileNo && Boolean(formik.errors.mobileNo)}
                    helperText={formik.touched.mobileNo && formik.errors.mobileNo}
                />
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button fullWidth variant="contained" type="submit">
                        Update Profile
                    </Button>
                    <Button fullWidth variant="outlined" onClick={() => navigate("/")}>
                        Cancel
                    </Button>
                </Box>
            </Box>
            <ToastContainer />
        </Box>
    );
}

export default Profile;