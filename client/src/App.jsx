import './App.css';
import React, { useState, useEffect } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Alert,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  CssBaseline
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import MyForm from './pages/MyForm';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Login from './pages/Login';
import http from './http';
import UserContext from './contexts/UserContext';
import VerifyEmail from './pages/VerifyEmail';
import RightSkillsLanding from './pages/RightSkillsLanding';
import RegisterProvider from './pages/RegisterProvider';
import RegisterTrainer from './pages/RegisterTrainer';
import RegisterLearner from './pages/RegisterLearner';
import TrainerProfile from './pages/TrainerProfile';
import TrainerDashboard from './pages/TrainerDashboard';
import TrainerCourseDetail from './pages/TrainerCourseDetail';
import OfficerDashboard from './pages/OfficerDashboard';
import OfficerNotifications from './pages/OfficerNotifications';
import CourseApplicationEditor from './pages/CourseApplicationEditor';
import AdminAuditLog from './pages/AdminAuditLog';

const defaultTheme = createTheme();

const initialNotifications = [
  { id: 1, type: 'New submission', title: 'Customer Experience Design', provider: 'Clarity Learning Co.', time: '1d ago', unread: true },
  { id: 2, type: 'New submission', title: 'Advanced Data Analytics with Python', provider: 'TechLearn Academy', time: '1d ago', unread: true },
  { id: 3, type: 'New submission', title: 'Workplace Health & Safety Fundamentals', provider: 'SafeWork Training Ltd', time: '5d ago', unread: true },
  { id: 4, type: 'New submission', title: 'Leadership in Agile Environments', provider: 'Meridian Skills Group', time: '6d ago', unread: false },
];

function NavigationBar({ user, logout, notifications, setNotifications }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const isOfficer = Boolean(user && user.email === 'admin123@abc.com');
  const isTrainer = Boolean(user && user.usertype === 'Trainer');

  const handleNotificationClick = (event) => setAnchorEl(event.currentTarget);
  const handleNotificationClose = () => setAnchorEl(null);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const openNotifications = Boolean(anchorEl);
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        // Color is blue for officers, purple for trainers, and green for other users.
        backgroundColor: isOfficer ? '#1976d2' : isTrainer ? '#7b1fa2' : '#2e7d32', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: 'background-color 0.3s ease'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: 64 }}>
          
          {/* Main Brand Logo */}
          <Link to="/" style={{ textDecoration: 'none', color: 'white', marginRight: '32px' }}>
            <Typography variant="h6" component="div" fontWeight="bold">
              RightSkills
            </Typography>
          </Link>

          {/* Regular User / Non-Officer Navigation */}
          {!isOfficer && (
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Link to="/trainer-profile-overview" style={{ color: 'white', textDecoration: 'none' }}>
                <Typography fontWeight="500">Trainer Profile</Typography>
              </Link>
            </Box>
          )}

          {/* Officer Navigation */}
          {isOfficer && (
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <Link to="/officer-dashboard" style={{ textDecoration: 'none', color: 'white' }}>
                <Typography fontWeight="500">Dashboard</Typography>
              </Link>
              <Link to="/officer-notifications" style={{ textDecoration: 'none', color: 'white' }}>
                <Typography fontWeight="500">Inbox</Typography>
              </Link>
              <Link to="/officer-course-form" style={{ textDecoration: 'none', color: 'white' }}>
                <Typography fontWeight="500">Course Application Form</Typography>
              </Link>
              <Link to="/admin-history" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Typography fontWeight="500">History Log</Typography>
              </Link>
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Right Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            
            {/* Notification Bell (Officer Only) */}
            {isOfficer && (
              <IconButton 
                onClick={handleNotificationClick} 
                sx={{ color: 'white', mr: 1 }}
                size="medium"
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsNoneIcon sx={{ fontSize: 24 }} />
                </Badge>
              </IconButton>
            )}

            {/* Notifications Popover */}
            <Popover
              open={openNotifications}
              anchorEl={anchorEl}
              onClose={handleNotificationClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: { 
                  width: 360, 
                  borderRadius: 3, 
                  mt: 1, 
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' 
                }
              }}
            >
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsNoneIcon sx={{ color: '#334155', fontSize: 20 }} />
                  <Typography variant="subtitle1" fontWeight="700" color="#0f172a">
                    Notifications
                  </Typography>
                  {unreadCount > 0 && (
                    <Box sx={{ backgroundColor: '#3b82f6', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: '700' }}>
                      {unreadCount}
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {unreadCount > 0 && (
                    <Button 
                      size="small" 
                      onClick={handleMarkAllRead} 
                      sx={{ textTransform: 'none', color: '#4f46e5', fontWeight: 600, fontSize: 12, p: 0 }}
                    >
                      Mark all read
                    </Button>
                  )}
                  <IconButton size="small" onClick={handleNotificationClose} sx={{ color: '#94a3b8' }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>

              <List disablePadding sx={{ maxHeight: 380, overflowY: 'auto' }}>
                {notifications.map((n, idx) => {
                  const isRejection = n.type === 'Rejection Sent';
                  return (
                    <React.Fragment key={n.id}>
                      <ListItem 
                        sx={{ 
                          px: 2, 
                          py: 1.5, 
                          backgroundColor: n.unread ? '#f8fafc' : '#ffffff',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#f1f5f9' }
                        }}
                        onClick={() => {
                          handleNotificationClose();
                          navigate('/officer-notifications');
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 44 }}>
                          <Avatar sx={{ backgroundColor: isRejection ? '#fee2e2' : '#e0e7ff', color: isRejection ? '#dc2626' : '#4338ca', width: 36, height: 36 }}>
                            {isRejection ? <MarkEmailReadOutlinedIcon sx={{ fontSize: 18 }} /> : <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />}
                          </Avatar>
                        </ListItemIcon>

                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" fontWeight="600" color={isRejection ? '#dc2626' : '#1e293b'}>
                                {n.type}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <Typography variant="caption" color="#64748b" sx={{ fontSize: 11 }}>
                                  {n.time}
                                </Typography>
                                {n.unread && (
                                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                                )}
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.3 }}>
                              <Typography variant="body2" color="#0f172a" fontWeight="500" sx={{ lineHeight: 1.3 }}>
                                {n.title}
                              </Typography>
                              <Typography variant="caption" color="#64748b" display="block">
                                {n.provider}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {idx < notifications.length - 1 && <Divider component="li" sx={{ borderColor: '#f1f5f9' }} />}
                    </React.Fragment>
                  );
                })}
              </List>

              <Box sx={{ py: 1.5, textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
                <Typography variant="caption" color="#64748b" fontWeight="500">
                  Showing last 30 days · {notifications.length} total
                </Typography>
              </Box>
            </Popover>

            {/* Profile Tab */}
            {user && (
              <Link to="/profile" style={{ textDecoration: 'none', color: 'white', marginRight: '16px' }}>
                <Typography sx={{ fontWeight: 'bold', cursor: 'pointer' }}>
                  {isOfficer ? 'RightSkills Officer' : user.name}
                </Typography>
              </Link>
            )}

            {/* Logout / Login */}
            {user ? (
              <Button onClick={logout} color="inherit" sx={{ fontWeight: '500', textTransform: 'uppercase' }}>
                LOGOUT
              </Button>
            ) : (
              <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>LOGIN</Link>
            )}

          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [backendMode, setBackendMode] = useState('unknown');
  const [notifications, setNotifications] = useState(initialNotifications);

  useEffect(() => {
    http.get('/system/mode')
      .then((res) => setBackendMode(res.data.mode || 'unknown'))
      .catch(() => setBackendMode('unknown'));

    if (localStorage.getItem("accessToken")) {
      http.get('/user/auth').then((res) => {
        setUser(res.data.user);
      }).catch(() => {
        localStorage.clear();
      });
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location = "/";
  };

  const handleAddNotification = (newNotif) => {
    setNotifications((prev) => [
      {
        id: Date.now(),
        type: 'Rejection Sent',
        title: newNotif.title,
        provider: newNotif.provider,
        time: 'Just now',
        unread: true,
        subject: newNotif.subject,
        body: newNotif.body
      },
      ...prev
    ]);
  };

  const isOfficer = Boolean(user && user.email === 'admin123@abc.com');

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw' }}>
            
            <NavigationBar 
              user={user} 
              logout={logout} 
              notifications={notifications} 
              setNotifications={setNotifications} 
            />

            <Box component="main" sx={{ flexGrow: 1, py: 3, px: 2 }}>
              <Container maxWidth="xl">
                {backendMode === 'placeholder' && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Backend placeholder mode is active.
                  </Alert>
                )}

                <Routes>
                  <Route
                    path="/"
                    element={
                      isOfficer
                        ? <OfficerDashboard onAddNotification={handleAddNotification} />
                        : user?.usertype === 'Trainer'
                          ? <TrainerDashboard />
                          : <RightSkillsLanding />
                    }
                  />
                  <Route path={"/register-provider"} element={user?.usertype === 'Trainer' ? <Navigate to="/" replace /> : <RegisterProvider />} />
                  <Route path={"/register-trainer"} element={user?.usertype === 'Trainer' ? <Navigate to="/" replace /> : <RegisterTrainer />} />
                  <Route path={"/register-learner"} element={user?.usertype === 'Trainer' ? <Navigate to="/" replace /> : <RegisterLearner />} />
                  <Route path={"/trainer-profile"} element={<TrainerProfile />} />
                  <Route path={"/trainer-profile-overview"} element={<TrainerProfile />} />
                  <Route path={"/trainer-dashboard"} element={<TrainerDashboard />} />
                  <Route path={"/trainer-dashboard/:id"} element={<TrainerCourseDetail />} />
                  <Route path={"/officer-dashboard"} element={<OfficerDashboard onAddNotification={handleAddNotification} />} />
                  <Route path={"/officer-notifications"} element={<OfficerNotifications notifications={notifications} />} />
                  <Route path={"/officer-course-form"} element={<CourseApplicationEditor />} />
                  <Route path={"/admin-history"} element={<AdminAuditLog />} />
                  <Route path={"/register"} element={<Register />} />
                  <Route path={"/login"} element={<Login />} />
                  <Route path={"/form"} element={<MyForm />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path={"/profile"} element={<Profile />} />
                </Routes>
              </Container>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </UserContext.Provider>
  );
}

export default App;