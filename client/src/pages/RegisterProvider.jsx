import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, Typography, TextField, Button, CircularProgress, 
    MenuItem, Select, FormControl, InputLabel, FormHelperText, Alert 
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';

const trainingFields = [
    "Information Technology",
    "Business and Administration",
    "Engineering and Manufacturing",
    "Architecture, Building, and Real Estate",
    "Health and Social Sciences",
    "Services and Trades"
];

// Helper to decode JWT token directly without external libraries
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function RegisterProvider() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({ name: '', email: '' });

    useEffect(() => {
        // 1. Try decoding logged-in user details directly from stored JWT token
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        if (token) {
            const decoded = parseJwt(token);
            if (decoded) {
                setUserData({
                    name: decoded.name || decoded.username || '',
                    email: decoded.email || decoded.emailAddress || ''
                });
            }
        }

        // 2. Fetch fresh profile details from API as backup
        http.get("/user/auth")
            .then((res) => {
                if (res.data) {
                    const user = res.data.user || res.data;
                    setUserData({
                        name: user.name || '',
                        email: user.email || user.emailAddress || ''
                    });
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const formik = useFormik({
        enableReinitialize: true, // Auto-syncs form values when userData resolves
        initialValues: {
            name: userData.name || '',
            emailAddress: userData.email || '',
            mobileNo: '',
            companyRegistrationId: '',
            companyAddress: '',
            postalCode: '',
            companyWebsite: '',
            mainFieldOfTraining: '',
            proofOfCertification: ''
        },
        validationSchema: yup.object({
            name: yup.string().required('Name is required'),
            emailAddress: yup.string().email('Invalid email address format').required('Email Address is required'),
            mobileNo: yup.string().matches(/^[0-9]{8}$/, 'Must be exactly 8 digits').required('Mobile No. is required'),
            companyRegistrationId: yup.string().required('Company Registration/UEN Number is required'),
            companyAddress: yup.string().max(120, 'Maximum 120 characters').required('Company Address is required'),
            postalCode: yup.string().matches(/^[0-9]{6,8}$/, 'Must be between 6 and 8 digits').required('Postal Code is required'),
            companyWebsite: yup.string().url('Must be a valid URL starting with http:// or https://').required('Company Website is required'),
            mainFieldOfTraining: yup.string().required('Main Field of Training is required')
        }),
        onSubmit: (data) => {
            const payload = {
                ...data,
                role: 'Training Provider',
                email: data.emailAddress // Provide matching field for backend models
            };

            http.put("/user/ecosystem-profile", payload).then(() => {
                toast.success("Submitted successfully!");
                navigate('/provider-details', { state: { providerData: { ...payload, status: 'Pending Approval' } } });
            }).catch((err) => {
                toast.error(err.response?.data?.message || "Failed to submit registration data.");
            });
        }
    });

    const showError = (fieldName) => 
        (formik.touched[fieldName] || formik.submitCount > 0) && Boolean(formik.errors[fieldName]);

    const getErrorMessage = (fieldName) => 
        (formik.touched[fieldName] || formik.submitCount > 0) ? formik.errors[fieldName] : '';

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 5 }} />;

    return (
        <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4, mb: 8 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Training Provider Registration Page
            </Typography>

            {formik.submitCount > 0 && Object.keys(formik.errors).length > 0 && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Please correct the highlighted errors below before submitting.
                </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
                <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
                    Training Provider Details
                </Typography>

                {/* Name */}
                <TextField 
                    fullWidth margin="dense" label="Name" name="name" 
                    value={formik.values.name} 
                    onChange={formik.handleChange}
                    error={showError('name')} helperText={getErrorMessage('name')} 
                />

                {/* Email Address */}
                <TextField 
                    fullWidth margin="dense" label="Email Address (User login ID)" name="emailAddress" 
                    value={formik.values.emailAddress} 
                    onChange={formik.handleChange}
                    error={showError('emailAddress')} helperText={getErrorMessage('emailAddress')} 
                />

                <TextField 
                    fullWidth margin="dense" label="Mobile No." name="mobileNo" 
                    value={formik.values.mobileNo} onChange={formik.handleChange} 
                    error={showError('mobileNo')} helperText={getErrorMessage('mobileNo')} 
                />

                <TextField 
                    fullWidth margin="dense" label="Company Registration/UEN Number" name="companyRegistrationId" 
                    placeholder="e.g. 53123456A" value={formik.values.companyRegistrationId} onChange={formik.handleChange} 
                    error={showError('companyRegistrationId')} helperText={getErrorMessage('companyRegistrationId')} 
                />

                <TextField 
                    fullWidth margin="dense" label="Company Address" name="companyAddress" multiline rows={2} 
                    value={formik.values.companyAddress} onChange={formik.handleChange} 
                    error={showError('companyAddress')} helperText={getErrorMessage('companyAddress')} 
                />

                <TextField 
                    fullWidth margin="dense" label="Postal Code" name="postalCode" 
                    value={formik.values.postalCode} onChange={formik.handleChange} 
                    error={showError('postalCode')} helperText={getErrorMessage('postalCode')} 
                />

                <TextField 
                    fullWidth margin="dense" label="Company Website" name="companyWebsite" 
                    value={formik.values.companyWebsite} onChange={formik.handleChange} 
                    error={showError('companyWebsite')} helperText={getErrorMessage('companyWebsite')} 
                />

                <Typography variant="h6" sx={{ mt: 4, mb: 1, fontWeight: 'bold' }}>
                    Training Accreditation Details
                </Typography>

                <FormControl fullWidth margin="dense" error={showError('mainFieldOfTraining')}>
                    <InputLabel id="main-field-label">Main Field of Training</InputLabel>
                    <Select
                        labelId="main-field-label"
                        name="mainFieldOfTraining"
                        value={formik.values.mainFieldOfTraining}
                        label="Main Field of Training"
                        onChange={formik.handleChange}
                    >
                        {trainingFields.map((field, idx) => (
                            <MenuItem key={idx} value={field}>{field}</MenuItem>
                        ))}
                    </Select>
                    {showError('mainFieldOfTraining') && <FormHelperText>{getErrorMessage('mainFieldOfTraining')}</FormHelperText>}
                </FormControl>

                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Proof of Certification (Upload files up to 10MB)
                    </Typography>
                    <Button variant="outlined" component="label">
                        Upload Files
                        <input type="file" hidden multiple onChange={(e) => {
                            if (e.target.files.length > 0) {
                                formik.setFieldValue("proofOfCertification", e.target.files[0].name);
                            }
                        }} />
                    </Button>
                    {formik.values.proofOfCertification && (
                        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'green' }}>
                            Attached: {formik.values.proofOfCertification}
                        </Typography>
                    )}
                </Box>

                <Button variant="contained" color="success" type="submit" size="large" sx={{ mt: 4 }}>
                    Submit Registration Data
                </Button>
            </form>
            <ToastContainer />
        </Box>
    );
}

export default RegisterProvider;