import './App.css';
import React, { useState, useEffect } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
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
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import Register from './pages/Register';
import Profile from './pages/Profile';
import Login from './pages/Login';
import http from './http';
import UserContext from './contexts/UserContext';
import VerifyEmail from './pages/VerifyEmail';
import RightSkillsLanding from './pages/RightSkillsLanding';
import RightSkillsHome from './pages/RightSkillsHome';
import RegisterProvider from './pages/RegisterProvider';
import RegisterTrainer from './pages/RegisterTrainer';
import RegisterLearner from './pages/RegisterLearner';
import ProviderDetails from './pages/ProviderDetails';
import TrainerDetails from './pages/TrainerDetails';
import LearnerDetails from './pages/LearnerDetails';
import TrainerProfile from './pages/TrainerProfile';
import TrainerDashboard from './pages/TrainerDashboard';
import TrainerCourseDetail from './pages/TrainerCourseDetail';
import OfficerDashboard from './pages/OfficerDashboard';
import OfficerNotifications from './pages/OfficerNotifications';
import FormEditor from './pages/FormEditor';
import AdminAuditLog from './pages/AdminAuditLog';
import FormManagement from './pages/FormManagement';
import ApplyFormPage from './pages/ApplyForm';
import ProviderDashboard from './pages/ProviderDashboard'
import UsersPage from './pages/users';
import EditCourseModal from './pages/components/EditCourseModal';
import CourseManagement from './pages/CourseManagement';
import GraphPage from './pages/Graphpage';
import AvailableCourses from './pages/AvailableCourses';
import CourseDetail from './pages/CourseDetail';
import MyCourses from "./pages/MyCourses";

const defaultTheme = createTheme();

const initialNotifications = [
  { id: 1, type: 'New submission', title: 'Customer Experience Design', provider: 'Clarity Learning Co.', time: '1d ago', unread: true },
  { id: 2, type: 'New submission', title: 'Advanced Data Analytics with Python', provider: 'TechLearn Academy', time: '1d ago', unread: true },
  { id: 3, type: 'New submission', title: 'Workplace Health & Safety Fundamentals', provider: 'SafeWork Training Ltd', time: '5d ago', unread: true },
  { id: 4, type: 'New submission', title: 'Leadership in Agile Environments', provider: 'Meridian Skills Group', time: '6d ago', unread: false },
];
function PublicFormPage() {
  const { slug } = useParams();
  return <FormRenderer formSlug={slug} />;
}
function NavigationBar({ user, logout, notifications, setNotifications }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const isOfficer = Boolean(user && user.email === 'admin123@abc.com');
  const isTrainer = Boolean(user && user.usertype === 'Trainer');
  const isLearner = Boolean(user && user.usertype === 'Learner');
  const isProvider = Boolean(user && user.usertype === "TrainingProvider")

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
        backgroundColor: isOfficer ? '#1976d2' : isTrainer ? '#7b1fa2' : '#2e7d32',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: 'background-color 0.3s ease'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: 64 }}>

          <Link to="/" style={{ textDecoration: 'none', color: 'white', marginRight: '32px' }}>
            <Typography variant="h6" component="div" fontWeight="bold">
              RightSkills
            </Typography>
          </Link>

          {isLearner && (
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Link to="/available-courses" style={{ color: 'white', textDecoration: 'none' }}>
                <Typography fontWeight="500">AVAILABLE COURSES</Typography>
              </Link>
              <Link to="/my-courses" style={{ color: 'white', textDecoration: 'none' }}>
                <Typography fontWeight="500">ENROLLED</Typography>
              </Link>
            </Box>
          )}

          {/* Trainer */}
          {isTrainer && (
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Link to="/trainer-profile-overview" style={{ color: 'white', textDecoration: 'none' }}>
                <Typography fontWeight="500">HOME</Typography>
              </Link>
                            <Link to="/courses" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Typography fontWeight="500">COURSES</Typography>
              </Link>
            </Box>)}


          {isProvider && (
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Link to="/provider-dashboard" style={{ color: 'white', textDecoration: 'none' }}>
                <Typography fontWeight="500">HOME</Typography>
              </Link>
                            <Link to="/courses" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Typography fontWeight="500">COURSES</Typography>
              </Link>
            </Box>
            
          )}


          {isOfficer && (
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <Link to="/officer-dashboard" style={{ textDecoration: 'none', color: 'white' }}>
                <Typography fontWeight="500">HOME</Typography>
              </Link>
              <Link to="/officer-notifications" style={{ textDecoration: 'none', color: 'white' }}>
                <Typography fontWeight="500">INBOX</Typography>
              </Link>
              <Link to="/forms" style={{ textDecoration: 'none', color: 'white' }}>
                <Typography fontWeight="500">FORMS</Typography>
              </Link>
              <Link to="/users" style={{ textDecoration: 'none', color: 'white' }}>
                <Typography fontWeight="500">USERS</Typography>
              </Link>
              <Link to="/courses" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Typography fontWeight="500">COURSES</Typography>
              </Link>
              <Link to="/admin-history" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Typography fontWeight="500">HISTORY</Typography>
              </Link>

            </Box>
            
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

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

            {user && (
              <Link to="/profile" style={{ textDecoration: 'none', color: 'white', marginRight: '16px' }}>
                <Typography sx={{ fontWeight: 'bold', cursor: 'pointer' }}>
                  {isOfficer ? 'RightSkills Officer' : user.name}
                </Typography>
              </Link>
            )}

            {user ? (
              <Button onClick={logout} color="inherit" sx={{ fontWeight: '500', textTransform: 'uppercase' }}>
                LOGOUT
              </Button>
            ) : (
              <>
                <Link to="/register" style={{ color: 'white', textDecoration: 'none', fontWeight: '500', marginRight: '16px' }}>REGISTER</Link>
                <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>LOGIN</Link>
              </>
            )}

          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(initialNotifications);

  useEffect(() => {
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
                <Routes>
                  {/* Logged-out users see the simple welcome page; logged-in users
                      see the registration Hub, which itself handles Trainer-specific
                      extras internally. Officers are routed straight to their
                      dashboard from Login.jsx instead of via this route. */}
                  <Route path={"/"} element={user ? <RightSkillsLanding /> : <RightSkillsHome />} />

                  <Route path={"/register-provider"} element={<RegisterProvider />} />
                  <Route path={"/register-trainer"} element={<RegisterTrainer />} />
                  <Route path={"/register-learner"} element={<RegisterLearner />} />
                  <Route path={"/provider-details"} element={<ProviderDetails />} />
                  <Route path={"/trainer-details"} element={<TrainerDetails />} />
                  <Route path={"/learner-details"} element={<LearnerDetails />} />

                  <Route path={"/trainer-profile"} element={<TrainerProfile />} />
                  <Route path={"/trainer-profile-overview"} element={<TrainerProfile />} />
                  <Route path={"/trainer-dashboard"} element={<TrainerDashboard />} />
                  <Route path={"/trainer-dashboard/:id"} element={<TrainerCourseDetail />} />

                  <Route path={"/officer-dashboard"} element={<OfficerDashboard onAddNotification={handleAddNotification} />} />
                  <Route path={"/officer-notifications"} element={<OfficerNotifications notifications={notifications} />} />
                  <Route path={"/admin-history"} element={<AdminAuditLog />} />
                  <Route path={"/register"} element={<Register />} />
                  <Route path={"/login"} element={<Login />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path={"/profile"} element={<Profile />} />
                  <Route path={"/forms"} element={<FormManagement />} />
                  <Route path={"/form/:slug"} element={<FormEditor />} />
                  <Route path="/apply/:slug" element={<ApplyFormPage />} />
                  <Route path="/provider-dashboard" element={<ProviderDashboard />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/Courses" element={<CourseManagement />} />
                  <Route path="/Graph" element={<GraphPage />} />
                  <Route path="/available-courses" element={<AvailableCourses />} />
                  <Route path="/available-courses/:id" element={<CourseDetail />} />
                  <Route path="/my-courses" element={<MyCourses />} />
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
