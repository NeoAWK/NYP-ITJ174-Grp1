import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Chip, Button, CircularProgress, Grid } from '@mui/material';
import UserContext from '../contexts/UserContext';
import http from '../http';

const roles = [
    {
        key: 'trainingProvider',
        label: 'Training Provider',
        statusLabel: 'Pending Approval',
        statusColor: 'warning',
        detailsRoute: '/provider-details',
        registerRoute: '/register-provider'
    },
    {
        key: 'trainer',
        label: 'Trainer',
        statusLabel: 'Pending Approval',
        statusColor: 'warning',
        detailsRoute: '/trainer-details',
        registerRoute: '/register-trainer'
    },
    {
        key: 'learner',
        label: 'Learner',
        statusLabel: 'Registered',
        statusColor: 'success',
        detailsRoute: '/learner-details',
        registerRoute: '/register-learner'
    }
];

function RegistrationStatus() {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState({});

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        http.get("/user/ecosystem-profile")
            .then((res) => setProfiles(res.data.profiles || {}))
            .catch(() => setProfiles({}))
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 5 }} />;

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 5, mb: 8 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
                My Registration Status
            </Typography>
            <Typography align="center" color="text.secondary" sx={{ mb: 4 }}>
                You can hold registrations under more than one role at the same time.
                Each is tracked independently below.
            </Typography>

            <Grid container spacing={3}>
                {roles.map((role) => {
                    const profile = profiles[role.key];
                    const isRegistered = Boolean(profile && profile.name);

                    return (
                        <Grid item xs={12} key={role.key}>
                            <Card sx={{ boxShadow: 3 }}>
                                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">
                                            {role.label}
                                        </Typography>
                                        {isRegistered ? (
                                            <Chip
                                                label={role.statusLabel}
                                                color={role.statusColor}
                                                size="small"
                                                sx={{ fontWeight: 'bold', mt: 0.5 }}
                                            />
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                Not yet registered
                                            </Typography>
                                        )}
                                    </Box>

                                    <Button
                                        variant="contained"
                                        onClick={() => navigate(isRegistered ? role.detailsRoute : role.registerRoute)}
                                    >
                                        {isRegistered ? 'View Details' : 'Register'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}

export default RegistrationStatus;
