import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import http from '../http';

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await http.get('/admin/logs');
      setLogs(response.data);
      setLoading(false);
    } catch (err) {
      setError('Unable to fetch audit history from SQLite database.');
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('APPROVED')) return 'success';
    if (action.includes('REJECTED')) return 'error';
    if (action.includes('UPDATED')) return 'warning';
    return 'info';
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(filterText.toLowerCase()) ||
      log.targetEntity.toLowerCase().includes(filterText.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="800" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon color="primary" /> Admin Action History Log
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Audit logs stored in SQLite tracking administrative updates, course approvals, and rejections.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, p: 2, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by action, course/target, or admin email..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Timestamp</strong></TableCell>
                <TableCell><strong>Admin User</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
                <TableCell><strong>Target Entity</strong></TableCell>
                <TableCell><strong>Details</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No administrative actions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>#{log.id}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{log.adminEmail}</TableCell>
                    <TableCell>
                      <Chip label={log.action} size="small" color={getActionColor(log.action)} sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{log.targetEntity}</TableCell>
                    <TableCell>{log.details || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}