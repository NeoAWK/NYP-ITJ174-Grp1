import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography, Paper, Alert } from '@mui/material';
import FormRenderer from './components/FormRenderer/FormRenderer';

function ApplyFormPage() {
  const { slug } = useParams();

  if (!slug) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">No form slug provided.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <FormRenderer formSlug={slug} />
      </Paper>
    </Container>
  );
}

export default ApplyFormPage;