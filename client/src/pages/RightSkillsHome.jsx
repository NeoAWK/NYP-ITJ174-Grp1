import React from 'react';
import { Box, Typography } from '@mui/material';

function RightSkillsHome() {
    return (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Welcome to RightSkills Training Ecosystem Management System
            </Typography>
            <Typography align="center" color="textSecondary">
                Please Register or Log in to manage ecosystem setups.
            </Typography>
        </Box>
    );
}

export default RightSkillsHome;
