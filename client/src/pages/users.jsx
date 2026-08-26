import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Menu,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as GetAppIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import * as yup from 'yup';

// ------------------------------
// API Base URL & Fallback Data
// ------------------------------
const API_BASE_URL = 'http://localhost:3001';

// Fallback user data (from your SQL dump)
const fallbackUsers = [
  { id: 2000, name: 'Admin Account', email: 'admin123@abc.com', usertype: 'RightSkills', mobileNo: null, isVerified: 1 },
  { id: 2001, name: 'Test Trainer', email: 'test.trainer@rightskills.local', usertype: 'Trainer', mobileNo: null, isVerified: 1 },
  { id: 2002, name: 'Test Provider', email: 'provider@test.com', usertype: 'TrainingProvider', mobileNo: null, isVerified: 1 },
  { id: 2003, name: 'New Provider', email: 'new.provider@rightskills.local', usertype: 'TrainingProvider', mobileNo: null, isVerified: 1 },
  { id: 2004, name: 'Trainer One', email: 'trainer.one@rightskills.local', usertype: 'Trainer', mobileNo: null, isVerified: 1 },
  { id: 2005, name: 'Trainer Two', email: 'trainer.two@rightskills.local', usertype: 'Trainer', mobileNo: null, isVerified: 1 },
];

// ------------------------------
// Main Component
// ------------------------------
function UsersPage() {
  // ---- State ----
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, sort, pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Sort menu anchor
  const [sortAnchorEl, setSortAnchorEl] = useState(null);

  // Ref for initial focus (accessibility)
  const searchInputRef = useRef(null);

  // ---- Fetch users ----
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      // If your backend has a GET /users endpoint, use it; otherwise fallback
      const res = await fetch(`${API_BASE_URL}/user`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.warn('Using fallback users:', err);
      setUsers(fallbackUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Focus search on mount (accessibility)
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // ---- Filtering & Sorting ----
  const filteredUsers = useMemo(() => {
    let result = users;
    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(u =>
        (u.name || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term) ||
        (u.id && u.id.toString().includes(term))
      );
    }
    // Sort
    if (sortOption === 'newest') {
      result = [...result].sort((a, b) => b.id - a.id);
    } else if (sortOption === 'oldest') {
      result = [...result].sort((a, b) => a.id - b.id);
    } else if (sortOption === 'name-asc') {
      result = [...result].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortOption === 'name-desc') {
      result = [...result].sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    }
    return result;
  }, [users, searchTerm, sortOption]);

  // ---- Pagination ----
  const paginatedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  // ---- Handlers for pagination ----
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ---- Handlers for search/sort ----
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0); // reset to first page
  };
  const clearSearch = () => {
    setSearchTerm('');
    if (searchInputRef.current) searchInputRef.current.focus();
  };
  const handleSortMenuOpen = (e) => setSortAnchorEl(e.currentTarget);
  const handleSortMenuClose = () => setSortAnchorEl(null);
  const handleSelectSort = (option) => {
    setSortOption(option);
    setSortAnchorEl(null);
    setPage(0);
  };

  // ---- CSV Export ----
  const exportToCSV = () => {
    if (filteredUsers.length === 0) {
      setSnackbar({ open: true, message: 'No users to export', severity: 'warning' });
      return;
    }
    const headers = ['ID', 'Name', 'Email', 'User Type', 'Mobile', 'Verified'];
    const rows = filteredUsers.map(u => [
      u.id,
      u.name || '',
      u.email || '',
      u.usertype || '',
      u.mobileNo || '',
      u.isVerified ? 'Yes' : 'No',
    ]);
    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'users_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ---- Edit modal ----
  const handleEditOpen = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      usertype: user.usertype || 'Learner',
      mobileNo: user.mobileNo || '',
      isVerified: user.isVerified || 0,
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
    setEditFormData({});
    setEditErrors({});
  };

  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    if (editErrors[field]) {
      setEditErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEditSubmit = async () => {
    // Validation
    const schema = yup.object({
      name: yup.string().trim().min(3).max(50).required('Name is required'),
      email: yup.string().trim().email('Invalid email').max(50).required('Email is required'),
      usertype: yup.string().required('User type is required'),
      mobileNo: yup.string().nullable().matches(/^[0-9]*$/, 'Only numbers allowed').min(8).max(15),
      isVerified: yup.boolean(),
    });
    try {
      await schema.validate(editFormData, { abortEarly: false });
      // Prepare payload (match backend expectations)
      const payload = {
        name: editFormData.name,
        email: editFormData.email,
        usertype: editFormData.usertype,
        mobileNo: editFormData.mobileNo || null,
        isVerified: editFormData.isVerified ? 1 : 0,
      };
      // Call update endpoint (adjust endpoint as needed)
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/user/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Update failed');
      }
      // Update local state
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...payload } : u));
      setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      handleEditClose();
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = {};
        err.inner.forEach(e => { errors[e.path] = e.message; });
        setEditErrors(errors);
      } else {
        setSnackbar({ open: true, message: err.message || 'Update error', severity: 'error' });
      }
    }
  };

  // ---- Delete modal ----
  const handleDeleteOpen = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/user/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Delete failed');
      }
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
      handleDeleteClose();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Delete error', severity: 'error' });
    }
  };

  // ---- Snackbar close ----
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  // ---- Render helpers ----
  const renderVerifiedIcon = (isVerified) => {
    return isVerified ? (
      <CheckCircleIcon color="success" fontSize="small" />
    ) : (
      <CancelIcon color="error" fontSize="small" />
    );
  };

  // ---- Table columns definition (for CSV export) ----
  const columns = [
    { label: 'ID', field: 'id' },
    { label: 'Name', field: 'name' },
    { label: 'Email', field: 'email' },
    { label: 'User Type', field: 'usertype' },
    { label: 'Mobile', field: 'mobileNo' },
    { label: 'Verified', field: 'isVerified' },
  ];

  // ---- Main JSX ----
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1400px', mx: 'auto' }}>
      <Typography variant="h4" component="h1" fontWeight="700" sx={{ mb: 3, color: '#0f172a' }}>
        User Management
      </Typography>

      {/* ---- Error display ---- */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ---- Toolbar: Search, Sort, Export ---- */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          border: '1px solid #e2e8f0',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: 1 }}>
          <TextField
            inputRef={searchInputRef}
            size="small"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={clearSearch} aria-label="Clear search">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: '100%', sm: 250 }, flex: 1 }}
            aria-label="Search users"
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleSortMenuOpen}
            aria-controls="sort-menu"
            aria-haspopup="true"
            sx={{ textTransform: 'none' }}
          >
            Sort
          </Button>
          <Menu
            id="sort-menu"
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={handleSortMenuClose}
            MenuListProps={{ 'aria-label': 'Sort options' }}
          >
            <MenuItem selected={sortOption === 'newest'} onClick={() => handleSelectSort('newest')}>
              Newest first
            </MenuItem>
            <MenuItem selected={sortOption === 'oldest'} onClick={() => handleSelectSort('oldest')}>
              Oldest first
            </MenuItem>
            <MenuItem selected={sortOption === 'name-asc'} onClick={() => handleSelectSort('name-asc')}>
              Name (A–Z)
            </MenuItem>
            <MenuItem selected={sortOption === 'name-desc'} onClick={() => handleSelectSort('name-desc')}>
              Name (Z–A)
            </MenuItem>
          </Menu>
        </Box>
        <Button
          variant="outlined"
          startIcon={<GetAppIcon />}
          onClick={exportToCSV}
          aria-label="Export users to CSV"
        >
          Export CSV
        </Button>
      </Paper>

      {/* ---- Users Table ---- */}
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table role="grid" aria-label="Users table" aria-describedby="users-table-caption">
            <caption id="users-table-caption" style={{ position: 'absolute', left: '-9999px' }}>
              List of all registered users with actions to edit or delete.
            </caption>
            <TableHead sx={{ backgroundColor: '#fafafa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>User Type</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Mobile</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Verified</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#64748b' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={40} aria-label="Loading users" />
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#64748b' }}>
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name || '—'}</TableCell>
                    <TableCell>{user.email || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.usertype || 'Learner'}
                        size="small"
                        color={
                          user.usertype === 'RightSkills' ? 'primary' :
                          user.usertype === 'TrainingProvider' ? 'info' :
                          user.usertype === 'Trainer' ? 'secondary' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>{user.mobileNo || '—'}</TableCell>
                    <TableCell>{renderVerifiedIcon(user.isVerified)}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Edit user">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditOpen(user)}
                            aria-label={`Edit user ${user.name || user.email}`}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete user">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteOpen(user)}
                            aria-label={`Delete user ${user.name || user.email}`}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
          // Accessibility
          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' },
          }}
        />
      </Paper>

      {/* ---- Edit User Modal ---- */}
      <Dialog
        open={editModalOpen}
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="edit-user-dialog-title"
        aria-describedby="edit-user-dialog-description"
      >
        <DialogTitle id="edit-user-dialog-title">Edit User</DialogTitle>
        <DialogContent id="edit-user-dialog-description">
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={editFormData.name || ''}
              onChange={(e) => handleEditChange('name', e.target.value)}
              error={!!editErrors.name}
              helperText={editErrors.name}
              margin="dense"
              autoFocus
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editFormData.email || ''}
              onChange={(e) => handleEditChange('email', e.target.value)}
              error={!!editErrors.email}
              helperText={editErrors.email}
              margin="dense"
              required
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="usertype-label">User Type</InputLabel>
              <Select
                labelId="usertype-label"
                value={editFormData.usertype || 'Learner'}
                label="User Type"
                onChange={(e) => handleEditChange('usertype', e.target.value)}
                error={!!editErrors.usertype}
              >
                <MenuItem value="Learner">Learner</MenuItem>
                <MenuItem value="Trainer">Trainer</MenuItem>
                <MenuItem value="TrainingProvider">Training Provider</MenuItem>
                <MenuItem value="RightSkills">RightSkills (Admin)</MenuItem>
              </Select>
              {editErrors.usertype && (
                <Typography variant="caption" color="error">{editErrors.usertype}</Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              label="Mobile Number"
              value={editFormData.mobileNo || ''}
              onChange={(e) => handleEditChange('mobileNo', e.target.value)}
              error={!!editErrors.mobileNo}
              helperText={editErrors.mobileNo}
              margin="dense"
              placeholder="e.g., 91234567"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!editFormData.isVerified}
                  onChange={(e) => handleEditChange('isVerified', e.target.checked)}
                  color="primary"
                />
              }
              label="Verified"
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* ---- Delete Confirmation Dialog ---- */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleDeleteClose}
        aria-labelledby="delete-user-dialog-title"
        aria-describedby="delete-user-dialog-description"
      >
        <DialogTitle id="delete-user-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent id="delete-user-dialog-description">
          <Typography>
            Are you sure you want to delete the user <strong>{userToDelete?.name || userToDelete?.email}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Snackbar for notifications ---- */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={handleSnackbarClose}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UsersPage;