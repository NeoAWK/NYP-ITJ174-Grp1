import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from '../contexts/UserContext';

function Login() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [backendMode, setBackendMode] = useState('unknown');

    useEffect(() => {
        http.get('/system/mode')
            .then((res) => {
                setBackendMode(res.data.mode || 'unknown');
            })
            .catch(() => {
                setBackendMode('unknown');
            });
    }, []);

    const formik = useFormik({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema: yup.object({
            email: yup.string().trim()
                .email('Enter a valid email')
                .max(50, 'Email must be at most 50 characters')
                .required('Email is required'),
            password: yup.string().trim()
                .min(7, 'Password must be at least 7 characters')
                .max(50, 'Password must be at most 50 characters')
                .required('Password is required')
        }),
        onSubmit: (data) => {
            data.email = data.email.trim().toLowerCase();
            data.password = data.password.trim();
            
            http.post("/user/login", data)
                .then((res) => {
                    if (!res.data.user.isVerified) {
                        toast.error("Please verify your email before logging in.");
                    } else {
                        localStorage.setItem("accessToken", res.data.accessToken);
                        setUser(res.data.user);

                        // Route to Officer Dashboard if officer email, else default route
                        if (res.data.user.email === 'admin123@abc.com') {
                            navigate("/officer-dashboard");
                        }  else {
                            navigate("/");
                        }
                    }
                })
                .catch((err) => {
                    const message = err.response?.data?.message || "An error occurred during login.";
                    toast.error(message);
                });
        }
    });

    return (
        <Box sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <Typography variant="h5" sx={{ my: 2 }}>
                Login
            </Typography>
            {backendMode === 'placeholder' && (
                <Alert severity="info" sx={{ mb: 2, width: '100%', maxWidth: '500px' }}>
                    <strong>Officer Login:</strong> admin123@abc.com / P@ssw0rd <br />
                    <strong>Temp Account:</strong> temp@rightskills.local / TempPass123!
                </Alert>
            )}
            <Box component="form" sx={{ maxWidth: '500px', width: '100%' }}
                onSubmit={formik.handleSubmit}>
                <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                />
                <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Password"
                    name="password" type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                />
                <Button fullWidth variant="contained" sx={{ mt: 2 }}
                    type="submit">
                    Login
                </Button>
            </Box>

            <ToastContainer />
        </Box>
    );

}

export default Login;