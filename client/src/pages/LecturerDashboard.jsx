import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Grid,
    LinearProgress,
    Stack,
    Typography
} from '@mui/material';
import UserContext from '../contexts/UserContext';
import { getCoursesForLecturer } from '../data/lecturerCourses';

function getCourseStatus(progressPercent) {
    if (progressPercent >= 100) {
        return { label: 'Completed', color: 'success' };
    }
    if (progressPercent > 0) {
        return { label: 'Ongoing', color: 'warning' };
    }
    return { label: 'Not Started', color: 'default' };
}

function LecturerDashboard() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    if (!user) {
        return (
            <Box sx={{ mt: 5 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Please log in to access the lecturer dashboard.
                </Alert>
                <Button variant="contained" onClick={() => navigate('/login')}>
                    Go to Login
                </Button>
            </Box>
        );
    }

    const assignedCourses = getCoursesForLecturer(user);

    return (
        <Box sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Full-time Lecturer Dashboard
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
                Dedicated summary view showing assigned courses only. Data is placeholder-based in this prototype.
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                Logged in as: {user.usertype || 'Unknown role'}
            </Alert>

            {assignedCourses.length === 0 && (
                <Alert severity="warning">
                    No assigned courses found for this account role in placeholder mode.
                </Alert>
            )}

            <Grid container spacing={3}>
                {assignedCourses.map((course) => (
                    (() => {
                        const status = getCourseStatus(course.progressPercent);
                        return (
                    <Grid key={course.id} item xs={12} md={6} lg={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="h6">{course.title}</Typography>
                                    <Chip size="small" label={course.code} color="primary" />
                                </Stack>

                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Current Status
                                    </Typography>
                                    <Chip size="small" label={status.label} color={status.color} />
                                </Stack>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Progress: {course.progressPercent}%
                                </Typography>
                                <LinearProgress variant="determinate" value={course.progressPercent} sx={{ height: 8, borderRadius: 4, mb: 2 }} />

                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                    Milestones: {course.milestonesHit} / {course.totalMilestones}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                    Weeks Cleared: {course.weeksCleared} / {course.totalWeeks}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Next Focus: {course.nextFocus}
                                </Typography>
                            </CardContent>

                            <CardActions sx={{ mt: 'auto', px: 2, pb: 2 }}>
                                <Button fullWidth variant="contained" onClick={() => navigate(`/lecturer-dashboard/${course.id}`)}>
                                    View Detailed Breakdown
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                        );
                    })()
                ))}
            </Grid>
        </Box>
    );
}

export default LecturerDashboard;
