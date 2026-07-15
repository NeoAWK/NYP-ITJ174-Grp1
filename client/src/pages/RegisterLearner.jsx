import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, FormControlLabel, Checkbox, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';

function RegisterLearner() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        http.get("/user/ecosystem-profile").then((res) => {
            if(res.data.details) formik.setValues(res.data.details);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const formik = useFormik({
        initialValues: { enrolledCourse: '', moduleHours: 0, notStarted: true, inProgress: false, completed: false },
        onSubmit: (data) => {
            http.put("/user/ecosystem-profile", data).then(() => {
                toast.success("Learner course tracking saved!");
            });
        }
    });

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 5 }} />;

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 5 }}>
            <Typography variant="h5" gutterBottom>Learner Academic Tracking Profile</Typography>
            <form onSubmit={formik.handleSubmit}>
                <TextField fullWidth margin="dense" label="Enrolled Course" name="enrolledCourse" value={formik.values.enrolledCourse} onChange={formik.handleChange} />
                <TextField fullWidth margin="dense" label="Module Hours" name="moduleHours" type="number" value={formik.values.moduleHours} onChange={formik.handleChange} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2 }}>
                    <FormControlLabel control={<Checkbox name="notStarted" checked={formik.values.notStarted} onChange={formik.handleChange} />} label="Not Started" />
                    <FormControlLabel control={<Checkbox name="inProgress" checked={formik.values.inProgress} onChange={formik.handleChange} />} label="In Progress" />
                    <FormControlLabel control={<Checkbox name="completed" checked={formik.values.completed} onChange={formik.handleChange} />} label="Completed" />
                </Box>

                <Button variant="contained" type="submit" sx={{ mt: 2 }}>Save Registration Info</Button>
            </form>
            <ToastContainer />
        </Box>
    );
}
export default RegisterLearner;
