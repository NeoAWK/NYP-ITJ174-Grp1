import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Added useNavigate import
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  CircularProgress
} from '@mui/material';

import EditCourseModal from './components/EditCourseModal';
import { Edit as EditIcon, Undo as UndoIcon, Add as AddIcon } from '@mui/icons-material'; // 2. Added AddIcon
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

const API_BASE_URL = 'http://localhost:3001';

// Fallback data
const initialData = [
  { id: 'RS-2026-001', title: 'Advanced Data Analytics with Python', level: 'Advanced', trainerName: 'John Doe', category: 'Data Science', duration: '40 hours', submitted: '14 Jul 2026', fee: 2500, status: 'Pending Review' },
  { id: 'RS-2026-002', title: 'Workplace Health & Safety Fundamentals', level: 'Foundation', trainerName: 'Jane Smith', category: 'Health & Safety', duration: '16 hours', submitted: '11 Jul 2026', fee: 850, status: 'Pending Review' },
  { id: 'RS-2026-003', title: 'Project Management Professional Prep', level: 'Intermediate', trainerName: 'Bob Johnson', category: 'Management', duration: '60 hours', submitted: '28 Jun 2026', fee: 1800, status: 'Approved' },
  { id: 'RS-2026-004', title: 'Digital Marketing Essentials', level: 'Foundation', trainerName: 'Alice Brown', category: 'Marketing', duration: '24 hours', submitted: '20 Jun 2026', fee: 1200, status: 'Rejected' },
  { id: 'RS-2026-005', title: 'Leadership in Agile Environments', level: 'Intermediate', trainerName: 'Charlie Davis', category: 'Leadership', duration: '32 hours', submitted: '9 Jul 2026', fee: 1450, status: 'Pending Review' },
];

function ProviderDashboard() {
  const navigate = useNavigate(); // 3. Initialize hook
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [anchorEl, setAnchorEl] = useState(null);
  const [sortOption, setSortOption] = useState('newest');

  const [trainers, setTrainers] = useState([]);
  const [loadingTrainers, setLoadingTrainers] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isAppeal, setIsAppeal] = useState(false);

  // ---- Fetch courses ----
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/courses`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();

      if (data && data.length > 0) {
        const normalizedData = data.map((item) => {
          let statusVal = item.status || item.SubmissionStatus || 'Pending Review';
          if (statusVal === 'Pending') statusVal = 'Pending Review';
          return {
            id: item.id || item.CourseID || 'N/A',
            rawId: item.rawId || item.id,
            title: item.title || item.CourseTitle || 'Untitled Course',
            level: item.level || item.CourseLevel || 'Foundation',
            trainerName: item.TrainerName || 'Freelance',
            category: item.category || item.Category || 'General',
            duration: item.duration || item.Duration || 'N/A',
            submitted: item.submitted || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '14 Jul 2026'),
            fee: Number(item.fee ?? item.CourseFee ?? 0),
            status: statusVal,
          };
        });
        setCourses(normalizedData);
      } else {
        setCourses(initialData);
      }
    } catch (err) {
      console.warn('Backend API unavailable. Loading local fallback data:', err);
      setCourses(initialData);
    } finally {
      setLoading(false);
    }
  };

  // ---- Fetch trainers ----
  const fetchTrainers = async () => {
    setLoadingTrainers(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/trainers`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) throw new Error('Failed to fetch trainers');
      const data = await res.json();
      setTrainers(data);
    } catch (err) {
      console.error('Error fetching trainers:', err);
      setTrainers([]);
    } finally {
      setLoadingTrainers(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchTrainers();
  }, []);

  // ---- Filter / sort handlers ----
  const handleOpenFilterMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseFilterMenu = () => setAnchorEl(null);
  const handleSelectSort = (option) => {
    setSortOption(option);
    handleCloseFilterMenu();
  };

  // ---- Modal handlers ----
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

  // ---- Computed stats ----
  const pendingCount = courses.filter((c) => c.status === 'Pending Review').length;
  const approvedCount = courses.filter((c) => c.status === 'Approved').length;
  const rejectedCount = courses.filter((c) => c.status === 'Rejected').length;

  const filteredCourses = courses
    .filter((c) => {
      const matchesSearch =
        (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.trainerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.id || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTab =
        activeTab === 'All' ||
        (activeTab === 'Pending' && c.status === 'Pending Review') ||
        (activeTab === 'Approved' && c.status === 'Approved') ||
        (activeTab === 'Rejected' && c.status === 'Rejected');

      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      if (sortOption === 'newest') return new Date(b.submitted) - new Date(a.submitted);
      if (sortOption === 'oldest') return new Date(a.submitted) - new Date(a.submitted);
      if (sortOption === 'fee-low-high') return a.fee - b.fee;
      if (sortOption === 'fee-high-low') return b.fee - a.fee;
      return 0;
    });

  const showTrainers = trainers.length > 0;

  return (
    <Box sx={{ pb: 4, flexGrow: 1 }}>
      {/* Top Header Row with Action Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="700" sx={{ color: '#0f172a' }}>
          Course Submissions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/apply/officer-course-form')}
          sx={{
            backgroundColor: '#4f46e5',
            '&:hover': { backgroundColor: '#4338ca' },
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2
          }}
        >
          Course Submission
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 2.5, mb: 4, flexWrap: 'wrap' }}>
        <Card elevation={0} sx={{ flex: '1 1 200px', border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" fontWeight="700" color="#64748b">TOTAL SUBMISSIONS</Typography>
              <DescriptionOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
            </Box>
            <Typography variant="h4" fontWeight="700">{courses.length}</Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ flex: '1 1 200px', border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" fontWeight="700" color="#64748b">PENDING REVIEW</Typography>
              <AccessTimeOutlinedIcon sx={{ color: '#d97706', fontSize: 20 }} />
            </Box>
            <Typography variant="h4" fontWeight="700">{pendingCount}</Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ flex: '1 1 200px', border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" fontWeight="700" color="#64748b">APPROVED</Typography>
              <CheckCircleOutlineOutlinedIcon sx={{ color: '#16a34a', fontSize: 20 }} />
            </Box>
            <Typography variant="h4" fontWeight="700">{approvedCount}</Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ flex: '1 1 200px', border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" fontWeight="700" color="#64748b">REJECTED</Typography>
              <CancelOutlinedIcon sx={{ color: '#dc2626', fontSize: 20 }} />
            </Box>
            <Typography variant="h4" fontWeight="700">{rejectedCount}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Course Table */}
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, backgroundColor: '#f1f5f9', p: 0.5, borderRadius: 2 }}>
            {[
              { label: 'All', count: courses.length },
              { label: 'Pending', count: pendingCount },
              { label: 'Approved', count: approvedCount },
              { label: 'Rejected', count: rejectedCount }
            ].map((tab) => (
              <Button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                disableElevation
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

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              size="small"
              placeholder="Search courses or trainer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={handleOpenFilterMenu}
              sx={{ textTransform: 'uppercase', fontWeight: 600 }}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchCourses}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Refresh
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseFilterMenu}
              PaperProps={{
                elevation: 3,
                sx: { borderRadius: 2, mt: 1, minWidth: 200 }
              }}
            >
              <MenuItem selected={sortOption === 'newest'} onClick={() => handleSelectSort('newest')} sx={{ fontSize: 13 }}>Newest to Oldest</MenuItem>
              <MenuItem selected={sortOption === 'oldest'} onClick={() => handleSelectSort('oldest')} sx={{ fontSize: 13 }}>Oldest to Newest</MenuItem>
              <MenuItem selected={sortOption === 'fee-low-high'} onClick={() => handleSelectSort('fee-low-high')} sx={{ fontSize: 13 }}>Lowest Fee to Highest Fee</MenuItem>
              <MenuItem selected={sortOption === 'fee-high-low'} onClick={() => handleSelectSort('fee-high-low')} sx={{ fontSize: 13 }}>Highest Fee to Lowest Fee</MenuItem>
            </Menu>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#fafafa' }}>
              <TableRow>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>SUBMISSION ID</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>COURSE TITLE</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>TRAINER</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>CATEGORY</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>DURATION</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>SUBMITTED</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>FEE</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>STATUS</TableCell>
                <TableCell align="center" sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4, color: '#64748b' }}>
                    No course submissions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>{row.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600" color="#0f172a">{row.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.level}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{row.trainerName || '—'}</TableCell>
                    <TableCell><Chip label={row.category} size="small" sx={{ backgroundColor: '#f1f5f9', fontWeight: 600, fontSize: 11 }} /></TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{row.duration}</TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{row.submitted}</TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                      ${Number(row.fee || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={row.status === 'Approved' ? 'success' : row.status === 'Rejected' ? 'error' : 'warning'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {row.status === 'Pending Review' && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenEdit(row)}
                        >
                          Edit
                        </Button>
                      )}
                      {row.status === 'Rejected' && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="warning"
                          startIcon={<UndoIcon />}
                          onClick={() => handleOpenAppeal(row)}
                        >
                          Appeal
                        </Button>
                      )}
                      {row.status === 'Approved' && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No action
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ---- Trainers Table ---- */}
      {showTrainers && (
        <Paper elevation={0} sx={{ mt: 4, border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="h6" fontWeight="700">
              My Trainers
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#fafafa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Trainer Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Qualifications</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Certification</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingTrainers ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                ) : (
                  trainers.map((trainer, index) => (
                    <TableRow key={trainer.trainerId || index}>
                      <TableCell>{trainer.name || '—'}</TableCell>
                      <TableCell>{trainer.email || '—'}</TableCell>
                      <TableCell>{trainer.qualifications || '—'}</TableCell>
                      <TableCell>{trainer.certification || '—'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ---- Edit / Appeal Modal ---- */}
      <EditCourseModal
        open={editModalOpen}
        course={editingCourse}
        onClose={handleCloseEdit}
        onUpdate={fetchCourses}
        isAppeal={isAppeal}
      />
    </Box>
  );
}

export default ProviderDashboard;