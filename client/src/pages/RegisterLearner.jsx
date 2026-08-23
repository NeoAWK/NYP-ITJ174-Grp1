import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    CircularProgress, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    FormHelperText 
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const educationOptions = [
    "N Level",
    "O Level",
    "A Level",
    "Diploma",
    "Degree"
];

const interestOptions = [
    "Information Technology",
    "Business and Administration",
    "Engineering and Manufacturing",
    "Architecture, Building, and Real Estate",
    "Health and Social Sciences",
    "Services and Trades"
];

function RegisterLearner() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            let name = '';
            let email = '';

            // 1. Get the registered account's name/email (read-only source of truth)
            try {
                const authRes = await http.get("/user/auth");
                if (authRes.data) {
                    const user = authRes.data.user || authRes.data;
                    name = user.name || '';
                    email = user.email || '';
                }
            } catch (err) {
                console.error("Failed to fetch authenticated user", err);
            }

            // 2. Layer in any previously-saved learner profile details
            try {
                const profileRes = await http.get("/user/ecosystem-profile");
                const details = profileRes.data.details;
                formik.setValues({
                    name: name,
                    email: email,
                    mobileNo: details?.mobileNo || '',
                    educationQualification: details?.educationQualification || '',
                    areaOfInterest: details?.areaOfInterest || '',
                    attachment: details?.attachment || ''
                });
            } catch (err) {
                formik.setValues({
                    name: name,
                    email: email,
                    mobileNo: '',
                    educationQualification: '',
                    areaOfInterest: '',
                    attachment: ''
                });
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    const validationSchema = Yup.object({
        name: Yup.string().max(100, 'Max 100 characters').required('Name is required'),
        email: Yup.string().email('Invalid email address').required('Email is required'),
        mobileNo: Yup.string()
            .matches(/^[0-9]{8}$/, 'Must be exactly 8 digits')
            .required('Mobile number is required'),
        educationQualification: Yup.string().required('Education qualification is required'),
        areaOfInterest: Yup.string().required('Area of interest is required'),
        attachment: Yup.string().nullable()
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            mobileNo: '',
            educationQualification: '',
            areaOfInterest: '',
            attachment: ''
        },
        validationSchema,
        onSubmit: (values) => {
            const payload = {
                role: 'Learner',
                name: values.name,
                email: values.email,
                mobileNo: values.mobileNo,
                educationQualification: values.educationQualification,
                areaOfInterest: values.areaOfInterest,
                attachment: values.attachment // filename string returned by /file/upload
            };

            http.put("/user/ecosystem-profile", payload).then(() => {
                toast.success("Learner registration details saved successfully!");
                navigate('/learner-details', { state: { learnerData: { ...payload, status: 'Registered' } } });
            }).catch((err) => {
                toast.error(err.response?.data?.message || "Failed to save registration details.");
            });
        }
    });

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 5 }} />;

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, mb: 4, p: 2 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Learner Registration Page
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
                Learner Details
            </Typography>

            <form onSubmit={formik.handleSubmit}>
                <TextField
                    fullWidth
                    margin="dense"
                    label="Name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled
                    InputLabelProps={{ shrink: true }}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                />

                <TextField
                    fullWidth
                    margin="dense"
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled
                    InputLabelProps={{ shrink: true }}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                />

                <TextField
                    fullWidth
                    margin="dense"
                    label="Mobile No."
                    name="mobileNo"
                    value={formik.values.mobileNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.mobileNo && Boolean(formik.errors.mobileNo)}
                    helperText={formik.touched.mobileNo && formik.errors.mobileNo}
                />

                <FormControl 
                    fullWidth 
                    margin="dense" 
                    error={formik.touched.educationQualification && Boolean(formik.errors.educationQualification)}
                >
                    <InputLabel id="education-label">Education Qualification</InputLabel>
                    <Select
                        labelId="education-label"
                        name="educationQualification"
                        value={formik.values.educationQualification}
                        label="Education Qualification"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    >
                        {educationOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                    {formik.touched.educationQualification && formik.errors.educationQualification && (
                        <FormHelperText>{formik.errors.educationQualification}</FormHelperText>
                    )}
                </FormControl>

                <FormControl 
                    fullWidth 
                    margin="dense" 
                    error={formik.touched.areaOfInterest && Boolean(formik.errors.areaOfInterest)}
                >
                    <InputLabel id="interest-label">Areas of Interest</InputLabel>
                    <Select
                        labelId="interest-label"
                        name="areaOfInterest"
                        value={formik.values.areaOfInterest}
                        label="Areas of Interest"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    >
                        {interestOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                    {formik.touched.areaOfInterest && formik.errors.areaOfInterest && (
                        <FormHelperText>{formik.errors.areaOfInterest}</FormHelperText>
                    )}
                </FormControl>

                <Box sx={{ mt: 2, mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Attachment of Qualification (Max 10MB)
                    </Typography>
                    <Button variant="outlined" component="label" fullWidth>
                        {formik.values.attachment ? formik.values.attachment : "Upload File"}
                        <input
                            type="file"
                            hidden
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            onChange={(event) => {
                                const file = event.currentTarget.files[0];
                                if (!file) return;

                                if (file.size > MAX_FILE_SIZE) {
                                    toast.error("File size must be 10MB or less");
                                    return;
                                }

                                const uploadData = new FormData();
                                uploadData.append('file', file);

                                http.post('/file/upload', uploadData, {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                }).then((res) => {
                                    formik.setFieldValue("attachment", res.data.filename);
                                }).catch(() => {
                                    toast.error("File upload failed.");
                                });
                            }}
                        />
                    </Button>
                    {formik.touched.attachment && formik.errors.attachment && (
                        <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                            {formik.errors.attachment}
                        </Typography>
                    )}
                </Box>

                <Button 
                    variant="contained" 
                    type="submit" 
                    color="primary" 
                    fullWidth 
                    sx={{ mt: 3 }}
                >
                    Save Registration Info
                </Button>
            </form>
            <ToastContainer />
        </Box>
    );
}

export default RegisterLearner;