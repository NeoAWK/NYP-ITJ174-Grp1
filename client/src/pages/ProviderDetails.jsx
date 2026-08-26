import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Chip, Grid, Divider, CircularProgress } from '@mui/material';
import http from '../http';

function ProviderDetails() {
    const location = useLocation();
    const [details, setDetails] = useState(location.state?.providerData || null);
    const [loading, setLoading] = useState(!details);

    useEffect(() => {
        if (!details) {
            http.get("/user/ecosystem-profile").then((res) => {
                if (res.data.profiles?.trainingProvider) {
                    setDetails(res.data.profiles.trainingProvider);
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
                            Training Provider Registration Details
                        </Typography>
                        <Chip 
                            label={details.status || "Pending Approval"} 
                            color="warning" 
                            sx={{ fontWeight: 'bold', fontSize: '0.9rem' }} 
                        />
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Typography variant="h6" color="primary" gutterBottom>
                        Personal & Company Information
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}><strong>Name:</strong> {details.name}</Grid>
                        <Grid item xs={6}><strong>Email Address:</strong> {details.emailAddress}</Grid>
                        <Grid item xs={6}><strong>Mobile No:</strong> {details.mobileNo}</Grid>
                        <Grid item xs={6}><strong>UEN Number:</strong> {details.companyRegistrationId}</Grid>
                        <Grid item xs={6}><strong>Company Website:</strong> {details.companyWebsite}</Grid>
                        <Grid item xs={6}><strong>Postal Code:</strong> {details.postalCode}</Grid>
                        <Grid item xs={12}><strong>Company Address:</strong> {details.companyAddress}</Grid>
                    </Grid>

                    <Divider sx={{ mb: 3 }} />

                    <Typography variant="h6" color="primary" gutterBottom>
                        Accreditation Details
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <strong>Main Field of Training:</strong> {details.mainFieldOfTraining}
                        </Grid>
                        <Grid item xs={12}>
                            <strong>Proof of Certification:</strong> {details.proofOfCertification || 'Attached'}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
}

export default ProviderDetails;
