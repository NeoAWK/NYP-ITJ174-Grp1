import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  School,
  PlayCircleOutline,
  CheckCircle,
  MoreVert,
  DeleteOutline,
  MenuBook,
} from "@mui/icons-material";
import http from "../http";

function MyCourses() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Unenroll menu & dialog state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);

  // Snackbar notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    fetchMyCourses();
  }, []);

const fetchMyCourses = async () => {
  setLoading(true);
  try {
    const res = await http.get("/enrollment/my-courses");
    
    // Safety check: extract array whether payload is res.data, res.data.enrollments, or res.data.enrolledCourseIds
    const data = res.data?.enrollments || res.data?.enrolledCourseIds || res.data;
    
    if (Array.isArray(data)) {
      setEnrollments(data);
    } else {
      console.warn("API response is not an array:", res.data);
      setEnrollments([]);
    }
  } catch (err) {
    console.error("Failed to fetch my courses:", err);
    setError("Failed to load your enrolled courses.");
    setEnrollments([]); // Fallback to empty array on error
  } finally {
    setLoading(false);
  }
};

  const handleMenuOpen = (event, course) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUnenrollConfirm = async () => {
    if (!selectedCourse) return;
    const courseId = selectedCourse.CourseID || selectedCourse.id;

    setUnenrolling(true);
    try {
      await http.delete(`/enrollment/unenroll/${courseId}`);
      setEnrollments((prev) =>
        prev.filter((item) => {
          const cId = item.Course?.CourseID || item.Course?.id || item.courseId;
          return String(cId) !== String(courseId);
        })
      );
      setSnackbar({
        open: true,
        message: "Successfully dropped the course.",
        severity: "success",
      });
    } catch (err) {
      console.error("Unenroll failed:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Failed to drop course.",
        severity: "error",
      });
    } finally {
      setUnenrolling(false);
      setOpenDialog(false);
      handleMenuClose();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 4 }, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
          My Enrolled Courses
        </Typography>
        <Typography color="text.secondary">
          Track your progress and continue learning where you left off.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {enrollments.length === 0 ? (
        <Card sx={{ p: 5, textAlign: "center", backgroundColor: "#f8fafc" }}>
          <School sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven't enrolled in any courses yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigate("/available-courses")}
          >
            Explore Available Courses
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
{enrollments.map((item, index) => {
  // Extract course details checking both nested Course object and top-level fields
  const course = item.Course || item.course || item;
  
  const courseId = course.id || course.CourseID || item.courseId || index;
  const title = course.title || course.CourseTitle || course.name || "Untitled Course";
  const category = course.category || course.Category || "General";
  const level = course.level || course.CourseLevel || "Foundation";
  const modules = course.modules || course.Modules || [];

  const completedModules = item.completedModulesCount || 0;
  const totalModules = modules.length || 1;
  const progressPercentage = Math.min(100, Math.round((completedModules / totalModules) * 100));

  return (
    <Grid item xs={12} sm={6} md={4} key={`course-${courseId}-${index}`}>
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip label={category} size="small" color="primary" variant="outlined" />
              <Chip label={level} size="small" color="secondary" variant="outlined" />
            </Box>
            <IconButton size="small" onClick={(e) => handleMenuOpen(e, course)}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 1 }}>
            {title}
          </Typography>

          <Box sx={{ mt: 3, mb: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary">
                Course Progress
              </Typography>
              <Typography variant="caption" fontWeight="bold" color="primary.main">
                {progressPercentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              color={progressPercentage === 100 ? "success" : "primary"}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </CardContent>

        <Box sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<PlayCircleOutline />}
            onClick={() => navigate(`/available-courses/${courseId}`)}
          >
            Continue Learning
          </Button>
        </Box>
      </Card>
    </Grid>
  );
})}
        </Grid>
      )}

      {/* Options Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            setOpenDialog(true);
            setAnchorEl(null);
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteOutline fontSize="small" sx={{ mr: 1 }} /> Drop Course
        </MenuItem>
      </Menu>

      {/* Unenroll Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Drop Course?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to drop <strong>{selectedCourse?.CourseTitle}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={unenrolling}>
            Cancel
          </Button>
          <Button
            onClick={handleUnenrollConfirm}
            color="error"
            variant="contained"
            disabled={unenrolling}
            startIcon={unenrolling ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {unenrolling ? "Dropping..." : "Yes, Drop Course"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Toast */}
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

export default MyCourses;