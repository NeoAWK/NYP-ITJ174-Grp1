import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  CircularProgress,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  CheckCircleOutline as ApproveIcon,
  HighlightOff as RejectIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  GetApp as ExportIcon,
  Undo as UndoIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import EditCourseModal from './components/EditCourseModal';
import { useNavigate  } from 'react-router-dom';
const API_BASE_URL = 'http://localhost:3001';

// Helper: format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Helper: CSV escape
const escapeCsv = (val) => {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// ---- Get user type from token ----
const getUserType = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    // Try nested 'user' object first, then fallback to top-level
    if (payload.user && payload.user.usertype) {
      return payload.user.usertype;
    }
    if (payload.user && payload.user.userType) {
      return payload.user.userType;
    }
    // Fallback: top-level
    return payload.usertype || payload.userType || payload.role || null;
  } catch (err) {
    console.warn('Failed to decode token:', err);
    return null;
  }
};

// ---- Fetch user profile as fallback ----
const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    const data = await res.json();
    return data.usertype || data.userType || null;
  } catch (err) {
    console.warn('Profile fetch failed:', err);
    return null;
  }
};

const CourseManagement = () => {
  // ---- State ----
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState(null);
  const [userTypeLoading, setUserTypeLoading] = useState(true);

  // Filter/Sort/Search
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [anchorEl, setAnchorEl] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isAppeal, setIsAppeal] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingCourse, setRejectingCourse] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState(false);

  // ---- Get user type on mount ----
  useEffect(() => {
    const type = getUserType();
    if (type) {
      setUserType(type);
      setUserTypeLoading(false);
    } else {
      fetchUserProfile()
        .then(t => {
          setUserType(t);
          setUserTypeLoading(false);
        })
        .catch(() => setUserTypeLoading(false));
    }
  }, []);

  // ---- Fetch courses ----
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/courses`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      const normalized = data.map((item) => ({
        id: item.id || item.CourseID || 'N/A',
        rawId: item.rawId || item.id,
        title: item.title || item.CourseTitle || 'Untitled',
        level: item.level || item.CourseLevel || 'Foundation',
        category: item.category || item.Category || 'General',
        duration: item.duration || item.Duration || 'N/A',
        submitted: item.submitted || formatDate(item.createdAt),
        fee: Number(item.fee ?? item.CourseFee ?? 0),
        status: item.status || 'Pending Review',
        trainerName: item.TrainerName || 'Freelance',
        providerName: item.ProviderName || 'Unassigned',
        TrainerId: item.TrainerId,
        ProviderId: item.ProviderId,
      }));
      setCourses(normalized);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // ---- Debounced search ----
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const debounceTimer = useRef(null);
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);

  // ---- Computed counts ----
  const pendingCount = useMemo(() => courses.filter(c => c.status === 'Pending Review').length, [courses]);
  const approvedCount = useMemo(() => courses.filter(c => c.status === 'Approved').length, [courses]);
  const rejectedCount = useMemo(() => courses.filter(c => c.status === 'Rejected').length, [courses]);

  // ---- Filtered & sorted ----
  const filteredCourses = useMemo(() => {
    let result = courses.filter(c => {
      const matchesTab =
        activeTab === 'All' ||
        (activeTab === 'Pending' && c.status === 'Pending Review') ||
        (activeTab === 'Approved' && c.status === 'Approved') ||
        (activeTab === 'Rejected' && c.status === 'Rejected');

      const searchLower = debouncedSearch.toLowerCase().trim();
      const matchesSearch = !searchLower ||
        (c.id || '').toLowerCase().includes(searchLower) ||
        (c.title || '').toLowerCase().includes(searchLower) ||
        (c.trainerName || '').toLowerCase().includes(searchLower) ||
        (c.providerName || '').toLowerCase().includes(searchLower) ||
        (c.category || '').toLowerCase().includes(searchLower);

      return matchesTab && matchesSearch;
    });

    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.submitted) - new Date(a.submitted));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.submitted) - new Date(b.submitted));
        break;
      case 'fee-low-high':
        result.sort((a, b) => a.fee - b.fee);
        break;
      case 'fee-high-low':
        result.sort((a, b) => b.fee - a.fee);
        break;
      case 'title-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }
    return result;
  }, [courses, activeTab, debouncedSearch, sortOption]);

  // ---- Pagination ----
  const paginatedCourses = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredCourses.slice(start, start + rowsPerPage);
  }, [filteredCourses, page, rowsPerPage]);

  // ---- Handlers ----
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenFilterMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseFilterMenu = () => setAnchorEl(null);
  const handleSelectSort = (option) => {
    setSortOption(option);
    handleCloseFilterMenu();
  };

  // Edit / Appeal
  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setIsAppeal(false);
    setEditModalOpen(true);
  };

  const handleOpenAppeal = (course) => {
    setEditingCourse(course);
    setIsAppeal(true);
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setEditingCourse(null);
    setIsAppeal(false);
  };
const navigate = useNavigate();
  // Approve
  const handleApprove = async (course) => {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${course.rawId || course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' }),
      });
      if (!res.ok) throw new Error('Approval failed');
      await fetchCourses();
    } catch (err) {
      console.error('Approve error:', err);
      alert('Failed to approve course.');
    }
  };

  // Reject
  const handleOpenReject = (course) => {
    setRejectingCourse(course);
    setRejectionReason('');
    setRejectError(false);
    setRejectModalOpen(true);
  };

  const handleCloseReject = () => {
    setRejectModalOpen(false);
    setRejectingCourse(null);
    setRejectionReason('');
    setRejectError(false);
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      setRejectError(true);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${rejectingCourse.rawId || rejectingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected', rejectionReason: rejectionReason.trim() }),
      });
      if (!res.ok) throw new Error('Rejection failed');
      await fetchCourses();
      handleCloseReject();
    } catch (err) {
      console.error('Reject error:', err);
      alert('Failed to reject course.');
    }
  };

  // ---- Export CSV ----
  const exportCSV = () => {
    const dataToExport = filteredCourses;
    if (dataToExport.length === 0) {
      alert('No data to export.');
      return;
    }
    const headers = ['ID', 'Title', 'Level', 'Category', 'Duration', 'Submitted', 'Fee', 'Status', 'Trainer', 'Provider'];
    const rows = dataToExport.map(c => [
      c.id, c.title, c.level, c.category, c.duration, c.submitted, c.fee, c.status, c.trainerName, c.providerName
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `courses_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // ---- Determine role ----
  const isAdmin = userType === 'RightSkills';
  const isProvider = userType === 'TrainingProvider';

  // For debugging (remove in production)
  
  console.log('User type:', userType, 'Admin:', isAdmin, 'Provider:', isProvider);

  // ---- Render ----
  return (
    <Box sx={{ pb: 4, flexGrow: 1 }}>
      <Typography variant="h4" component="h1" fontWeight="700" sx={{ mb: 3, color: '#0f172a' }}>
        Course Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Toolbar */}
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden', mb: 3 }}>
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, backgroundColor: '#f1f5f9', p: 0.5, borderRadius: 2, flexWrap: 'wrap' }}>
            {[
              { label: 'All', count: courses.length },
              { label: 'Pending', count: pendingCount },
              { label: 'Approved', count: approvedCount },
              { label: 'Rejected', count: rejectedCount }
            ].map((tab) => (
              <Button
                key={tab.label}
                onClick={() => { setActiveTab(tab.label); setPage(0); }}
                disableElevation
                aria-pressed={activeTab === tab.label}
                sx={{
                  borderRadius: 1.5,
                  px: 2,
                  py: 0.5,
                  textTransform: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  color: activeTab === tab.label ? '#0f172a' : '#64748b',
                  backgroundColor: activeTab === tab.label ? '#ffffff' : 'transparent',
                }}
              >
                {tab.label} <Typography component="span" sx={{ ml: 0.8, fontSize: 13, color: activeTab === tab.label ? '#4f46e5' : '#94a3b8' }}>{tab.count}</Typography>
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search courses by ID, title, trainer, or provider"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')} aria-label="Clear search">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: { xs: '100%', sm: 220 } }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleOpenFilterMenu}
              aria-controls="sort-menu"
              aria-haspopup="true"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Sort
            </Button>
            <Button
              variant="outlined"
              startIcon={<BarChartIcon />}   // or AnalyticsIcon, TimelineIcon, etc.
              onClick={() => navigate('/graph')}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Graph
            </Button>
            <Menu
              id="sort-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseFilterMenu}
              PaperProps={{ elevation: 3, sx: { borderRadius: 2, mt: 1, minWidth: 200 } }}
            >
              <MenuItem selected={sortOption === 'newest'} onClick={() => handleSelectSort('newest')}>Newest to Oldest</MenuItem>
              <MenuItem selected={sortOption === 'oldest'} onClick={() => handleSelectSort('oldest')}>Oldest to Newest</MenuItem>
              <MenuItem selected={sortOption === 'fee-low-high'} onClick={() => handleSelectSort('fee-low-high')}>Fee: Low to High</MenuItem>
              <MenuItem selected={sortOption === 'fee-high-low'} onClick={() => handleSelectSort('fee-high-low')}>Fee: High to Low</MenuItem>
              <MenuItem selected={sortOption === 'title-asc'} onClick={() => handleSelectSort('title-asc')}>Title: A to Z</MenuItem>
              <MenuItem selected={sortOption === 'title-desc'} onClick={() => handleSelectSort('title-desc')}>Title: Z to A</MenuItem>
            </Menu>
            <Tooltip title="Export filtered data as CSV">
              <Button variant="outlined" startIcon={<ExportIcon />} onClick={exportCSV} sx={{ textTransform: 'none', fontWeight: 600 }}>
                Export
              </Button>
            </Tooltip>
            <Tooltip title="Refresh list">
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchCourses} sx={{ textTransform: 'none', fontWeight: 600 }}>
                Refresh
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table aria-label="Course submissions table">
            <TableHead sx={{ backgroundColor: '#fafafa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Trainer</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Provider</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Submitted</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Fee</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#64748b' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading || userTypeLoading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} aria-label="Loading" />
                  </TableCell>
                </TableRow>
              ) : paginatedCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4, color: '#64748b' }}>
                    No courses found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCourses.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>{row.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600" color="#0f172a">{row.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.level}</Typography>
                    </TableCell>
                    <TableCell>{row.trainerName}</TableCell>
                    <TableCell>{row.providerName}</TableCell>
                    <TableCell><Chip label={row.category} size="small" sx={{ backgroundColor: '#f1f5f9', fontWeight: 600, fontSize: 11 }} /></TableCell>
                    <TableCell>{row.duration}</TableCell>
                    <TableCell>{row.submitted}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>${row.fee.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={row.status === 'Approved' ? 'success' : row.status === 'Rejected' ? 'error' : 'warning'}
                        aria-label={`Status: ${row.status}`}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {isAdmin && row.status === 'Pending Review' && (
                          <>
                            <Tooltip title="Approve course">
                              <Button
                                variant="outlined"
                                size="small"
                                color="success"
                                startIcon={<ApproveIcon />}
                                onClick={() => handleApprove(row)}
                              >
                                Approve
                              </Button>
                            </Tooltip>
                            <Tooltip title="Reject course">
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                startIcon={<RejectIcon />}
                                onClick={() => handleOpenReject(row)}
                              >
                                Reject
                              </Button>
                            </Tooltip>
                          </>
                        )}
                        {isProvider && row.status === 'Pending Review' && (
                          <Tooltip title="Edit course details">
                            <Button
                              variant="outlined"
                              size="small"
                              color="primary"
                              startIcon={<EditIcon />}
                              onClick={() => handleOpenEdit(row)}
                            >
                              Edit
                            </Button>
                          </Tooltip>
                        )}
                        {isProvider && row.status === 'Rejected' && (
                          <>
                            <Tooltip title="Appeal this rejection (requires changes)">
                              <Button
                                variant="outlined"
                                size="small"
                                color="warning"
                                startIcon={<UndoIcon />}
                                onClick={() => handleOpenAppeal(row)}
                              >
                                Appeal
                              </Button>
                            </Tooltip>
                            <Tooltip title="Edit details before appealing">
                              <Button
                                variant="outlined"
                                size="small"
                                color="primary"
                                startIcon={<EditIcon />}
                                onClick={() => handleOpenEdit(row)}
                              >
                                Edit
                              </Button>
                            </Tooltip>
                          </>
                        )}
                        {row.status === 'Approved' && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No actions
                          </Typography>
                        )}
                        {!isAdmin && !isProvider && row.status !== 'Approved' && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No permissions
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredCourses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:"
          aria-label="Course table pagination"
        />
      </Paper>

      {/* ---- Edit/Appeal Modal ---- */}
      {editModalOpen && (
        <EditCourseModal
          open={editModalOpen}
          course={editingCourse}
          onClose={handleCloseEdit}
          onUpdate={fetchCourses}
          isAppeal={isAppeal}
        />
      )}

      {/* ---- Rejection Modal (admin only) ---- */}
      <Dialog
        open={rejectModalOpen}
        onClose={handleCloseReject}
        maxWidth="sm"
        fullWidth
        aria-labelledby="reject-dialog-title"
        aria-describedby="reject-dialog-description"
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle id="reject-dialog-title" sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Box sx={{ backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '50%', p: 1, display: 'flex' }}>
              <RejectIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="700" component="span">Reject Course</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {rejectingCourse?.id}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseReject} aria-label="Close reject dialog" sx={{ color: '#94a3b8' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Paper elevation={0} sx={{ backgroundColor: '#eef2ff', p: 2, borderRadius: 2, mb: 2.5 }}>
            <Typography variant="caption" color="text.secondary" display="block">Course</Typography>
            <Typography variant="subtitle2" fontWeight="700" color="#1e293b">{rejectingCourse?.title}</Typography>
            <Typography variant="caption" color="text.secondary">{rejectingCourse?.providerName}</Typography>
          </Paper>

          <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
            Reason for rejection <Typography component="span" color="error">*</Typography>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Provide a clear explanation of why this submission is being rejected..."
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              if (e.target.value.trim()) setRejectError(false);
            }}
            error={rejectError}
            helperText={rejectError ? 'A reason is required to reject this submission.' : ''}
            sx={{ backgroundColor: '#f8fafc', borderRadius: 2 }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
          <Button variant="outlined" onClick={handleCloseReject} sx={{ textTransform: 'none', borderRadius: 2, px: 2.5 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<RejectIcon />}
            onClick={handleConfirmReject}
            sx={{ textTransform: 'none', borderRadius: 2, px: 2.5, fontWeight: '600' }}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseManagement;