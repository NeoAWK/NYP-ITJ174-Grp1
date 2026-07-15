import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { Business, School, Group, WorkspacePremium, DashboardCustomize } from '@mui/icons-material';
import UserContext from '../contexts/UserContext';

function RightSkillsLanding() {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    if (!user) {
        return (
            <Box sx={{ textAlignment: 'center', mt: 8 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Welcome to RightSkills Training Ecosystem Management System
                </Typography>
                <Typography align="center" color="textSecondary">
                    Please Register or Log in to manage ecosystem setups.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 5 }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 4 }}>
                RightSkills Ecosystem Management Hub
            </Typography>
            <Typography variant="subtitle1" align="center" color="textSecondary" sx={{ mb: 5 }}>
                Current Role Profile: <strong>{user.usertype}</strong>
            </Typography>

            <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} sm={4}>
                    <Card sx={{ textAlign: 'center', boxShadow: 3 }}>
                        <CardActionArea onClick={() => navigate('/register-provider')}>
                            <CardContent sx={{ py: 5 }}>
                                <Business sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h6" fontWeight="bold">
                                    Register Training Providers
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card sx={{ textAlign: 'center', boxShadow: 3 }}>
                        <CardActionArea onClick={() => navigate('/register-trainer')}>
                            <CardContent sx={{ py: 5 }}>
                                <School sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                                <Typography variant="h6" fontWeight="bold">
                                    Register Trainers
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card sx={{ textAlign: 'center', boxShadow: 3 }}>
                        <CardActionArea onClick={() => navigate('/register-learner')}>
                            <CardContent sx={{ py: 5 }}>
                                <Group sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                                <Typography variant="h6" fontWeight="bold">
                                    Register Learners
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card sx={{ textAlign: 'center', boxShadow: 3 }}>
                        <CardActionArea onClick={() => navigate('/lecturer-profile')}>
                            <CardContent sx={{ py: 5 }}>
                                <WorkspacePremium sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
                                <Typography variant="h6" fontWeight="bold">
                                    External Lecturer Profile Editor
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card sx={{ textAlign: 'center', boxShadow: 3 }}>
                        <CardActionArea onClick={() => navigate('/lecturer-dashboard')}>
                            <CardContent sx={{ py: 5 }}>
                                <DashboardCustomize sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
                                <Typography variant="h6" fontWeight="bold">
                                    Full-time Lecturer Dashboard
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default RightSkillsLanding;
