import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Chip, Grid, Divider, CircularProgress } from '@mui/material';
import http from '../http';

function TrainerDetails() {
    const location = useLocation();
    const [details, setDetails] = useState(location.state?.trainerData || null);
    const [loading, setLoading] = useState(!details);

    useEffect(() => {
        if (!details) {
            http.get("/user/ecosystem-profile").then((res) => {
                if (res.data.details) {
                    setDetails(res.data.details);
                }
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [details]);

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 5 }} />;

    if (!details) {
        return (
            <Box sx={{ mt: 5, textAlign: 'center' }}>
                <Typography variant="h6">No registration record found.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 5, mb: 8 }}>
            <Card sx={{ p: 2, boxShadow: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" fontWeight="bold">
                            Trainer Registration Details
                        </Typography>
                        <Chip
                            label={details.status || "Pending Approval"}
                            color="warning"
                            sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                        />
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Typography variant="h6" color="primary" gutterBottom>
                        Trainer Information
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}><strong>Name:</strong> {details.name}</Grid>
                        <Grid item xs={6}><strong>Email Address:</strong> {details.emailAddress}</Grid>
                        <Grid item xs={6}><strong>Mobile No:</strong> {details.mobileNo}</Grid>
                        <Grid item xs={6}><strong>Areas of Expertise:</strong> {details.areasOfExpertise}</Grid>
                    </Grid>

                    <Divider sx={{ mb: 3 }} />

                    <Typography variant="h6" color="primary" gutterBottom>
                        Resume / Experience
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <strong>Attached File:</strong> {details.resumeExperience || 'Not provided'}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
}

export default TrainerDetails;
