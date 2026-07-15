import React, { useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Stack,
    Typography
} from '@mui/material';
import UserContext from '../contexts/UserContext';
import { getCourseById } from '../data/lecturerCourses';

function LecturerCourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    if (!user) {
        return (
            <Box sx={{ mt: 5 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Please log in to access course breakdown details.
                </Alert>
                <Button variant="contained" onClick={() => navigate('/login')}>
                    Go to Login
                </Button>
            </Box>
        );
    }

    const course = getCourseById(id);
    if (!course) {
        return (
            <Box sx={{ mt: 5 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Course not found.
                </Alert>
                <Button variant="contained" onClick={() => navigate('/lecturer-dashboard')}>
                    Back to Dashboard
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 4, mb: 6 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {course.title}
                </Typography>
                <Chip label={course.code} color="primary" />
            </Stack>

            <Typography color="text.secondary" sx={{ mb: 2 }}>
                Placeholder detail page for drill-down acceptance flow.
            </Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Overall Course Progress
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        {course.progressPercent}% complete
                    </Typography>
                    <LinearProgress variant="determinate" value={course.progressPercent} sx={{ height: 9, borderRadius: 4 }} />

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body2">Milestones hit: {course.milestonesHit} / {course.totalMilestones}</Typography>
                    <Typography variant="body2">Weeks cleared: {course.weeksCleared} / {course.totalWeeks}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Next Focus: {course.nextFocus}
                    </Typography>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Syllabus Milestones
                    </Typography>
                    <List>
                        {course.syllabusBreakdown.map((step, index) => (
                            <ListItem key={`${step.label}-${index}`} divider>
                                <ListItemText
                                    primary={step.label}
                                    secondary={step.done ? 'Completed' : 'Pending'}
                                />
                                <Chip
                                    size="small"
                                    color={step.done ? 'success' : 'default'}
                                    label={step.done ? 'Done' : 'Pending'}
                                />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>

            <Button sx={{ mt: 3 }} variant="outlined" onClick={() => navigate('/lecturer-dashboard')}>
                Back to Dashboard
            </Button>
        </Box>
    );
}

export default LecturerCourseDetail;
