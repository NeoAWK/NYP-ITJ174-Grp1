import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Avatar
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';

function OfficerNotifications({ notifications = [] }) {
  const [selectedNotif, setSelectedNotif] = useState(notifications[0] || null);

  return (
    <Box sx={{ flexGrow: 1, pb: 4 }}>
      <Typography variant="h5" fontWeight="700" sx={{ mb: 3, color: '#0f172a' }}>
        Inbox
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '380px 1fr' }, gap: 3 }}>
        
        {/* Messages Sidebar */}
        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
            <Typography variant="subtitle2" fontWeight="700" color="#64748b">
              ALL MESSAGES ({notifications.length})
            </Typography>
          </Box>

          <List disablePadding sx={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
            {notifications.map((item, idx) => {
              const isSelected = selectedNotif?.id === item.id;
              const isRejection = item.type === 'Rejection Sent';

              return (
                <React.Fragment key={item.id}>
                  <ListItem
                    onClick={() => setSelectedNotif(item)}
                    sx={{
                      px: 2,
                      py: 2,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#eff6ff' : item.unread ? '#f8fafc' : '#ffffff',
                      borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent',
                      '&:hover': { backgroundColor: '#f1f5f9' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 44 }}>
                      <Avatar sx={{ backgroundColor: isRejection ? '#fee2e2' : '#e0e7ff', color: isRejection ? '#dc2626' : '#4338ca', width: 36, height: 36 }}>
                        {isRejection ? <MarkEmailReadOutlinedIcon sx={{ fontSize: 18 }} /> : <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />}
                      </Avatar>
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Chip 
                            label={item.type} 
                            size="small" 
                            color={isRejection ? "error" : "primary"} 
                            variant="outlined" 
                            sx={{ height: 20, fontSize: 10, fontWeight: 700 }} 
                          />
                          <Typography variant="caption" color="#64748b">
                            {item.time}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" fontWeight="600" color="#0f172a" noWrap>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" color="#64748b">
                            {item.provider}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {idx < notifications.length - 1 && <Divider component="li" sx={{ borderColor: '#f1f5f9' }} />}
                </React.Fragment>
              );
            })}
          </List>
        </Paper>

        {/* Message Content View */}
        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 3 }}>
          {selectedNotif ? (
            <Box>
              <Box sx={{ borderBottom: '1px solid #f1f5f9', pb: 2, mb: 3 }}>
                <Chip 
                  label={selectedNotif.type} 
                  color={selectedNotif.type === 'Rejection Sent' ? 'error' : 'primary'} 
                  size="small" 
                  sx={{ mb: 1, fontWeight: 700 }} 
                />
                <Typography variant="h6" fontWeight="700" color="#0f172a">
                  {selectedNotif.subject || selectedNotif.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  To/From: <strong>{selectedNotif.provider}</strong> · {selectedNotif.time}
                </Typography>
              </Box>

              {selectedNotif.body ? (
                <Box sx={{ backgroundColor: '#f8fafc', p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontFamily: 'monospace', color: '#334155' }}>
                    {selectedNotif.body}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="#334155">
                  New submission received for <strong>{selectedNotif.title}</strong> submitted by {selectedNotif.provider}.
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select a message to view details.
            </Typography>
          )}
        </Paper>

      </Box>
    </Box>
  );
}

export default OfficerNotifications;