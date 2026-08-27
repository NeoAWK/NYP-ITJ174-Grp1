import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Select,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DeleteOutline, PictureAsPdf, Image as ImageIcon, WorkHistory } from '@mui/icons-material';
import dayjs from 'dayjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from '../http';
import UserContext from '../contexts/UserContext';

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_CERTIFICATE_SIZE_MB = 5;

function TrainerProfile() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [profileDetails, setProfileDetails] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState('');
    const [certificateFile, setCertificateFile] = useState(null);
    const [certificatePreview, setCertificatePreview] = useState(null);
    const [certificateGallery, setCertificateGallery] = useState([]);
    const [experienceForm, setExperienceForm] = useState({
        fieldOfExpertise: '',
        customFieldOfExpertise: '',
        jobTitle: '',
        organization: '',
        startDate: '',
        endDate: '',
        description: ''
    });
    const [experienceTimeline, setExperienceTimeline] = useState([]);

    useEffect(() => {
        if (!user) {
            setLoadingProfile(false);
            return;
        }

        if (user.usertype !== 'Trainer') {
            setLoadingProfile(false);
            return;
        }

        http.get('/user/ecosystem-profile')
            .then((response) => {
                const details = response.data.details || {};
                let savedEntries = [];
                try {
                    savedEntries = details.experienceEntries ? JSON.parse(details.experienceEntries) : [];
                } catch {
                    savedEntries = [];
                }
                let savedCertificates = [];
                try {
                    savedCertificates = details.certificateFiles ? JSON.parse(details.certificateFiles) : [];
                } catch {
                    savedCertificates = [];
                }
                if (savedCertificates.length === 0 && details.certificateFile) {
                    savedCertificates = [{
                        filename: details.certificateFile,
                        name: details.certificateFile,
                        type: details.certificateFile.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/*',
                        uploadedAt: null
                    }];
                }
                setProfileDetails(details);
                setExperienceTimeline(savedEntries);
                setCertificateGallery(savedCertificates.map((certificate) => ({
                    id: certificate.filename,
                    name: certificate.name || certificate.filename,
                    type: certificate.type || 'application/octet-stream',
                    uploadedAt: certificate.uploadedAt,
                    validityDate: certificate.validityDate || (
                        certificate.uploadedAt
                            ? dayjs(certificate.uploadedAt).add(3, 'year').format('YYYY-MM-DD')
                            : null
                    ),
                    previewUrl: certificate.type?.startsWith('image/')
                        ? `${import.meta.env.VITE_FILE_BASE_URL}${certificate.filename}`
                        : null
                })));
            })
            .catch(() => setProfileError('Unable to load the trainer profile.'))
            .finally(() => setLoadingProfile(false));
    }, [user]);

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
        setCertificatePreview({
            name: file.name,
            type: file.type,
            url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        });
    };

    const saveCertificate = async () => {
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

        try {
            const formData = new FormData();
            formData.append('file', certificateFile);
            const uploadResponse = await http.post('/file/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const newCertificate = {
                filename: uploadResponse.data.filename,
                name: certificateFile.name,
                type: certificateFile.type,
                uploadedAt: new Date().toISOString(),
                validityDate: dayjs().add(3, 'year').format('YYYY-MM-DD')
            };
            let savedCertificates = [];
            try {
                savedCertificates = profileDetails?.certificateFiles ? JSON.parse(profileDetails.certificateFiles) : [];
            } catch {
                savedCertificates = [];
            }
            if (savedCertificates.length === 0 && profileDetails?.certificateFile) {
                savedCertificates = [{
                    filename: profileDetails.certificateFile,
                    name: profileDetails.certificateFile,
                    type: 'application/octet-stream',
                    uploadedAt: null
                }];
            }
            savedCertificates = [...savedCertificates, newCertificate];
            await http.put('/user/ecosystem-profile', {
                certificateFile: uploadResponse.data.filename,
                certificateFiles: JSON.stringify(savedCertificates)
            });
            const isImage = certificateFile.type.startsWith('image/');
            setCertificateGallery((previous) => [...previous, {
                id: uploadResponse.data.filename,
                name: certificateFile.name,
                type: certificateFile.type,
                sizeKb: Math.round(certificateFile.size / 1024),
                uploadedAt: new Date().toISOString(),
                validityDate: newCertificate.validityDate,
                previewUrl: isImage ? `${import.meta.env.VITE_FILE_BASE_URL}${uploadResponse.data.filename}` : null
            }]);
            setProfileDetails((prev) => ({
                ...prev,
                certificateFile: uploadResponse.data.filename,
                certificateFiles: JSON.stringify(savedCertificates)
            }));
            setCertificateFile(null);
            setCertificatePreview(null);
            toast.success('Certificate uploaded and saved successfully.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Certificate upload failed.');
        }
    };

    const deleteCertificate = async (certificate) => {
        try {
            const savedCertificates = certificateGallery
                .filter((item) => item.id !== certificate.id)
                .map((item) => ({
                    filename: item.id,
                    name: item.name,
                    type: item.type,
                    uploadedAt: item.uploadedAt,
                    validityDate: item.validityDate
                }));

            await http.delete(`/file/upload/${encodeURIComponent(certificate.id)}`);
            await http.put('/user/ecosystem-profile', {
                certificateFile: savedCertificates.at(-1)?.filename || null,
                certificateFiles: savedCertificates.length ? JSON.stringify(savedCertificates) : null
            });

            setCertificateGallery((previous) => previous.filter((item) => item.id !== certificate.id));
            setProfileDetails((previous) => ({
                ...previous,
                certificateFile: savedCertificates.at(-1)?.filename || null,
                certificateFiles: savedCertificates.length ? JSON.stringify(savedCertificates) : null
            }));
            toast.success('Certificate deleted successfully.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Certificate could not be deleted.');
        }
    };

    const deleteExperience = async (entryId) => {
        const nextTimeline = experienceTimeline.filter((entry) => entry.id !== entryId);
        try {
            await http.put('/user/ecosystem-profile', {
                experienceEntries: nextTimeline.length ? JSON.stringify(nextTimeline) : null,
                experience: nextTimeline.length
                    ? nextTimeline.map((entry) => `${entry.fieldOfExpertise || 'Other'} - ${entry.jobTitle} at ${entry.organization}: ${entry.description}`).join('\n')
                    : null
            });
            setExperienceTimeline(nextTimeline);
            setProfileDetails((previous) => ({
                ...previous,
                experienceEntries: nextTimeline.length ? JSON.stringify(nextTimeline) : null,
                experience: nextTimeline.length
                    ? nextTimeline.map((entry) => `${entry.fieldOfExpertise || 'Other'} - ${entry.jobTitle} at ${entry.organization}: ${entry.description}`).join('\n')
                    : null
            }));
            toast.success('Experience entry deleted successfully.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Experience entry could not be deleted.');
        }
    };

    const onExperienceInputChange = (event) => {
        const { name, value } = event.target;
        setExperienceForm((prev) => ({ ...prev, [name]: value }));
    };

    const addExperience = async () => {
        const { fieldOfExpertise, customFieldOfExpertise, jobTitle, organization, startDate, endDate, description } = experienceForm;
        const resolvedFieldOfExpertise = fieldOfExpertise === 'Other'
            ? customFieldOfExpertise.trim()
            : fieldOfExpertise;

        if (!resolvedFieldOfExpertise || !jobTitle || !organization || !startDate || !endDate || !description) {
            toast.error('Please fill in all required experience fields.');
            return;
        }

        if (dayjs(endDate).isBefore(dayjs(startDate), 'day')) {
            toast.error('End Date cannot be earlier than Start Date.');
            return;
        }

        const formattedPeriod = `${dayjs(startDate).format('MMM YYYY')} - ${dayjs(endDate).format('MMM YYYY')}`;

        const nextTimeline = [
            {
                id: `${resolvedFieldOfExpertise}-${jobTitle}-${organization}-${Date.now()}`,
                ...experienceForm,
                fieldOfExpertise: resolvedFieldOfExpertise,
                formattedPeriod
            },
            ...experienceTimeline
        ];

        try {
            await http.put('/user/ecosystem-profile', {
                experienceEntries: JSON.stringify(nextTimeline),
                experience: nextTimeline.map((entry) => `${entry.fieldOfExpertise || 'Other'} - ${entry.jobTitle} at ${entry.organization}: ${entry.description}`).join('\n')
            });
            setExperienceTimeline(nextTimeline);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Professional experience could not be saved.');
            return;
        }

        setExperienceForm({
            fieldOfExpertise: '',
            customFieldOfExpertise: '',
            jobTitle: '',
            organization: '',
            startDate: '',
            endDate: '',
            description: ''
        });

        toast.success('Professional experience saved to the timeline.');
    };

    if (!user) {
        return (
            <Box sx={{ mt: 5 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Please log in with a trainer account to access this profile.
                </Alert>
                <Button variant="contained" onClick={() => navigate('/login')}>
                    Go to Login
                </Button>
            </Box>
        );
    }

    if (user.usertype !== 'Trainer') {
        return (
            <Box sx={{ mt: 5 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    This page is available to trainer accounts only.
                </Alert>
                <Button variant="contained" onClick={() => navigate('/')}>
                    Back to Homepage
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Trainer Profile
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
                Review your complete trainer profile or update your profile materials.
            </Typography>

            <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ mb: 3 }}>
                <Tab label="Profile Overview" />
                <Tab label="Trainer Experience" />
            </Tabs>

            {activeTab === 0 && (
                <Box>
                    {loadingProfile && <Typography color="text.secondary">Loading trainer profile...</Typography>}
                    {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}
                    {!loadingProfile && !profileError && (
                        <Box>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="overline" color="text.secondary">Trainer</Typography>
                                        <Avatar
                                            src={user.profilePicture ? `${import.meta.env.VITE_FILE_BASE_URL}${user.profilePicture}` : undefined}
                                            alt={user.name}
                                            sx={{ width: 96, height: 96, my: 1.5 }}
                                        >
                                            {user.name?.charAt(0)?.toUpperCase()}
                                        </Avatar>
                                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{user.name}</Typography>
                                        <Typography color="text.secondary" sx={{ mb: 2 }}>{user.email}</Typography>
                                        <Typography variant="body2">Phone: {user.mobileNo || profileDetails?.mobileNo || 'Not provided'}</Typography>
                                        <Typography variant="body2">Profile status: {profileDetails?.qualifications ? 'Complete' : 'In progress'}</Typography>
                                        <Typography variant="body2" sx={{ mt: 1 }}>Certification valid until: {profileDetails?.certificationValidity || 'Not provided'}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Professional Summary</Typography>
                                        <Stack spacing={2}>
                                            <Box><Typography variant="subtitle2">Qualifications</Typography><Typography color="text.secondary">{profileDetails?.qualifications || 'Not provided'}</Typography></Box>
                                            <Box><Typography variant="subtitle2">Certification</Typography><Typography color="text.secondary">{profileDetails?.certification || 'Not provided'}</Typography></Box>
                                            <Box>
                                                <Typography variant="subtitle2">Experience</Typography>
                                                {experienceTimeline.length > 0 ? (
                                                    <Stack spacing={1} sx={{ mt: 0.5 }}>
                                                        {experienceTimeline.map((entry) => (
                                                            <Box key={entry.id} sx={{ pl: 1.5, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                                                                <Typography color="text.secondary">
                                                                    {entry.fieldOfExpertise || 'Other'} - {entry.jobTitle} at {entry.organization}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {entry.description}
                                                                </Typography>
                                                            </Box>
                                                        ))}
                                                    </Stack>
                                                ) : (
                                                    <Typography color="text.secondary">{profileDetails?.experience || 'Not provided'}</Typography>
                                                )}
                                            </Box>
                                            <Box><Typography variant="subtitle2">Professional Development</Typography><Typography color="text.secondary">{profileDetails?.professionalDevelopment || 'Not provided'}</Typography></Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        <Card sx={{ mt: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Certificates</Typography>
                                {certificateGallery.length === 0 ? (
                                    <Typography color="text.secondary">No certificates uploaded.</Typography>
                                ) : (
                                    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
                                        {certificateGallery.map((certificate) => (
                                            <Box key={certificate.id} sx={{ minWidth: 220, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                                                <Box sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                                                    {certificate.previewUrl ? (
                                                        <Box component="img" src={certificate.previewUrl} alt={certificate.name} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                    ) : (
                                                        <PictureAsPdf color="error" sx={{ fontSize: 48 }} />
                                                    )}
                                                </Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{certificate.name}</Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Valid until: {certificate.validityDate || 'Date unavailable'}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                        </Box>
                    )}
                </Box>
            )}

            {activeTab === 1 && (
                <>
            <Alert severity="info" sx={{ mb: 3 }}>
                Certificate uploads and experience entries are currently kept in this page session.
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

                                {certificatePreview && (
                                    <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                                        <Typography variant="subtitle2" gutterBottom>Certificate Preview</Typography>
                                        {certificatePreview.url ? (
                                            <Box
                                                component="img"
                                                src={certificatePreview.url}
                                                alt={`Preview of ${certificatePreview.name}`}
                                                sx={{ display: 'block', maxWidth: '100%', maxHeight: 240, mx: 'auto', objectFit: 'contain', borderRadius: 1 }}
                                            />
                                        ) : (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <PictureAsPdf color="error" />
                                                <Typography variant="body2">PDF selected: {certificatePreview.name}</Typography>
                                            </Stack>
                                        )}
                                    </Box>
                                )}

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
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2" display="block">
                                                        Uploaded: {cert.uploadedAt ? dayjs(cert.uploadedAt).format('D MMM YYYY') : 'Date unavailable'}
                                                    </Typography>
                                                    <Typography component="span" variant="body2" color="text.secondary" display="block">
                                                        Valid until: {cert.validityDate || 'Date unavailable'}
                                                        {cert.sizeKb ? ` • ${cert.sizeKb} KB` : ''}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                        <IconButton
                                            color="error"
                                            size="small"
                                            aria-label={`Delete ${cert.name || 'certificate'}`}
                                            onClick={() => deleteCertificate(cert)}
                                        >
                                            <DeleteOutline />
                                        </IconButton>
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
                                <FormControl fullWidth required>
                                    <InputLabel id="field-of-expertise-label">Field of Expertise</InputLabel>
                                    <Select
                                        labelId="field-of-expertise-label"
                                        label="Field of Expertise"
                                        name="fieldOfExpertise"
                                        value={experienceForm.fieldOfExpertise}
                                        onChange={onExperienceInputChange}
                                    >
                                        <MenuItem value="Technical Skills">Technical Skills</MenuItem>
                                        <MenuItem value="Digital Skills">Digital Skills</MenuItem>
                                        <MenuItem value="Workplace Skills">Workplace Skills</MenuItem>
                                        <MenuItem value="Leadership and Management">Leadership and Management</MenuItem>
                                        <MenuItem value="Health and Safety">Health and Safety</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                                {experienceForm.fieldOfExpertise === 'Other' && (
                                    <TextField
                                        required
                                        label="Custom Field of Expertise"
                                        name="customFieldOfExpertise"
                                        value={experienceForm.customFieldOfExpertise}
                                        onChange={onExperienceInputChange}
                                    />
                                )}
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
                                Professional Experience
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {sortedTimeline.length === 0 && (
                                    <Box sx={{ minWidth: '100%' }}>
                                        <ListItemText
                                            primary="No experience entries yet."
                                            secondary="Saved experience will appear here in resume format."
                                        />
                                    </Box>
                                )}

                                {sortedTimeline.map((entry) => (
                                    <Box
                                        key={entry.id}
                                        sx={{
                                            width: '100%',
                                            borderLeft: '3px solid',
                                            borderColor: 'primary.main',
                                            pl: 2,
                                            pr: 1
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <WorkHistory color="primary" />
                                            <IconButton
                                                color="error"
                                                size="small"
                                                aria-label={`Delete ${entry.jobTitle || 'experience'} experience`}
                                                onClick={() => deleteExperience(entry.id)}
                                            >
                                                <DeleteOutline />
                                            </IconButton>
                                        </Box>
                                        <Typography variant="overline" color="primary.main">
                                            {entry.fieldOfExpertise || 'Other'}
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                            {entry.jobTitle}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {entry.organization}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                            {entry.formattedPeriod}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            {entry.description}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <ToastContainer />
                </>
            )}
        </Box>
    );
}

export default TrainerProfile;
