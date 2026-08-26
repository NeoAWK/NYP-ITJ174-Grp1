import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  FormControlLabel,
  Checkbox,
  Chip
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../../../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import the field type renderer
import FormField from './FormField';

// Helper: Build Yup validation schema dynamically from the form definition
const buildValidationSchema = (sections) => {
  const shape = {};

  sections.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.required) {
        switch (field.type) {
          case 'email':
            shape[field.id] = yup.string().email('Invalid email address').required(`${field.label} is required`);
            break;
          case 'number':
            shape[field.id] = yup.number().typeError('Must be a number').required(`${field.label} is required`);
            break;
          case 'select':
            shape[field.id] = yup.string().required('Please select an option');
            break;
          case 'file':
            shape[field.id] = yup.mixed().required('Please upload a file');
            break;
          default:
            shape[field.id] = yup.string().trim().required(`${field.label} is required`);
        }
      } else {
        switch (field.type) {
          case 'email':
            shape[field.id] = yup.string().email('Invalid email address').nullable();
            break;
          case 'number':
            shape[field.id] = yup.number().typeError('Must be a number').nullable();
            break;
          default:
            shape[field.id] = yup.string().nullable();
        }
      }
    });
  });

  return yup.object(shape);
};

// Helper: Build initial values from form definition
const buildInitialValues = (sections) => {
  const values = {};
  sections.forEach((section) => {
    section.fields.forEach((field) => {
      values[field.id] = field.type === 'file' ? null : '';
    });
  });
  return values;
};

function FormRenderer({ 
  formId, 
  formSlug,        // NEW: slug for public URLs
  schema,          // Direct schema prop (for preview mode)
  readOnly = false, 
  hideSubmit = false, 
  onSuccess, 
  onError, 
  submitButtonText = 'Submit' 
}) {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [formDefinition, setFormDefinition] = useState(schema || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine the endpoint: slug takes priority over ID
  const getEndpoint = () => {
    if (formSlug) return `/forms/slug/${formSlug}`;
    if (formId) {
      // If formId is a string and contains non-numeric characters, treat as slug
      const isSlug = typeof formId === 'string' && !/^\d+$/.test(formId);
      return isSlug ? `/forms/slug/${formId}` : `/forms/${formId}`;
    }
    return null;
  };

  // Fetch form definition on mount
  useEffect(() => {
    // If schema is provided directly, skip fetch
    if (schema) {
      setFormDefinition(schema);
      setLoading(false);
      return;
    }

    const endpoint = getEndpoint();
    if (!endpoint) {
      setFetchError('No form ID or slug provided.');
      setLoading(false);
      return;
    }

    const loadForm = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const response = await http.get(endpoint);
        const data = response.data;
        setFormDefinition(data.schema);
      } catch (err) {
        console.error('Failed to load form:', err);
        setFetchError(err.response?.data?.error || 'Could not load the form. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [formId, formSlug, schema]);

  // Build validation schema and initial values once form definition is loaded
  const validationSchema = formDefinition
    ? buildValidationSchema(formDefinition.sections)
    : null;
  const initialValues = formDefinition
    ? buildInitialValues(formDefinition.sections)
    : {};

  // Formik setup
  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
  onSubmit: async (values, { setSubmitting }) => {
  if (readOnly || hideSubmit) return;
  setIsSubmitting(true);
  try {
    const formData = new FormData();
    // Append form slug
    formData.append('formSlug', formSlug || formId);

    // Append each field value
    Object.keys(values).forEach(key => {
      const val = values[key];
      if (val instanceof File) {
        // Append file
        formData.append(key, val, val.name);
      } else if (val !== null && val !== undefined) {
        // Append text
        formData.append(key, val);
      }
    });

    // Determine endpoint – now we use the new submit endpoint
    const endpoint = `/submit-form/${formSlug || formId}`;
    await http.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    toast.success('Form submitted successfully!');
    if (onSuccess) onSuccess(values);
  } catch (err) {
    console.error('Submission error:', err);
    toast.error(err.response?.data?.error || 'Failed to submit form.');
    if (onError) onError(err);
  } finally {
    setIsSubmitting(false);
    setSubmitting(false);
  }
    }
  });

  // --- Loading State ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading form...</Typography>
      </Box>
    );
  }

  // --- Error State ---
  if (fetchError) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">
          {fetchError}
          <Button size="small" sx={{ ml: 2 }} onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  // --- No Form Data ---
  if (!formDefinition || !formDefinition.sections || formDefinition.sections.length === 0) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="warning">This form has no sections or fields defined.</Alert>
      </Box>
    );
  }

  // --- Render the Form ---
  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
      {/* Form Header */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          backgroundColor: '#ffffff'
        }}
      >
        <Typography variant="h5" fontWeight="700" color="#0f172a" sx={{ mb: 1 }}>
          {formDefinition.title || 'Application Form'}
        </Typography>
        {formDefinition.instructions && (
          <Typography variant="body2" color="text.secondary">
            {formDefinition.instructions}
          </Typography>
        )}
      </Paper>

      {/* Form Sections */}
      <Stack spacing={4}>
        {formDefinition.sections.map((section) => (
          <Paper
            key={section.id}
            elevation={0}
            sx={{
              p: 4,
              border: '1px solid #e2e8f0',
              borderRadius: 3,
              backgroundColor: '#ffffff'
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="700"
              color="#1e293b"
              sx={{
                mb: 3,
                pb: 1,
                borderBottom: '2px solid #2563eb',
                display: 'inline-block'
              }}
            >
              {section.title}
            </Typography>

            <Grid container spacing={3}>
              {section.fields.map((field) => (
                <Grid
                  item
                  xs={12}
                  sm={field.type === 'textarea' ? 12 : 6}
                  key={field.id}
                >
                  <FormField
                    field={field}
                    value={formik.values[field.id] || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched[field.id] && Boolean(formik.errors[field.id])}
                    helperText={formik.touched[field.id] && formik.errors[field.id]}
                    disabled={isSubmitting || readOnly}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        ))}
      </Stack>

      {/* Submit Section - Hidden if hideSubmit is true */}
      {!hideSubmit && (
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            p: 3,
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            backgroundColor: '#f8fafc'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="reset"
              variant="outlined"
              onClick={() => formik.resetForm()}
              disabled={isSubmitting || readOnly}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !formik.isValid || readOnly}
              sx={{
                textTransform: 'none',
                px: 4,
                borderRadius: 2,
                fontWeight: 700,
                backgroundColor: '#2563eb'
              }}
            >
              {isSubmitting ? 'Submitting...' : submitButtonText}
            </Button>
          </Box>
        </Paper>
      )}

      <ToastContainer />
    </Box>
  );
}

export default FormRenderer;