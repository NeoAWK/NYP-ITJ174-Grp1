import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Container, Box, Typography, Card, 
    Button, Chip, CircularProgress, Alert, Paper, 
    Accordion, AccordionSummary, AccordionDetails, Divider, Snackbar, Stack
} from '@mui/material';
import { ArrowBack, ExpandMore, AccessTime, School, HowToReg, CheckCircle, AccountBalanceWallet } from '@mui/icons-material';
import http from '../http';

function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Enrollment State
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    useEffect(() => {
        fetchCourseDetail();
        checkEnrollmentStatus();
    }, [id]);

    const fetchCourseDetail = () => {
        setLoading(true);
        http.get(`/courses/${id}/details`)
            .then((res) => {
                setCourse(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load course details:", err);
                setError(err.response?.data?.error || 'Failed to load course details.');
                setLoading(false);
            });
    };

    const checkEnrollmentStatus = () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        http.get('/enrollment/my-courses')
            .then((res) => {
                const rawIds = res.data.enrolledCourseIds || res.data.enrollments || [];
                
                // Extract clean IDs safely regardless of backend output structure
                const enrolledIds = rawIds.map((item) => {
                    if (typeof item === 'object' && item !== null) {
                        return String(item.courseId || item.CourseID || item.id);
                    }
                    return String(item);
                });

                const targetId = String(id);
                if (enrolledIds.includes(targetId)) {
                    setIsEnrolled(true);
                }
            })
            .catch((err) => {
                console.log("Could not fetch user enrollment status:", err);
            });
    };

    const handleEnroll = () => {
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
            setSnackbar({
                open: true,
                message: "Please log in to enrol in courses.",
                severity: "warning",
            });
            setTimeout(() => navigate("/login"), 1500);
            return;
        }

        const targetCourseId = String(course?.CourseID || course?.id || id);
        setEnrolling(true);

        http.post('/enrollment/enroll', { courseId: targetCourseId })
            .then((res) => {
                setEnrolling(false);
                setIsEnrolled(true);
                setSnackbar({
                    open: true,
                    message: res.data.message || "Successfully enrolled!",
                    severity: "success",
                });
            })
            .catch((err) => {
                setEnrolling(false);
                const errMsg = err.response?.data?.error || "Failed to enroll. Please try again.";
                setSnackbar({
                    open: true,
                    message: errMsg,
                    severity: "error",
                });
            });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !course) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error || 'Course not found.'}</Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/available-courses')} sx={{ mt: 2 }}>
                    Back to Available Courses
                </Button>
            </Container>
        );
    }

    const modules = course.modules || course.Modules || [];
    const totalHours = modules.reduce((sum, m) => sum + (m.EstimatedHours || 0), 0);
    const numericFee = Number(course.CourseFee || course.fee || 0);

    // Funding Support logic based on $500 threshold
    const isFullySupported = numericFee <= 500;
    const outOfPocket = isFullySupported ? 0 : numericFee - 500;

    return (
        <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: 6, px: { xs: 2, sm: 3 } }}>
            <Button 
                startIcon={<ArrowBack />} 
                onClick={() => navigate('/available-courses')} 
                sx={{ mb: 2 }}
            >
                Back to Available Courses
            </Button>

            {/* Course Header Info */}
            <Paper elevation={3} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 2, mb: 4 }}>
                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' }, 
                        justifyContent: 'space-between', 
                        alignItems: { xs: 'stretch', sm: 'flex-start' }, 
                        gap: 3 
                    }}
                >
                    <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                            <Chip label={course.Category || 'General'} color="primary" variant="outlined" size="small" />
                            <Chip label={`Level: ${course.CourseLevel || 'Foundation'}`} color="secondary" variant="outlined" size="small" />
                            <Chip 
                                icon={<AccountBalanceWallet style={{ fontSize: 16 }} />}
                                label={isFullySupported ? "Fully Supported" : "Partially Supported"}
                                size="small"
                                color={isFullySupported ? "success" : "warning"}
                                sx={{ fontWeight: "bold" }}
                            />
                        </Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                            {course.CourseTitle}
                        </Typography>
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                                display: 'flex', 
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'flex-start', sm: 'center' }, 
                                gap: { xs: 0.5, sm: 2 }, 
                                mt: 1 
                            }}
                        >
                            <span><strong>Duration:</strong> {course.Duration || 'N/A'}</span>
                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>•</Box>
                            <span><strong>Modules:</strong> {modules.length} ({totalHours} hrs total)</span>
                        </Typography>
                    </Box>

                    {/* Price & Action Container */}
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            flexDirection: { xs: 'row', sm: 'column' }, 
                            justifyContent: { xs: 'space-between', sm: 'flex-start' }, 
                            alignItems: { xs: 'center', sm: 'flex-end' },
                            pt: { xs: 2, sm: 0 },
                            borderTop: { xs: '1px solid #e2e8f0', sm: 'none' }
                        }}
                    >
                        <Typography 
                            variant="h4" 
                            fontWeight="bold" 
                            color="primary.main" 
                            sx={{ mb: { xs: 0, sm: 0.5 }, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
                        >
                            ${numericFee.toFixed(2)}
                        </Typography>

                        {/* Financial Breakdown Note */}
                        <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ mb: { xs: 0, sm: 1.5 }, textAlign: { xs: 'left', sm: 'right' }, display: 'block' }}
                        >
                            {isFullySupported ? (
                                <span style={{ color: "#2e7d32", fontWeight: 600 }}>
                                    100% covered by $500 Credited Funds
                                </span>
                            ) : (
                                <span style={{ color: "#ed6c02", fontWeight: 600 }}>
                                    Covers $500.00 • ${outOfPocket.toFixed(2)} out-of-pocket
                                </span>
                            )}
                        </Typography>

                        {isEnrolled ? (
                            <Button 
                                variant="contained" 
                                color="success" 
                                size="large"
                                startIcon={<CheckCircle />}
                                onClick={() => navigate('/my-courses')}
                                sx={{ 
                                    width: { xs: 'auto', sm: '100%' },
                                    minWidth: { xs: '150px', sm: '180px' },
                                    py: { xs: 1, sm: 1.2 }
                                }}
                            >
                                Enrolled
                            </Button>
                        ) : (
                            <Button 
                                variant="contained" 
                                color="primary" 
                                size="large"
                                startIcon={enrolling ? <CircularProgress size={20} color="inherit" /> : <HowToReg />}
                                onClick={handleEnroll}
                                disabled={enrolling}
                                sx={{ 
                                    width: { xs: 'auto', sm: '100%' },
                                    minWidth: { xs: '140px', sm: '180px' },
                                    py: { xs: 1, sm: 1.2 }
                                }}
                            >
                                {enrolling ? 'Enrolling...' : 'Enrol Now'}
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>

            {/* Modules Section */}
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                Course Modules ({modules.length})
            </Typography>

            {modules.length === 0 ? (
                <Card sx={{ p: 4, textAlign: 'center', backgroundColor: '#f8fafc' }}>
                    <School sx={{ fontSize: 50, color: 'text.secondary', mb: 1 }} />
                    <Typography color="text.secondary">
                        No modules available for this course yet.
                    </Typography>
                </Card>
            ) : (
                modules.map((module, index) => (
                    <Accordion key={module.ModuleID || index} defaultExpanded={index === 0} sx={{ mb: 1.5, boxShadow: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: { xs: 1, sm: 2 }, alignItems: 'center' }}>
                                <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                    Module {module.OrderSequence || index + 1}: {module.ModuleTitle}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 1 }}>
                                    <AccessTime fontSize="inherit" /> {module.EstimatedHours} hrs
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <Divider />
                        <AccordionDetails sx={{ pt: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ whitespace: 'pre-line' }}>
                                {module.ModuleDescription}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                ))
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default CourseDetail;