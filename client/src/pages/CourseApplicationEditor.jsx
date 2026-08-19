import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  IconButton,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Stack,
  Tabs,
  Tab,
  Grid
} from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ShortTextIcon from '@mui/icons-material/ShortText';
import NumbersIcon from '@mui/icons-material/Numbers';
import EmailIcon from '@mui/icons-material/Email';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import NotesIcon from '@mui/icons-material/Notes';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const initialPublishedForm = {
  title: 'RightSkills Course Accreditation Application Form',
  instructions: 'Please complete all required sections below to submit your course for accreditation by RightSkills Officers.',
  sections: [
    {
      id: 1,
      title: 'Section 1: Provider Details',
      fields: [
        { id: 'f1', label: 'Organization Name', type: 'text', required: true, helpText: 'Registered business name' },
        { id: 'f2', label: 'UEN / Registration Number', type: 'text', required: true, helpText: 'Unique Entity Number' },
        { id: 'f3', label: 'Primary Contact Email', type: 'email', required: true, helpText: 'Official correspondence email' },
      ]
    },
    {
      id: 2,
      title: 'Section 2: Course Information',
      fields: [
        { id: 'f4', label: 'Course Title', type: 'text', required: true, helpText: 'Full title as intended for certificate' },
        { id: 'f5', label: 'Target Skill Level', type: 'select', required: true, helpText: 'Foundation, Intermediate, Advanced' },
        { id: 'f6', label: 'Total Course Duration (Hours)', type: 'number', required: true, helpText: 'Minimum required 16 hours' },
        { id: 'f7', label: 'Course Syllabus & Outline', type: 'textarea', required: true, helpText: 'Attach or detail module breakdowns' },
      ]
    },
    {
      id: 3,
      title: 'Section 3: Trainer & Venue Qualifications',
      fields: [
        { id: 'f8', label: 'Lead Trainer Name', type: 'text', required: true, helpText: 'Primary instructor' },
        { id: 'f9', label: 'Trainer Certification Documents', type: 'file', required: false, helpText: 'Upload PDF certificates' },
      ]
    }
  ]
};

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text', icon: <ShortTextIcon fontSize="small" /> },
  { value: 'number', label: 'Number', icon: <NumbersIcon fontSize="small" /> },
  { value: 'email', label: 'Email Address', icon: <EmailIcon fontSize="small" /> },
  { value: 'select', label: 'Dropdown Select', icon: <ArrowDropDownCircleIcon fontSize="small" /> },
  { value: 'textarea', label: 'Long Text / Paragraph', icon: <NotesIcon fontSize="small" /> },
  { value: 'file', label: 'File Upload', icon: <UploadFileIcon fontSize="small" /> },
];

function CourseApplicationEditor() {
  const [publishedForm, setPublishedForm] = useState(initialPublishedForm);
  const [draftForm, setDraftForm] = useState(JSON.parse(JSON.stringify(initialPublishedForm)));
  
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const [publishSuccessAlert, setPublishSuccessAlert] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Statistics
  const totalSections = draftForm.sections.length;
  const totalFields = draftForm.sections.reduce((acc, sec) => acc + sec.fields.length, 0);

  // Header Handlers
  const handleHeaderChange = (field, value) => {
    setDraftForm((prev) => ({ ...prev, [field]: value }));
    setHasUnpublishedChanges(true);
  };

  // Section Handlers
  const handleSectionTitleChange = (sectionId, newTitle) => {
    setDraftForm((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => sec.id === sectionId ? { ...sec, title: newTitle } : sec)
    }));
    setHasUnpublishedChanges(true);
  };

  const handleAddSection = () => {
    const newSection = {
      id: Date.now(),
      title: `Section ${draftForm.sections.length + 1}: New Custom Section`,
      fields: []
    };
    setDraftForm((prev) => ({ ...prev, sections: [...prev.sections, newSection] }));
    setHasUnpublishedChanges(true);
  };

  const handleDeleteSection = (sectionId) => {
    setDraftForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((sec) => sec.id !== sectionId)
    }));
    setHasUnpublishedChanges(true);
  };

  // Field Handlers
  const handleFieldChange = (sectionId, fieldId, key, value) => {
    setDraftForm((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          fields: sec.fields.map((f) => f.id === fieldId ? { ...f, [key]: value } : f)
        };
      })
    }));
    setHasUnpublishedChanges(true);
  };

  const handleAddField = (sectionId) => {
    const newField = {
      id: `f_${Date.now()}`,
      label: 'New Form Field',
      type: 'text',
      required: false,
      helpText: ''
    };
    setDraftForm((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => sec.id === sectionId ? { ...sec, fields: [...sec.fields, newField] } : sec)
    }));
    setHasUnpublishedChanges(true);
  };

  const handleDeleteField = (sectionId, fieldId) => {
    setDraftForm((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => sec.id === sectionId ? { ...sec, fields: sec.fields.filter((f) => f.id !== fieldId) } : sec)
    }));
    setHasUnpublishedChanges(true);
  };

  // Actions
  const handlePublish = () => {
    setPublishedForm(JSON.parse(JSON.stringify(draftForm)));
    setHasUnpublishedChanges(false);
    setPublishSuccessAlert(true);
    setTimeout(() => setPublishSuccessAlert(false), 5000);
  };

  const handleDiscardChanges = () => {
    setDraftForm(JSON.parse(JSON.stringify(publishedForm)));
    setHasUnpublishedChanges(false);
  };

  return (
    <Box sx={{ pb: 8, flexGrow: 1, maxWidth: 1200, mx: 'auto' }}>
      
      {/* Header Bar */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', borderRadius: 3, backgroundColor: '#ffffff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h5" fontWeight="700" color="#0f172a">
                Application Form Manager
              </Typography>
              <Chip
                label={hasUnpublishedChanges ? 'Draft Modifications' : 'Live & Published'}
                color={hasUnpublishedChanges ? 'warning' : 'success'}
                size="small"
                sx={{ fontWeight: 700, borderRadius: 1.5 }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Design and manage the accreditation form provided to Training Providers.
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1.5}>
            {hasUnpublishedChanges && (
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<RestartAltIcon />}
                onClick={handleDiscardChanges}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, borderColor: '#cbd5e1' }}
              >
                Discard Draft
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<PublishIcon />}
              onClick={handlePublish}
              disabled={!hasUnpublishedChanges}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
                boxShadow: hasUnpublishedChanges ? '0 4px 12px rgba(37,99,235,0.2)' : 'none',
                backgroundColor: hasUnpublishedChanges ? '#2563eb' : undefined
              }}
            >
              Publish Form
            </Button>
          </Stack>
        </Box>

        {/* Form Quick Metrics */}
        <Grid container spacing={2} sx={{ mt: 2, pt: 2, borderTop: '1px solid #f1f5f9' }}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="#64748b" fontWeight="600">TOTAL SECTIONS</Typography>
            <Typography variant="h6" fontWeight="700" color="#0f172a">{totalSections}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="#64748b" fontWeight="600">TOTAL FIELDS</Typography>
            <Typography variant="h6" fontWeight="700" color="#0f172a">{totalFields}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="#64748b" fontWeight="600">REQUIRED FIELDS</Typography>
            <Typography variant="h6" fontWeight="700" color="#2563eb">
              {draftForm.sections.reduce((acc, sec) => acc + sec.fields.filter(f => f.required).length, 0)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="#64748b" fontWeight="600">STATUS</Typography>
            <Typography variant="h6" fontWeight="700" color={hasUnpublishedChanges ? '#d97706' : '#16a34a'}>
              {hasUnpublishedChanges ? 'Unpublished Draft' : 'Up to Date'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Success Banner */}
      {publishSuccessAlert && (
        <Alert 
          icon={<CheckCircleOutlineIcon fontSize="inherit" />} 
          severity="success" 
          sx={{ mb: 3, borderRadius: 2, border: '1px solid #bbf7d0' }}
        >
          Form template successfully published! Training Providers will now see the updated layout when submitting courses.
        </Alert>
      )}

      {/* Navigation Tabs (Builder vs Live Preview) */}
      <Paper elevation={0} sx={{ mb: 3, border: '1px solid #e2e8f0', borderRadius: 2, backgroundColor: '#ffffff' }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ px: 2, minHeight: 48 }}
        >
          <Tab 
            icon={<BuildOutlinedIcon sx={{ fontSize: 18 }} />} 
            iconPosition="start" 
            label="Form Builder" 
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: 14 }} 
          />
          <Tab 
            icon={<VisibilityOutlinedIcon sx={{ fontSize: 18 }} />} 
            iconPosition="start" 
            label="Live Published Preview" 
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: 14 }} 
          />
        </Tabs>
      </Paper>

      {/* TAB 0: FORM BUILDER */}
      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* General Settings Card */}
          <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, p: 3, backgroundColor: '#ffffff' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <ArticleOutlinedIcon sx={{ color: '#2563eb' }} />
              <Typography variant="subtitle1" fontWeight="700" color="#0f172a">
                Form Header Settings
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Form Title"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={draftForm.title}
                  onChange={(e) => handleHeaderChange('title', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Instructions for Applicants"
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  value={draftForm.instructions}
                  onChange={(e) => handleHeaderChange('instructions', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Form Sections */}
          {draftForm.sections.map((section, sIndex) => (
            <Paper 
              key={section.id} 
              elevation={0} 
              sx={{ border: '1px solid #cbd5e1', borderRadius: 3, overflow: 'hidden', backgroundColor: '#ffffff' }}
            >
              {/* Section Header */}
              <Box sx={{ p: 2.5, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1, mr: 2 }}>
                  <DragIndicatorIcon sx={{ color: '#94a3b8', cursor: 'grab' }} />
                  <TextField
                    variant="standard"
                    fullWidth
                    value={section.title}
                    onChange={(e) => handleSectionTitleChange(section.id, e.target.value)}
                    InputProps={{
                      disableUnderline: true,
                      sx: { fontSize: 16, fontWeight: 700, color: '#0f172a' }
                    }}
                  />
                </Box>
                
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={`${section.fields.length} Fields`} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: 11 }} />
                  <Tooltip title="Delete Section">
                    <IconButton size="small" color="error" onClick={() => handleDeleteSection(section.id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              {/* Section Field Cards */}
              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {section.fields.map((field, fIndex) => (
                  <Card 
                    key={field.id} 
                    elevation={0} 
                    sx={{ border: '1px solid #e2e8f0', borderRadius: 2, '&:hover': { borderColor: '#93c5fd', backgroundColor: '#fafafa' }, transition: 'all 0.2s' }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <TextField
                            size="small"
                            fullWidth
                            label={`Field #${fIndex + 1} Label`}
                            value={field.label}
                            onChange={(e) => handleFieldChange(section.id, field.id, 'label', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Input Type</InputLabel>
                            <Select
                              value={field.type}
                              label="Input Type"
                              onChange={(e) => handleFieldChange(section.id, field.id, 'type', e.target.value)}
                              sx={{ borderRadius: 1.5 }}
                            >
                              {FIELD_TYPES.map((ft) => (
                                <MenuItem key={ft.value} value={ft.value}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {ft.icon}
                                    <Typography variant="body2">{ft.label}</Typography>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Help Text / Placeholder"
                            value={field.helpText}
                            onChange={(e) => handleFieldChange(section.id, field.id, 'helpText', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                size="small"
                                checked={field.required}
                                onChange={(e) => handleFieldChange(section.id, field.id, 'required', e.target.checked)}
                              />
                            }
                            label={<Typography variant="caption" fontWeight="600">Req</Typography>}
                          />
                          <IconButton size="small" color="error" onClick={() => handleDeleteField(section.id, field.id)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  variant="dashed"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => handleAddField(section.id)}
                  sx={{
                    border: '1px dashed #cbd5e1',
                    borderRadius: 2,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#475569',
                    '&:hover': { borderColor: '#2563eb', backgroundColor: '#eff6ff', color: '#2563eb' }
                  }}
                >
                  Add Field to {section.title.split(':')[0]}
                </Button>
              </Box>
            </Paper>
          ))}

          {/* Add New Section Button */}
          <Button
            variant="outlined"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleAddSection}
            sx={{
              py: 1.5,
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 15,
              borderWidth: 2,
              '&:hover': { borderWidth: 2 }
            }}
          >
            Add New Form Section
          </Button>

        </Box>
      )}

      {/* TAB 1: LIVE PUBLISHED PREVIEW */}
      {activeTab === 1 && (
        <Paper elevation={0} sx={{ border: '1px solid #cbd5e1', borderRadius: 3, p: 4, backgroundColor: '#ffffff' }}>
          <Box sx={{ borderBottom: '2px solid #2563eb', pb: 2, mb: 4 }}>
            <Typography variant="h5" fontWeight="700" color="#0f172a" sx={{ mb: 1 }}>
              {publishedForm.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {publishedForm.instructions}
            </Typography>
          </Box>

          <Stack spacing={4}>
            {publishedForm.sections.map((sec) => (
              <Box key={sec.id}>
                <Typography variant="subtitle1" fontWeight="700" color="#1e293b" sx={{ mb: 2, pb: 0.5, borderBottom: '1px solid #f1f5f9' }}>
                  {sec.title}
                </Typography>

                <Grid container spacing={2.5}>
                  {sec.fields.map((field) => (
                    <Grid item xs={12} sm={field.type === 'textarea' ? 12 : 6} key={field.id}>
                      <Typography variant="caption" fontWeight="600" color="#334155" sx={{ mb: 0.5, display: 'block' }}>
                        {field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}
                      </Typography>

                      {field.type === 'textarea' ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          placeholder={field.helpText || 'Enter details...'}
                          disabled
                          size="small"
                        />
                      ) : field.type === 'select' ? (
                        <TextField
                          fullWidth
                          select
                          defaultValue=""
                          disabled
                          size="small"
                          SelectProps={{ displayEmpty: true }}
                        >
                          <MenuItem value="" disabled>
                            <em>{field.helpText || 'Select option'}</em>
                          </MenuItem>
                        </TextField>
                      ) : field.type === 'file' ? (
                        <Paper elevation={0} sx={{ border: '1px dashed #cbd5e1', p: 2, textAlign: 'center', backgroundColor: '#f8fafc' }}>
                          <UploadFileIcon sx={{ color: '#94a3b8', mb: 0.5 }} />
                          <Typography variant="caption" display="block" color="text.secondary">
                            {field.helpText || 'Click or drag files here to upload'}
                          </Typography>
                        </Paper>
                      ) : (
                        <TextField
                          fullWidth
                          type={field.type}
                          placeholder={field.helpText}
                          disabled
                          size="small"
                        />
                      )}
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="contained" disabled sx={{ textTransform: 'none', px: 4 }}>
              Submit Course Application (Preview Mode)
            </Button>
          </Box>
        </Paper>
      )}

    </Box>
  );
}

export default CourseApplicationEditor;