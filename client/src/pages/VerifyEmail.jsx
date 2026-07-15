import React, { useEffect, useRef } from 'react'; // Import useRef
import { Box, Typography, CircularProgress } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import http from '../http';
import { toast } from 'react-toastify';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    // Use a ref to track if the request has already been sent
    const initialized = useRef(false);

    useEffect(() => {
        // If already initialized, do nothing
        if (initialized.current) return;
        
        const token = searchParams.get("token");

        if (!token) {
            toast.error("Invalid verification link.");
            return;
        }

        // Set flag to true immediately
        initialized.current = true;

        http.post("/user/verify-email", { token })
            .then(() => {
                toast.success("Email verified successfully! You can now log in.");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            })
            .catch((err) => {
                // If the error is "Invalid or expired" but the user is already verified,
                // you might want to handle it gracefully.
                const message = err.response?.data?.message || "Email verification failed.";
                toast.error(message);
            });
    }, [searchParams, navigate]);

    return (
        <Box sx={{ mt: 10, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Verifying your email...
            </Typography>
            <CircularProgress />
        </Box>
    );
}

export default VerifyEmail;