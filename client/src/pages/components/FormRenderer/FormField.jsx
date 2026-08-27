import React, { useState } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  Paper,
  IconButton,
  Button
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ClearIcon from '@mui/icons-material/Clear';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

function FormField({ field, value, onChange, onBlur, error, helperText, disabled }) {
  const [fileName, setFileName] = useState(null);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Optional: Validate file size (e.g., 5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      setFileName(file.name);
      onChange({
        target: {
          name: field.id,
          value: file
        }
      });
    }
  };

  const handleFileClear = () => {
    setFileName(null);
    onChange({
      target: {
        name: field.id,
        value: null
      }
    });
  };

  // Determine if field is required for the label
  const label = (
    <span>
      {field.label}
      {field.required && <span style={{ color: '#dc2626', marginLeft: 4 }}>*</span>}
    </span>
  );

  // Render based on field type
  switch (field.type) {
    case 'textarea':
      return (
        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={6}
          label={label}
          name={field.id}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          helperText={helperText || field.helpText}
          disabled={disabled}
          placeholder={field.helpText || ''}
          size="small"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      );

    case 'select':
      // Parse options from helpText (e.g., "Foundation, Intermediate, Advanced")
      const options = field.helpText
        ? field.helpText.split(',').map((opt) => opt.trim())
        : ['Option 1', 'Option 2', 'Option 3'];

      return (
        <FormControl fullWidth error={error} disabled={disabled} size="small">
          <InputLabel>{field.label}</InputLabel>
          <Select
            name={field.id}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            label={field.label}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="" disabled>
              <em>Select an option</em>
            </MenuItem>
            {options.map((opt, idx) => (
              <MenuItem key={idx} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
          {(helperText || field.helpText) && (
            <FormHelperText>{helperText || field.helpText}</FormHelperText>
          )}
        </FormControl>
      );

    case 'file':
      return (
        <Box>
          {!fileName ? (
            <Paper
              elevation={0}
              sx={{
                border: '2px dashed #cbd5e1',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                backgroundColor: '#fafafa',
                '&:hover': { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
                transition: 'all 0.2s'
              }}
            >
              <input
                accept=".pdf,.doc,.docx,.jpg,.png"
                style={{ display: 'none' }}
                id={`file-upload-${field.id}`}
                type="file"
                onChange={handleFileChange}
                disabled={disabled}
              />
              <label htmlFor={`file-upload-${field.id}`}>
                <Button component="span" variant="outlined" startIcon={<UploadFileIcon />}>
                  Choose File
                </Button>
              </label>
              <Typography variant="caption" display="block" sx={{ mt: 1, color: '#64748b' }}>
                {field.helpText || 'Upload your file (PDF, DOC, or image)'}
              </Typography>
              {error && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                  {helperText}
                </Typography>
              )}
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InsertDriveFileIcon sx={{ color: '#2563eb' }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {fileName}
                </Typography>
              </Box>
              <IconButton size="small" onClick={handleFileClear} disabled={disabled}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </Paper>
          )}
          {!error && field.helpText && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {field.helpText}
            </Typography>
          )}
        </Box>
      );

    case 'number':
      return (
        <TextField
          fullWidth
          type="number"
          label={label}
          name={field.id}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          helperText={helperText || field.helpText}
          disabled={disabled}
          placeholder={field.helpText || ''}
          size="small"
          inputProps={{ step: 'any', min: 0 }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      );

    case 'email':
      return (
        <TextField
          fullWidth
          type="email"
          label={label}
          name={field.id}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          helperText={helperText || field.helpText}
          disabled={disabled}
          placeholder={field.helpText || ''}
          size="small"
          autoComplete="email"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      );

    default: // 'text'
      return (
        <TextField
          fullWidth
          type="text"
          label={label}
          name={field.id}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          helperText={helperText || field.helpText}
          disabled={disabled}
          placeholder={field.helpText || ''}
          size="small"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      );
  }
}

export default FormField;