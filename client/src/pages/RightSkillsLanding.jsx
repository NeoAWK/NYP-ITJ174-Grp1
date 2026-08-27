import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { Business, WorkspacePremium, DashboardCustomize, School, Group } from '@mui/icons-material';
import UserContext from '../contexts/UserContext';
import http from '../http';

function getLatestExperience(profile) {
    if (!profile) {
        return null;
    }

    try {
        const entries = profile.experienceEntries ? JSON.parse(profile.experienceEntries) : [];
        return [...entries].sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0] || null;
    } catch {
        return null;
    }
}

function getExperienceEntries(profile) {
    if (!profile) return [];
    try {
        if (profile.experienceEntries) {
            return JSON.parse(profile.experienceEntries);
        }
    } catch {
        return [];
    }

    if (!profile.experience) return [];
    const legacyEntries = profile.experience.split(/(?=(?:Technical Skills|Digital Skills|Workplace Skills|Leadership and Management|Health and Safety|Other)\s-\s)/g);
    return legacyEntries.filter(Boolean).map((description, index) => ({
        id: `legacy-experience-${index}`,
        fieldOfExpertise: '',
        jobTitle: '',
        organization: '',
        description: description.trim()
    }));
}

function RightSkillsLanding() {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [trainerProfile, setTrainerProfile] = useState(null);

    useEffect(() => {
        if (!user || user.usertype !== 'Trainer') {
            setTrainerProfile(null);
            return;
        }

        http.get('/user/ecosystem-profile')
            .then((response) => setTrainerProfile(response.data.details || {}))
            .catch(() => setTrainerProfile(null));
    }, [user]);

    if (!user) {
        return (
            <Box sx={{ textAlign: 'center', mt: 8 }}>
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

            {/* Trainer Profile Highlights Card */}
            {user.usertype === 'Trainer' && (
                <Card sx={{ mb: 5, borderTop: '4px solid', borderColor: 'warning.main' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                            <Box>
                                <Typography variant="overline" color="text.secondary">Complete Trainer Profile</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>{user.name}</Typography>
                                <Typography color="text.secondary">{user.email}</Typography>
                            </Box>
                            <CardActionArea 
                                onClick={() => navigate('/trainer-profile-overview')} 
                                sx={{ width: 'auto', px: 2, py: 1, border: '1px solid', borderColor: 'warning.main', borderRadius: 1 }}
                            >
                                <Typography color="warning.dark" fontWeight="700">Open Profile</Typography>
                            </CardActionArea>
                        </Box>

                        <Grid container spacing={2}>
                            {[
                                ['Qualifications', trainerProfile?.qualifications],
                                ['Certification', trainerProfile?.certification],
                                ['Professional Development', trainerProfile?.professionalDevelopment],
                                ['Certification Validity', trainerProfile?.certificationValidity]
                            ].map(([label, value]) => (
                                <Grid item xs={12} sm={6} key={label}>
                                    <Typography variant="subtitle2">{label}</Typography>
                                    <Typography color="text.secondary">{value || 'Not provided'}</Typography>
                                </Grid>
                            ))}
                        </Grid>

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2">Experience</Typography>
                            {getExperienceEntries(trainerProfile).length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5 }}>
                                    {getExperienceEntries(trainerProfile).map((entry) => (
                                        <Box key={entry.id} sx={{ pl: 1.5, borderLeft: '3px solid', borderColor: 'warning.main' }}>
                                            <Typography color="text.secondary">
                                                {entry.jobTitle && entry.organization
                                                    ? `${entry.fieldOfExpertise || 'Other'} - ${entry.jobTitle} at ${entry.organization}`
                                                    : entry.description}
                                            </Typography>
                                            {entry.jobTitle && entry.organization && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {entry.description}
                                                </Typography>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Typography color="text.secondary">{trainerProfile?.experience || 'Not provided'}</Typography>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Hub Navigation Grid */}
            <Grid container spacing={4} justifyContent="center">
                {user.usertype === 'Trainer' ? (
                    <>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card sx={{ textAlign: 'center', boxShadow: 3 }}>
                                <CardActionArea onClick={() => navigate('/trainer-profile-overview')}>
                                    <CardContent sx={{ py: 5 }}>
                                        <WorkspacePremium sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
                                        <Typography variant="h6" fontWeight="bold">
                                            Trainer Profile
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <Card sx={{ textAlign: 'center', boxShadow: 3 }}>
                                <CardActionArea onClick={() => navigate('/trainer-dashboard')}>
                                    <CardContent sx={{ py: 5 }}>
                                        <DashboardCustomize sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
                                        <Typography variant="h6" fontWeight="bold">
                                            Trainer Dashboard
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    </>
                ) : (
                    <>
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
                    </>
                )}
            </Grid>
        </Box>
    );
}

export default RightSkillsLanding;