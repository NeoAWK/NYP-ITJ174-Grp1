import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Button, TextField } from '@mui/material';
import dayjs from 'dayjs';
import http from '../http';
import UserContext from '../contexts/UserContext';
import global from '../global';

function Tutorials() {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [contentItems, setContentItems] = useState([]);
    const [search, setSearch] = useState('');

    const fetchContent = () => {
        http.get('/tutorial', {
            params: { search }
        }).then((res) => {
            setContentItems(res.data || []);
        });
    };

    useEffect(() => {
        fetchContent();
    }, []);

    const onSearchChange = (event) => {
        setSearch(event.target.value);
    };

    const onSearchClick = () => {
        fetchContent();
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h5">Learning Content Library</Typography>
                {user && (
                    <Button variant="contained" onClick={() => navigate('/content/new')}>
                        Add Content
                    </Button>
                )}
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    size="small"
                    label="Search Content"
                    value={search}
                    onChange={onSearchChange}
                />
                <Button variant="outlined" onClick={onSearchClick}>Search</Button>
            </Box>

            <Grid container spacing={2} sx={{ mt: 1 }}>
                {contentItems.map((item) => (
                    <Grid item xs={12} md={6} key={item.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{item.title}</Typography>
                                <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                                    {item.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Created: {item.createdAt ? dayjs(item.createdAt).format(global.datetimeFormat) : 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Owner: {item.user?.name || 'Unknown'}
                                </Typography>
                                {user && (
                                    <Button sx={{ mt: 1 }} size="small" onClick={() => navigate(`/content/${item.id}`)}>
                                        Edit
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {contentItems.length === 0 && (
                    <Grid item xs={12}>
                        <Typography color="text.secondary">No content found.</Typography>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}

export default Tutorials;
