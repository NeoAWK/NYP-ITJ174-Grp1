import React, { useContext, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemText,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { PictureAsPdf, Image as ImageIcon, WorkHistory } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from '../contexts/UserContext';

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_CERTIFICATE_SIZE_MB = 5;

function LecturerProfile() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [certificateFile, setCertificateFile] = useState(null);
    const [certificateGallery, setCertificateGallery] = useState([]);
    const [experienceForm, setExperienceForm] = useState({
        jobTitle: '',
        organization: '',
        startDate: '',
        endDate: '',
        description: ''
    });
    const [experienceTimeline, setExperienceTimeline] = useState([]);

    const sortedTimeline = useMemo(() => {
        return [...experienceTimeline].sort((a, b) => {
            const aStart = dayjs(a.startDate).valueOf();
            const bStart = dayjs(b.startDate).valueOf();
            if (aStart !== bStart) {
                return bStart - aStart;
            }

            const aEnd = a.endDate ? dayjs(a.endDate).valueOf() : Number.MAX_SAFE_INTEGER;
            const bEnd = b.endDate ? dayjs(b.endDate).valueOf() : Number.MAX_SAFE_INTEGER;
            return bEnd - aEnd;
        });
    }, [experienceTimeline]);

    const onCertificateChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        setCertificateFile(file);
    };

    const saveCertificate = () => {
        if (!certificateFile) {
            toast.error('Please choose a certificate file before saving.');
            return;
        }

        if (!ACCEPTED_TYPES.includes(certificateFile.type)) {
            toast.error('Only PDF, PNG, or JPEG files are allowed.');
            return;
        }

        if (certificateFile.size > MAX_CERTIFICATE_SIZE_MB * 1024 * 1024) {
            toast.error('Certificate must be under 5MB.');
            return;
        }

        const isImage = certificateFile.type.startsWith('image/');
        const previewUrl = isImage ? URL.createObjectURL(certificateFile) : null;

        setCertificateGallery((prev) => [
            {
                id: `${certificateFile.name}-${Date.now()}`,
                name: certificateFile.name,
                type: certificateFile.type,
                sizeKb: Math.round(certificateFile.size / 1024),
                uploadedAt: new Date().toISOString(),
                previewUrl
            },
            ...prev
        ]);
        setCertificateFile(null);
        toast.success('Certificate uploaded and gallery updated successfully.');
    };

    const onExperienceInputChange = (event) => {
        const { name, value } = event.target;
        setExperienceForm((prev) => ({ ...prev, [name]: value }));
    };

    const addExperience = () => {
        const { jobTitle, organization, startDate, endDate, description } = experienceForm;

        if (!jobTitle || !organization || !startDate || !endDate || !description) {
            toast.error('Please fill in all required experience fields.');
            return;
        }

        if (dayjs(endDate).isBefore(dayjs(startDate), 'day')) {
            toast.error('End Date cannot be earlier than Start Date.');
            return;
        }

        const formattedPeriod = `${dayjs(startDate).format('MMM YYYY')} - ${dayjs(endDate).format('MMM YYYY')}`;

        setExperienceTimeline((prev) => [
            {
                id: `${jobTitle}-${organization}-${Date.now()}`,
                ...experienceForm,
                formattedPeriod
            },
            ...prev
        ]);

        setExperienceForm({
            jobTitle: '',
            organization: '',
            startDate: '',
            endDate: '',
            description: ''
        });

        toast.success('Professional experience added to the timeline.');
    };

    if (!user) {
        return (
            <Box sx={{ mt: 5 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Please log in to access the lecturer profile editor.
                </Alert>
                <Button variant="contained" onClick={() => navigate('/login')}>
                    Go to Login
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                External Lecturer Profile Editor
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
                Demo mode: file uploads and timeline entries are placeholders stored in local page state.
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
                Backend calls are disabled on this page by design. All actions show acceptance flow behavior using placeholders.
            </Alert>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Certificate Upload
                            </Typography>
                            <Stack spacing={2}>
                                <Button variant="outlined" component="label">
                                    Select Certificate (PDF/PNG/JPEG, max 5MB)
                                    <input
                                        hidden
                                        type="file"
                                        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                                        onChange={onCertificateChange}
                                    />
                                </Button>

                                <Typography variant="body2" color="text.secondary">
                                    Selected: {certificateFile ? certificateFile.name : 'No file selected'}
                                </Typography>

                                <Button variant="contained" onClick={saveCertificate}>
                                    Save
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Certificate Gallery
                            </Typography>
                            <List dense>
                                {certificateGallery.length === 0 && (
                                    <ListItem>
                                        <ListItemText
                                            primary="No certificates uploaded yet."
                                            secondary="Uploaded files will appear here after Save."
                                        />
                                    </ListItem>
                                )}

                                {certificateGallery.map((cert) => (
                                    <ListItem key={cert.id} divider>
                                        <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                                            {cert.type === 'application/pdf' ? (
                                                <PictureAsPdf color="error" />
                                            ) : cert.previewUrl ? (
                                                <Box
                                                    component="img"
                                                    src={cert.previewUrl}
                                                    alt={cert.name}
                                                    sx={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 1 }}
                                                />
                                            ) : (
                                                <ImageIcon color="primary" />
                                            )}
                                        </Box>
                                        <ListItemText
                                            primary={cert.name}
                                            secondary={`Uploaded ${dayjs(cert.uploadedAt).format('D MMM YYYY h:mm A')} • ${cert.sizeKb} KB`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Add Professional Experience
                            </Typography>
                            <Stack spacing={2}>
                                <TextField
                                    required
                                    label="Job Title"
                                    name="jobTitle"
                                    value={experienceForm.jobTitle}
                                    onChange={onExperienceInputChange}
                                />
                                <TextField
                                    required
                                    label="Organization / Company"
                                    name="organization"
                                    value={experienceForm.organization}
                                    onChange={onExperienceInputChange}
                                />
                                <TextField
                                    required
                                    label="Start Date"
                                    type="date"
                                    name="startDate"
                                    value={experienceForm.startDate}
                                    onChange={onExperienceInputChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    required
                                    label="End Date"
                                    type="date"
                                    name="endDate"
                                    value={experienceForm.endDate}
                                    onChange={onExperienceInputChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    required
                                    multiline
                                    minRows={3}
                                    label="Description"
                                    name="description"
                                    value={experienceForm.description}
                                    onChange={onExperienceInputChange}
                                />
                                <Button variant="contained" onClick={addExperience}>
                                    Add Experience
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Experience Timeline (Chronological)
                            </Typography>

                            <List>
                                {sortedTimeline.length === 0 && (
                                    <ListItem>
                                        <ListItemText
                                            primary="No experience entries yet."
                                            secondary="Submitted entries are formatted and sorted automatically."
                                        />
                                    </ListItem>
                                )}

                                {sortedTimeline.map((entry) => (
                                    <ListItem key={entry.id} alignItems="flex-start" divider>
                                        <Box sx={{ mr: 2, mt: 0.5 }}>
                                            <WorkHistory color="primary" />
                                        </Box>
                                        <ListItemText
                                            primary={`${entry.jobTitle} • ${entry.organization}`}
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2" display="block">
                                                        {entry.formattedPeriod}
                                                    </Typography>
                                                    <Typography component="span" variant="body2" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                        {entry.description}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <ToastContainer />
        </Box>
    );
}

export default LecturerProfile;
