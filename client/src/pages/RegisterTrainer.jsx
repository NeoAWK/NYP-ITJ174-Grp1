import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, Typography, TextField, Button, CircularProgress, 
    MenuItem, Select, FormControl, InputLabel, FormHelperText, Alert, Chip
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';

const expertiseAreas = [
    "Information Technology",
    "Business and Administration",
    "Engineering and Manufacturing",
    "Architecture, Building, and Real Estate",
    "Health and Social Sciences",
    "Services and Trades"
];

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

function RegisterTrainer() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({ id: '', name: '', email: '' });
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: '',
            emailAddress: '',
            mobileNo: '',
            areasOfExpertise: '',
            resumeExperience: ''
        },
        validationSchema: yup.object({
            name: yup.string().required('Name is required'),
            emailAddress: yup.string().email('Invalid email address format').required('Email address is required'),
            mobileNo: yup.string().matches(/^[0-9]{8}$/, 'Must be exactly 8 digits').required('Mobile no. is required'),
            areasOfExpertise: yup.string().required('Areas of Expertise is required'),
            resumeExperience: yup.string().required('Resume / Experience file is required')
        }),
        onSubmit: (data) => {
            const payload = {
                userId: userData.id,
                role: 'Trainer',
                name: data.name,
                emailAddress: data.emailAddress,
                mobileNo: data.mobileNo,
                areasOfExpertise: data.areasOfExpertise,
                resumeExperience: data.resumeExperience
            };

            http.put("/user/ecosystem-profile", payload).then(() => {
                toast.success("Trainer registration saved successfully!");
                navigate('/trainer-details', { state: { trainerData: { ...payload, status: 'Pending Approval' } } });
            }).catch((err) => {
                toast.error(err.response?.data?.message || "Failed to save trainer details.");
            });
        }
    });

    useEffect(() => {
        const fetchUserData = async () => {
            let id = '';
            let name = '';
            let email = '';

            const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
            if (token) {
                const decoded = parseJwt(token);
                if (decoded) {
                    id = decoded.id || decoded.userId || decoded.sub || '';
                    name = decoded.name || decoded.username || '';
                    email = decoded.email || decoded.emailAddress || '';
                }
            }

            try {
                const res = await http.get("/user/auth");
                if (res.data) {
                    const user = res.data.user || res.data;
                    id = user.id || user.userId || id;
                    name = user.name || name;
                    email = user.email || user.emailAddress || email;
                }
            } catch (err) {
                console.error("Failed to fetch authenticated user", err);
            }

            setUserData({ id, name, email });
            formik.setFieldValue("name", name);
            formik.setFieldValue("emailAddress", email);

            try {
                const profileRes = await http.get("/user/ecosystem-profile");
                const trainerProfile = profileRes.data.profiles?.trainer;
                if (trainerProfile && trainerProfile.name) {
                    setAlreadyRegistered(true);
                }
            } catch (err) {
                console.error("Failed to fetch existing trainer profile", err);
            }

            setLoading(false);
        };

        fetchUserData();
    }, []);

    const showError = (fieldName) => 
        (formik.touched[fieldName] || formik.submitCount > 0) && Boolean(formik.errors[fieldName]);

    const getErrorMessage = (fieldName) => 
        (formik.touched[fieldName] || formik.submitCount > 0) ? formik.errors[fieldName] : '';

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxMB = 10;
            if (file.size > maxMB * 1024 * 1024) {
                toast.error(`File size exceeds ${maxMB}MB limit.`);
                return;
            }
            formik.setFieldValue("resumeExperience", file.name);
        }
    };

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 5 }} />;

    if (alreadyRegistered) {
        return (
            <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4, mb: 8, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Trainer Registration Page
                </Typography>
                <Chip
                    label="Pending Approval"
                    color="warning"
                    sx={{ fontWeight: 'bold', fontSize: '0.9rem', my: 2 }}
                />
                <Typography sx={{ mb: 3 }}>
                    You have already submitted a Trainer registration. It is currently awaiting
                    approval, so it cannot be resubmitted at this time.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/trainer-details')}>
                    View My Registration
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4, mb: 8 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Trainer Registration Page
            </Typography>

            {formik.submitCount > 0 && Object.keys(formik.errors).length > 0 && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Please correct the highlighted errors below before submitting.
                </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
                <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
                    Trainer Details
                </Typography>

                <TextField 
                    fullWidth margin="dense" label="Name" name="name" 
                    value={formik.values.name} onChange={formik.handleChange} 
                    disabled
                    InputLabelProps={{ shrink: true }}
                    error={showError('name')} helperText={getErrorMessage('name')} 
                />

                <TextField 
                    fullWidth margin="dense" label="Email Address" name="emailAddress" 
                    value={formik.values.emailAddress} onChange={formik.handleChange} 
                    disabled
                    InputLabelProps={{ shrink: true }}
                    error={showError('emailAddress')} helperText={getErrorMessage('emailAddress')} 
                />

                <TextField 
                    fullWidth margin="dense" label="Mobile No." name="mobileNo" 
                    placeholder="8 digits" value={formik.values.mobileNo} onChange={formik.handleChange} 
                    error={showError('mobileNo')} helperText={getErrorMessage('mobileNo')} 
                />

                <FormControl fullWidth margin="dense" error={showError('areasOfExpertise')}>
                    <InputLabel id="expertise-label">Areas of Expertise</InputLabel>
                    <Select
                        labelId="expertise-label"
                        name="areasOfExpertise"
                        value={formik.values.areasOfExpertise}
                        label="Areas of Expertise"
                        onChange={formik.handleChange}
                    >
                        {expertiseAreas.map((area, idx) => (
                            <MenuItem key={idx} value={area}>{area}</MenuItem>
                        ))}
                    </Select>
                    {showError('areasOfExpertise') && (
                        <FormHelperText>{getErrorMessage('areasOfExpertise')}</FormHelperText>
                    )}
                </FormControl>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Resume / Experience (Upload files up to 10MB)
                    </Typography>
                    <Button variant="outlined" component="label">
                        Upload File
                        <input type="file" hidden onChange={handleFileUpload} />
                    </Button>
                    {formik.values.resumeExperience && (
                        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'green' }}>
                            Attached: {formik.values.resumeExperience}
                        </Typography>
                    )}
                    {showError('resumeExperience') && (
                        <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                            {getErrorMessage('resumeExperience')}
                        </Typography>
                    )}
                </Box>

                <Button variant="contained" color="success" type="submit" size="large" sx={{ mt: 4 }}>
                    SAVE TRAINER DETAILS
                </Button>
            </form>
            <ToastContainer />
        </Box>
    );
}

export default RegisterTrainer;