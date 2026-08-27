  import React, { useState, useEffect } from 'react';
  import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    CircularProgress,
    Alert,
    IconButton,
    Typography
  } from '@mui/material';
  import CloseIcon from '@mui/icons-material/Close';

  const API_BASE_URL = 'http://localhost:3001';

  function EditCourseModal({ open, course, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
      title: '',
      level: '',
      category: '',
      duration: '',
      fee: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Populate form when course changes
    useEffect(() => {
      if (course) {
        setFormData({
          title: course.title || '',
          level: course.level || '',
          category: course.category || '',
          duration: course.duration || '',
          fee: course.fee !== undefined ? String(course.fee) : '',
        });
      }
      setErrors({});
      setError('');
    }, [course]);

    const handleChange = (field) => (event) => {
      setFormData({ ...formData, [field]: event.target.value });
      // Clear error for this field when user types
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    };

    const validate = () => {
      const newErrors = {};
      if (!formData.title.trim()) newErrors.title = 'Course title is required';
      if (!formData.level.trim()) newErrors.level = 'Level is required';
      if (!formData.category.trim()) newErrors.category = 'Category is required';
      if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
      if (!formData.fee.trim()) {
        newErrors.fee = 'Fee is required';
      } else if (isNaN(Number(formData.fee)) || Number(formData.fee) < 0) {
        newErrors.fee = 'Fee must be a positive number';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
      if (!validate()) return;

      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('accessToken');
        const payload = {
          title: formData.title.trim(),
          level: formData.level.trim(),
          category: formData.category.trim(),
          duration: formData.duration.trim(),
          fee: Number(formData.fee),
        };

        const res = await fetch(`${API_BASE_URL}/courses/${course.rawId || course.id}/edit`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update course');
        }

        // Success: close modal and refresh list
        onUpdate(); // Refresh parent
        onClose();
      } catch (err) {
        console.error('Edit error:', err);
        setError(err.message || 'An error occurred while updating the course.');
      } finally {
        setLoading(false);
      }
    };

    // Handle Enter key on form
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    return (
      <Dialog
        open={open}
        onClose={loading ? undefined : onClose} // prevent closing while loading
        maxWidth="sm"
        fullWidth
        aria-labelledby="edit-course-dialog-title"
        aria-describedby="edit-course-dialog-description"
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        <DialogTitle id="edit-course-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight="700">
              Edit Course
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {course?.id}
            </Typography>
          </Box>
          <IconButton
            aria-label="Close edit dialog"
            onClick={onClose}
            disabled={loading}
            sx={{ color: '#94a3b8' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent id="edit-course-dialog-description" sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" noValidate onKeyDown={handleKeyDown}>
            <TextField
              fullWidth
              margin="normal"
              label="Course Title *"
              value={formData.title}
              onChange={handleChange('title')}
              error={!!errors.title}
              helperText={errors.title}
              disabled={loading}
              required
              autoFocus
              inputProps={{
                'aria-label': 'Course title',
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Level *"
              value={formData.level}
              onChange={handleChange('level')}
              error={!!errors.level}
              helperText={errors.level}
              disabled={loading}
              required
              inputProps={{
                'aria-label': 'Course level',
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Category *"
              value={formData.category}
              onChange={handleChange('category')}
              error={!!errors.category}
              helperText={errors.category}
              disabled={loading}
              required
              inputProps={{
                'aria-label': 'Course category',
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Duration * (e.g., 40 hours)"
              value={formData.duration}
              onChange={handleChange('duration')}
              error={!!errors.duration}
              helperText={errors.duration}
              disabled={loading}
              required
              inputProps={{
                'aria-label': 'Course duration',
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Fee * (USD)"
              type="number"
              value={formData.fee}
              onChange={handleChange('fee')}
              error={!!errors.fee}
              helperText={errors.fee}
              disabled={loading}
              required
              InputProps={{
                inputProps: { min: 0, step: 0.01, 'aria-label': 'Course fee in USD' },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{ textTransform: 'none', borderRadius: 2, px: 2.5 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 2.5,
              fontWeight: 600,
              backgroundColor: '#0f172a',
              '&:hover': { backgroundColor: '#1e293b' },
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  export default EditCourseModal;