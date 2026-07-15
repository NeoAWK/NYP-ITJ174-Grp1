import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';

function RegisterTrainer() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        http.get("/user/ecosystem-profile").then((res) => {
            if(res.data.details) formik.setValues(res.data.details);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const formik = useFormik({
        initialValues: { qualifications: '', certification: '', experience: '', professionalDevelopment: '', certificationValidity: '' },
        validationSchema: yup.object({
            qualifications: yup.string().required('Qualifications are required')
        }),
        onSubmit: (data) => {
            http.put("/user/ecosystem-profile", data).then(() => {
                toast.success("Trainer profile updated successfully!");
            });
        }
    });

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 5 }} />;

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 5 }}>
            <Typography variant="h5" gutterBottom>Trainer Registration Profile</Typography>
            <form onSubmit={formik.handleSubmit}>
                <TextField fullWidth margin="dense" label="Qualifications" name="qualifications" value={formik.values.qualifications} onChange={formik.handleChange} error={formik.touched.qualifications && Boolean(formik.errors.qualifications)}/>
                <TextField fullWidth margin="dense" label="Certification" name="certification" value={formik.values.certification} onChange={formik.handleChange} />
                <TextField fullWidth margin="dense" label="Experience" name="experience" multiline rows={3} value={formik.values.experience} onChange={formik.handleChange} />
                <TextField fullWidth margin="dense" label="Professional Development" name="professionalDevelopment" value={formik.values.professionalDevelopment} onChange={formik.handleChange} />
                <TextField fullWidth margin="dense" label="Certification Validity" name="certificationValidity" type="date" InputLabelProps={{ shrink: true }} value={formik.values.certificationValidity} onChange={formik.handleChange} />
                <Button variant="contained" type="submit" sx={{ mt: 2 }}>Save Trainer Details</Button>
            </form>
            <ToastContainer />
        </Box>
    );
}
export default RegisterTrainer;