import './App.css';
import { useState, useEffect } from 'react';
import { Container, AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import MyTheme from './themes/MyTheme';
import Tutorials from './pages/Tutorials';
import AddTutorial from './pages/AddTutorial';
import EditTutorial from './pages/EditTutorial';
import MyForm from './pages/MyForm';
import Register from './pages/Register';
import Profile from './pages/Profile'; // Import Profile page
import Login from './pages/Login';
import http from './http';
import UserContext from './contexts/UserContext';
import VerifyEmail from './pages/VerifyEmail';
import RightSkillsLanding from './pages/RightSkillsLanding'; // New Landing Page name
import RegisterProvider from './pages/RegisterProvider';
import RegisterTrainer from './pages/RegisterTrainer';
import RegisterLearner from './pages/RegisterLearner';
import ProviderDetails from './pages/ProviderDetails';


function App() {
  const [user, setUser] = useState(null);

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

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <ThemeProvider theme={MyTheme}>
          <AppBar position="static" className="AppBar">
            <Container>
              <Toolbar disableGutters={true}>
                <Link to="/">
                  <Typography variant="h6" component="div">
                    RightSkills
                  </Typography>
                </Link>
                <Link to="/Registration" ><Typography>Registration</Typography></Link>

                <Box sx={{ flexGrow: 1 }}></Box>

                {user && (
                  <>
                    {/* Link the username to the profile page */}
                    <Link to="/profile" style={{ textDecoration: 'none', color: 'white', marginRight: '15px' }}>
                      <Typography sx={{ fontWeight: 'bold', cursor: 'pointer' }}>
                        {user.name}
                      </Typography>
                    </Link>
                    <Button onClick={logout} color="inherit">Logout</Button>
                  </>
                )}

                {!user && (
                  <>
                    <Link to="/register" ><Typography>Register</Typography></Link>
                    <Link to="/login" ><Typography>Login</Typography></Link>
                  </>
                )}
              </Toolbar>
            </Container>
          </AppBar>

          <Container>
            <Routes>
              <Route path={"/"} element={<RightSkillsLanding />} />
              <Route path={"/Registration"} element={<RightSkillsLanding />} />
              <Route path={"/register-provider"} element={<RegisterProvider />} />
              <Route path={"/register-trainer"} element={<RegisterTrainer />} />
              <Route path={"/register-learner"} element={<RegisterLearner />} />
              {/* Maintain your rest login/register routers safely here... */}
              <Route path={"/register-provider"} element={<RegisterProvider />} />
              <Route path={"/provider-details"} element={<ProviderDetails />} />

              <Route path={"/register"} element={<Register />} />
              <Route path={"/login"} element={<Login />} />
              <Route path={"/form"} element={<MyForm />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              {/* Route for Profile Page */}
              <Route path={"/profile"} element={<Profile />} />
            </Routes>
          </Container>
        </ThemeProvider>
      </Router>
    </UserContext.Provider>
  );
}

export default App;