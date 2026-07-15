import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';

function RegisterProvider() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        http.get("/user/ecosystem-profile").then((res) => {
            if(res.data.details) {
                formik.setValues(res.data.details);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const formik = useFormik({
        initialValues: {
            orgDetails: '',
            companyRegistrationId: '',
            telephoneNo: '',
            emailAddress: '',
            accreditationStatus: ''
        },
        validationSchema: yup.object({
            companyRegistrationId: yup.string().required('Company Registration ID is required'),
            emailAddress: yup.string().email('Invalid email structure').required('Contact email is required')
        }),
        onSubmit: (data) => {
            http.put("/user/ecosystem-profile", data).then(() => {
                toast.success("Training Provider profile updated successfully!");
            }).catch(() => {
                toast.error("Failed to update registration data.");
            });
        }
    });

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 5 }} />;

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 5 }}>
            <Typography variant="h5" gutterBottom>Training Provider Registration Profile</Typography>
            <form onSubmit={formik.handleSubmit}>
                <TextField fullWidth margin="dense" label="Org Details" name="orgDetails" multiline rows={3} value={formik.values.orgDetails} onChange={formik.handleChange} />
                <TextField fullWidth margin="dense" label="Company Registration ID" name="companyRegistrationId" value={formik.values.companyRegistrationId} onChange={formik.handleChange} error={formik.touched.companyRegistrationId && Boolean(formik.errors.companyRegistrationId)} helperText={formik.touched.companyRegistrationId && formik.errors.companyRegistrationId}/>
                <TextField fullWidth margin="dense" label="Telephone No." name="telephoneNo" value={formik.values.telephoneNo} onChange={formik.handleChange} />
                <TextField fullWidth margin="dense" label="Email Address" name="emailAddress" value={formik.values.emailAddress} onChange={formik.handleChange} error={formik.touched.emailAddress && Boolean(formik.errors.emailAddress)} helperText={formik.touched.emailAddress && formik.errors.emailAddress}/>
                <TextField fullWidth margin="dense" label="Accreditation Status" name="accreditationStatus" value={formik.values.accreditationStatus} onChange={formik.handleChange} />
                <Button variant="contained" type="submit" sx={{ mt: 2 }}>Save Registration Data</Button>
            </form>
            <ToastContainer />
        </Box>
    );
}
export default RegisterProvider;