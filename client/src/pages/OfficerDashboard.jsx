import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Menu,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CloseIcon from '@mui/icons-material/Close';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';

const initialData = [
  { id: 'RS-2026-001', title: 'Advanced Data Analytics with Python', level: 'Advanced', provider: 'TechLearn Academy', category: 'Data Science', duration: '40 hours', submitted: '14 Jul 2026', fee: 2500, status: 'Pending Review' },
  { id: 'RS-2026-002', title: 'Workplace Health & Safety Fundamentals', level: 'Foundation', provider: 'SafeWork Training Ltd', category: 'Health & Safety', duration: '16 hours', submitted: '11 Jul 2026', fee: 850, status: 'Pending Review' },
  { id: 'RS-2026-003', title: 'Project Management Professional Prep', level: 'Intermediate', provider: 'Meridian Skills Group', category: 'Management', duration: '60 hours', submitted: '28 Jun 2026', fee: 1800, status: 'Approved' },
  { id: 'RS-2026-004', title: 'Digital Marketing Essentials', level: 'Foundation', provider: 'Clarity Learning Co.', category: 'Marketing', duration: '24 hours', submitted: '20 Jun 2026', fee: 1200, status: 'Rejected' },
  { id: 'RS-2026-005', title: 'Leadership in Agile Environments', level: 'Intermediate', provider: 'Meridian Skills Group', category: 'Leadership', duration: '32 hours', submitted: '9 Jul 2026', fee: 1450, status: 'Pending Review' },
];

function OfficerDashboard({ onAddNotification }) {
  const [courses, setCourses] = useState(initialData);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortOption, setSortOption] = useState('newest'); // 'newest', 'oldest', 'fee-low-high', 'fee-high-low'

  const handleOpenFilterMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseFilterMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectSort = (option) => {
    setSortOption(option);
    handleCloseFilterMenu();
  };

  // Rejection State
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reasonError, setReasonError] = useState(false);
  const [emailNotification, setEmailNotification] = useState(null);

  const handleStatusChange = (id, newStatus) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  const handleOpenRejectModal = (course) => {
    setSelectedCourse(course);
    setRejectionReason('');
    setReasonError(false);
  };

  const handleCloseRejectModal = () => {
    setSelectedCourse(null);
    setRejectionReason('');
    setReasonError(false);
  };

  const handleConfirmRejection = () => {
    if (!rejectionReason.trim()) {
      setReasonError(true);
      return;
    }

    // 1. Update submission status in table
    handleStatusChange(selectedCourse.id, 'Rejected');

    // 2. Format automated email
    const uniqueEmailId = `MSG-${Math.floor(100000 + Math.random() * 900000)}`;
    const emailSubject = `<Subject - Rejection of Course Application> <${uniqueEmailId}>`;
    const emailBody = `Dear ${selectedCourse.provider}\n\nThe course, ${selectedCourse.title}, ${selectedCourse.id} has been rejected due to ${rejectionReason.trim()}. Please resubmit the course application with the updated information.\n\nIf you have any enquiry related to this, please reply on this email and our officers will get back to you as soon as possible, thank you.\n\nBest Regards\nRightSkills Officer`;

    // 3. Set top banner preview on Dashboard
    setEmailNotification({
      subject: emailSubject,
      body: emailBody,
      provider: selectedCourse.provider
    });

    // 4. Send directly to global Inbox / Notifications state
    if (onAddNotification) {
      onAddNotification({
        title: selectedCourse.title,
        provider: selectedCourse.provider,
        subject: emailSubject,
        body: emailBody
      });
    }

    handleCloseRejectModal();
  };

  const pendingCount = courses.filter((c) => c.status === 'Pending Review').length;
  const approvedCount = courses.filter((c) => c.status === 'Approved').length;
  const rejectedCount = courses.filter((c) => c.status === 'Rejected').length;

  // Filter and Sort Logic
  const filteredCourses = courses
    .filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTab =
        activeTab === 'All' ||
        (activeTab === 'Pending' && c.status === 'Pending Review') ||
        (activeTab === 'Approved' && c.status === 'Approved') ||
        (activeTab === 'Rejected' && c.status === 'Rejected');

      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.submitted) - new Date(a.submitted);
      }
      if (sortOption === 'oldest') {
        return new Date(a.submitted) - new Date(b.submitted);
      }
      if (sortOption === 'fee-low-high') {
        return a.fee - b.fee;
      }
      if (sortOption === 'fee-high-low') {
        return b.fee - a.fee;
      }
      return 0;
    });

  return (
    <Box sx={{ pb: 4, flexGrow: 1 }}>
      {/* Sent Email Preview Banner */}
      {emailNotification && (
        <Alert 
          severity="info" 
          onClose={() => setEmailNotification(null)}
          sx={{ mb: 3, borderRadius: 2, border: '1px solid #bfdbfe' }}
        >
          <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 0.5 }}>
            Rejection Email Sent to {emailNotification.provider}
          </Typography>
          <Typography variant="caption" display="block" fontWeight="600" color="text.secondary" sx={{ mb: 1 }}>
            {emailNotification.subject}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontFamily: 'monospace', backgroundColor: '#f8fafc', p: 1.5, borderRadius: 1 }}>
            {emailNotification.body}
          </Typography>
        </Alert>
      )}

      <Typography variant="h5" fontWeight="700" sx={{ mb: 3, color: '#0f172a' }}>
        Course Submissions
      </Typography>

      {/* Metrics Row */}
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

      {/* Submissions Table */}
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
              placeholder="Search courses or provider"
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
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseFilterMenu}
              PaperProps={{
                elevation: 3,
                sx: { borderRadius: 2, mt: 1, minWidth: 200 }
              }}
            >
              <MenuItem
                selected={sortOption === 'newest'}
                onClick={() => handleSelectSort('newest')}
                sx={{ fontSize: 13, fontWeight: sortOption === 'newest' ? 700 : 400 }}
              >
                Newest to Oldest
              </MenuItem>
              <MenuItem
                selected={sortOption === 'oldest'}
                onClick={() => handleSelectSort('oldest')}
                sx={{ fontSize: 13, fontWeight: sortOption === 'oldest' ? 700 : 400 }}
              >
                Oldest to Newest
              </MenuItem>
              <MenuItem
                selected={sortOption === 'fee-low-high'}
                onClick={() => handleSelectSort('fee-low-high')}
                sx={{ fontSize: 13, fontWeight: sortOption === 'fee-low-high' ? 700 : 400 }}
              >
                Lowest Fee to Highest Fee
              </MenuItem>
              <MenuItem
                selected={sortOption === 'fee-high-low'}
                onClick={() => handleSelectSort('fee-high-low')}
                sx={{ fontSize: 13, fontWeight: sortOption === 'fee-high-low' ? 700 : 400 }}
              >
                Highest Fee to Lowest Fee
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#fafafa' }}>
              <TableRow>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>SUBMISSION ID</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>COURSE TITLE</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>PROVIDER</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>CATEGORY</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>DURATION</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>SUBMITTED</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>FEE</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>STATUS</TableCell>
                <TableCell align="center" sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>{row.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600" color="#0f172a">{row.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.level}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{row.provider}</TableCell>
                  <TableCell><Chip label={row.category} size="small" sx={{ backgroundColor: '#f1f5f9', fontWeight: 600, fontSize: 11 }} /></TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{row.duration}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{row.submitted}</TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>${row.fee.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      color={row.status === 'Approved' ? 'success' : row.status === 'Rejected' ? 'error' : 'warning'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {row.status === 'Pending Review' ? (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          color="success"
                          startIcon={<CheckCircleOutlineIcon />}
                          onClick={() => handleStatusChange(row.id, 'Approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<HighlightOffIcon />}
                          onClick={() => handleOpenRejectModal(row)}
                        >
                          Reject
                        </Button>
                      </Box>
                    ) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Rejection Modal */}
      <Dialog
        open={Boolean(selectedCourse)}
        onClose={handleCloseRejectModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Box sx={{ backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '50%', p: 1, display: 'flex' }}>
              <HighlightOffOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="700" sx={{ lineHeight: 1.2 }}>
                Reject Course Submission
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {selectedCourse?.id}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={handleCloseRejectModal} sx={{ color: '#94a3b8' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Paper elevation={0} sx={{ backgroundColor: '#eef2ff', p: 2, borderRadius: 2, mb: 2.5 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Course
            </Typography>
            <Typography variant="subtitle2" fontWeight="700" color="#1e293b">
              {selectedCourse?.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedCourse?.provider}
            </Typography>
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
              if (e.target.value.trim()) setReasonError(false);
            }}
            error={reasonError}
            helperText={reasonError ? 'A reason is required to reject this submission.' : ''}
            sx={{
              backgroundColor: '#f8fafc',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': { borderRadius: 2 }
            }}
          />

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            This reason will be automatically emailed to the training provider.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleCloseRejectModal}
            sx={{ textTransform: 'none', borderRadius: 2, px: 2.5, borderColor: '#e2e8f0', color: '#334155' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<HighlightOffIcon />}
            onClick={handleConfirmRejection}
            sx={{ textTransform: 'none', borderRadius: 2, px: 2.5, backgroundColor: '#dc2626', fontWeight: '600' }}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default OfficerDashboard;