import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Switch,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Link as LinkIcon,
  CopyAll as CopyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import http from '../http';
import { toast } from 'react-toastify';

function FormManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newFormName, setNewFormName] = useState('');
  const [newFormFile, setNewFormFile] = useState('');
  const [newFormSlug, setNewFormSlug] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-generate slug from file path
  useEffect(() => {
    if (newFormFile) {
      let baseName = newFormFile.replace(/\.(yaml|yml)$/i, '');
      const slug = baseName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setNewFormSlug(slug);
    }
  }, [newFormFile]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const res = await http.get('/forms');
      setForms(res.data);
    } catch (err) {
      console.error('Error fetching forms:', err);
      toast.error('Failed to load forms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
    
  }, []);

  const handleToggle = async (id) => {
    try {
      const res = await http.patch(`/forms/${id}/toggle`);
      setForms(forms.map(f => f.id === id ? res.data : f));
      toast.success(`Form ${res.data.isActive ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      toast.error('Failed to toggle form.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this form?')) return;
    try {
      await http.delete(`/forms/${id}`);
      setForms(forms.map(f => f.id === id ? { ...f, isActive: false } : f));
      toast.success('Form deactivated.');
    } catch (err) {
      toast.error('Failed to delete form.');
    }
  };

  const handleCreate = async () => {
    if (!newFormName.trim()) {
      setDialogError('Name is required.');
      return;
    }
    if (!newFormFile.trim()) {
      setDialogError('File path is required.');
      return;
    }
    if (!newFormSlug.trim()) {
      setDialogError('Slug is required (auto-generated from file path).');
      return;
    }

    // Frontend duplicate slug check
    const existing = forms.find(f => f.slug === newFormSlug);
    if (existing) {
      setDialogError(`Slug "${newFormSlug}" is already in use. Please choose another.`);
      return;
    }

    let filePath = newFormFile.trim();
    if (!filePath.endsWith('.yaml') && !filePath.endsWith('.yml')) {
      filePath += '.yaml';
    }

    setSubmitting(true);
    setDialogError('');
    try {
      await http.post('/forms', {
        name: newFormName.trim(),
        slug: newFormSlug.trim().toLowerCase(),
        filePath,
      });
      toast.success('Form created successfully!');
      setOpenDialog(false);
      setNewFormName('');
      setNewFormFile('');
      setNewFormSlug('');
      fetchForms();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create form.';
      setDialogError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (slug) => {
    navigate(`/form/${slug}`);
  };

  const handleCopyUrl = (slug) => {
    const url = `${window.location.origin}/apply/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('URL copied to clipboard!');
    }).catch(() => {
      toast.info(`URL: ${url}`);
    });
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" fontWeight="700" color="#0f172a">
              Form Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create, edit, and manage all dynamic forms used in the system.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchForms}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{ backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' } }}
            >
              New Form
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Slug (Public URL)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>File Path</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Version</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Active</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" sx={{ mt: 1, color: '#64748b' }}>
                      Loading forms...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : forms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#64748b' }}>
                    No forms found. Click "New Form" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                forms.map((form) => (
                  <TableRow key={form.id} hover>
                    <TableCell>{form.id}</TableCell>
                    <TableCell>
                      <Typography fontWeight="500">{form.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={form.slug || 'N/A'}
                          size="small"
                          variant="outlined"
                        />
                        {form.slug && (
                          <Tooltip title="Copy public URL">
                            <IconButton
                              size="small"
                              onClick={() => handleCopyUrl(form.slug)}
                              sx={{ color: '#64748b' }}
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={form.filePath} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>v{form.version}</TableCell>
                    <TableCell>
                      <Chip
                        label={form.isActive ? 'Active' : 'Inactive'}
                        color={form.isActive ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={form.isActive}
                        onChange={() => handleToggle(form.id)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Edit Form">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(form.slug)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Deactivate Form">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(form.id)}
                            disabled={!form.isActive}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {form.slug && (
                          <Tooltip title="View Public URL">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => window.open(`/apply/${form.slug}`, '_blank')}
                            >
                              <LinkIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="700">Create New Form</Typography>
        </DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Form Name"
            fullWidth
            value={newFormName}
            onChange={(e) => setNewFormName(e.target.value)}
            placeholder="e.g., Course Accreditation 2025"
            disabled={submitting}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="File Path (YAML)"
            fullWidth
            value={newFormFile}
            onChange={(e) => setNewFormFile(e.target.value)}
            placeholder="e.g., accreditation_2025.yaml"
            helperText="The YAML file will be created in /data/forms/"
            disabled={submitting}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Slug (Public URL endpoint)"
            fullWidth
            value={newFormSlug}
            onChange={(e) => setNewFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="auto-generated from file name"
            helperText="Used for public URLs: /apply/{slug}"
            disabled={submitting}
            InputProps={{
              startAdornment: (
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  /apply/
                </Typography>
              ),
            }}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption" display="block">
              <strong>Public URL:</strong> {newFormSlug ? `${window.location.origin}/apply/${newFormSlug}` : '(enter a slug above)'}
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={submitting}
            startIcon={submitting && <CircularProgress size={16} />}
          >
            {submitting ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FormManagement;