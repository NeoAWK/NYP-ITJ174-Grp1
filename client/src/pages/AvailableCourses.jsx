import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { School, HowToReg, Visibility, CheckCircle } from "@mui/icons-material";
import http from "../http";

function AvailableCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [enrollingId, setEnrollingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    fetchAvailableCoursesAndStatus();
  }, []);

  const fetchAvailableCoursesAndStatus = async () => {
    setLoading(true);
    try {
      // 1. Fetch available courses
      const coursesRes = await http.get("/courses/available");
      const fetchedCourses = coursesRes.data.courses || coursesRes.data || [];
      setCourses(fetchedCourses);

      // 2. Fetch user's existing enrollments
      if (localStorage.getItem("accessToken")) {
        try {
          const enrollRes = await http.get("/enrollment/my-courses");
          const rawIds = enrollRes.data.enrolledCourseIds || enrollRes.data.enrollments || [];
          
          // Normalize IDs safely regardless of backend shape (Objects vs primitives)
          const cleanIds = rawIds.map((item) => {
            if (typeof item === "object" && item !== null) {
              return String(item.courseId || item.CourseID || item.id);
            }
            return String(item);
          });

          setEnrolledCourseIds(cleanIds);
        } catch (err) {
          console.log("Could not load user enrollment status:", err);
        }
      }
    } catch (err) {
      console.error("Failed to load available courses:", err);
      setError("Failed to load available courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = (courseId) => {
    const cleanId = String(courseId);
    setEnrollingId(cleanId);
    
    http
      .post("/enrollment/enroll", { courseId: cleanId })
      .then((res) => {
        setEnrollingId(null);
        // Add ID to enrolled state and eliminate duplicates
        setEnrolledCourseIds((prev) => Array.from(new Set([...prev, cleanId])));
        setSnackbar({
          open: true,
          message: res.data.message || "Enrolled successfully!",
          severity: "success",
        });
      })
      .catch((err) => {
        setEnrollingId(null);
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Available Courses
        </Typography>
        <Typography color="text.secondary">
          Explore active courses and start expanding your skills.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {courses.length === 0 ? (
        <Card sx={{ p: 5, textAlign: "center", backgroundColor: "#f8fafc" }}>
          <School sx={{ fontSize: 60, color: "text.secondary", mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            No available courses at this time.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => {
            // Flexible property fallback to handle casing differences
            const courseId = String(course.CourseID || course.id || course.courseId);
            const title = course.CourseTitle || course.title || "Untitled Course";
            const category = course.Category || course.category || "General";
            const duration = course.Duration || course.duration || "N/A";
            const level = course.CourseLevel || course.level || "Foundation";
            const fee = course.CourseFee ?? course.fee ?? 0;

            const isThisEnrolling = enrollingId === courseId;
            const isAlreadyEnrolled = enrolledCourseIds.includes(courseId);

            return (
              <Grid item xs={12} sm={6} md={4} key={courseId}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: 3,
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1.5,
                      }}
                    >
                      <Chip label={category} size="small" color="primary" variant="outlined" />
                      <Typography variant="caption" color="text.secondary">
                        {duration}
                      </Typography>
                    </Box>

                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      Level: <strong>{level}</strong>
                    </Typography>

                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      ${Number(fee).toFixed(2)}
                    </Typography>
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/available-courses/${courseId}`)}
                    >
                      View Details & Modules
                    </Button>

                    {isAlreadyEnrolled ? (
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => navigate("/my-courses")}
                      >
                        Enrolled
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        startIcon={isThisEnrolling ? <CircularProgress size={20} color="inherit" /> : <HowToReg />}
                        onClick={() => handleEnroll(courseId)}
                        disabled={isThisEnrolling}
                      >
                        {isThisEnrolling ? "Enrolling..." : "Enrol"}
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
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

export default AvailableCourses;