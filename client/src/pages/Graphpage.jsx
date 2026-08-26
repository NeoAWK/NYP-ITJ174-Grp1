import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3001';

// ----- Nicer colour palette -----
const STATUS_COLORS = {
  // Provider
  Active: '#4CAF50',       // green
  Inactive: '#F44336',     // red
  // Trainer
  Valid: '#2196F3',        // blue
  Expired: '#FF9800',      // orange
  // Course
  Approved: '#8BC34A',     // light green
  Rejected: '#E91E63',     // pink
  'Pending Review': '#FFC107', // amber
  // Fallback
  Unknown: '#9E9E9E',
  Pending: '#FFC107',
};

const getStatusColor = (status) => {
  if (!status) return STATUS_COLORS.Unknown;
  const key = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  return STATUS_COLORS[key] || STATUS_COLORS.Unknown;
};

// ----- Determine node color -----
const getNodeColor = (node) => {
  if (node.type === 'provider') {
    const status = node.data.accreditationStatus || 'Unknown';
    return getStatusColor(status);
  }
  if (node.type === 'trainer') {
    const validity = node.data.certificationValidity;
    if (validity) {
      const expiry = new Date(validity);
      const now = new Date();
      return expiry > now ? getStatusColor('Valid') : getStatusColor('Expired');
    }
    return getStatusColor('Unknown');
  }
  if (node.type === 'course') {
    const status = node.data.status || 'Pending Review';
    return getStatusColor(status);
  }
  return STATUS_COLORS.Unknown;
};

// ----- Custom Nodes (with nicer styling) -----
const ProviderNode = ({ data }) => {
  const color = data.color || '#1976d2';
  return (
    <div style={{ padding: 10, background: '#e3f2fd', borderRadius: 8, border: `2px solid ${color}`, minWidth: 120, textAlign: 'center' }}>
      <Handle type="source" position={Position.Bottom} />
      <BusinessIcon sx={{ color, fontSize: 28 }} />
      <Typography variant="subtitle2" fontWeight="700">{data.label}</Typography>
      {data.count && <Chip size="small" label={`${data.count} trainers`} sx={{ mt: 0.5 }} />}
      {data.accreditationStatus && (
        <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
          {data.accreditationStatus}
        </Typography>
      )}
    </div>
  );
};

const TrainerNode = ({ data }) => {
  const color = data.color || '#388e3c';
  return (
    <div style={{ padding: 10, background: '#e8f5e9', borderRadius: 8, border: `2px solid ${color}`, minWidth: 120, textAlign: 'center' }}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <PersonIcon sx={{ color, fontSize: 28 }} />
      <Typography variant="subtitle2" fontWeight="700">{data.label}</Typography>
      <Typography variant="caption" display="block" color="text.secondary">{data.email || ''}</Typography>
      {data.certificationValidity && (
        <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
          Valid until {new Date(data.certificationValidity).toLocaleDateString()}
        </Typography>
      )}
    </div>
  );
};

const CourseNode = ({ data }) => {
  const color = data.color || '#f57c00';
  return (
    <div style={{ padding: 10, background: '#fff3e0', borderRadius: 8, border: `2px solid ${color}`, minWidth: 140, textAlign: 'center' }}>
      <Handle type="target" position={Position.Top} />
      <MenuBookIcon sx={{ color, fontSize: 28 }} />
      <Typography variant="subtitle2" fontWeight="700">{data.label}</Typography>
      <Chip size="small" label={data.status || 'Pending'} sx={{ mt: 0.5, backgroundColor: color, color: '#fff' }} />
    </div>
  );
};

const nodeTypes = {
  provider: ProviderNode,
  trainer: TrainerNode,
  course: CourseNode,
};

// ----- Layout helper (unchanged) -----
const layoutGraph = (nodes, edges, rootId = null) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: 'TB',
    nodesep: 60,
    ranksep: 80,
    ranker: 'tight-tree',
  });

  let distances = {};
  if (rootId) {
    const adj = {};
    nodes.forEach((n) => (adj[n.id] = []));
    edges.forEach((e) => {
      adj[e.source]?.push(e.target);
      adj[e.target]?.push(e.source);
    });
    const queue = [rootId];
    distances[rootId] = 0;
    const visited = new Set([rootId]);
    while (queue.length) {
      const u = queue.shift();
      (adj[u] || []).forEach((v) => {
        if (!visited.has(v)) {
          visited.add(v);
          distances[v] = distances[u] + 1;
          queue.push(v);
        }
      });
    }
    nodes.forEach((n) => {
      if (!(n.id in distances)) distances[n.id] = 999;
    });
  }

  nodes.forEach((node) => {
    const rank = rootId ? distances[node.id] : undefined;
    dagreGraph.setNode(node.id, {
      width: 150,
      height: 80,
      rank,
    });
  });

  edges.forEach((edge) => {
    if (dagreGraph.hasNode(edge.source) && dagreGraph.hasNode(edge.target)) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const pos = dagreGraph.node(node.id);
    if (!pos) {
      console.warn(`Node ${node.id} has no layout position, using default (0,0).`);
      return { ...node, position: { x: 0, y: 0 } };
    }
    return {
      ...node,
      position: {
        x: pos.x - 75,
        y: pos.y - 40,
      },
    };
  });
};

// ----- Main Graph Page -----
function GraphPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [baseNodes, setBaseNodes] = useState([]);
  const [baseEdges, setBaseEdges] = useState([]);
  const [fullNodes, setFullNodes] = useState([]);
  const [fullEdges, setFullEdges] = useState([]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [rootId, setRootId] = useState(null);

  // Apply layout
  const applyLayout = useCallback(() => {
    if (baseNodes.length === 0) return;
    const layouted = layoutGraph(baseNodes, baseEdges, rootId);
    setFullNodes(layouted);
    setFullEdges(baseEdges);
  }, [baseNodes, baseEdges, rootId]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: token ? `Bearer ${token}` : '' };

      const trainersRes = await fetch(`${API_BASE_URL}/trainers`, { headers });
      if (!trainersRes.ok) throw new Error('Failed to fetch trainers');
      const trainers = await trainersRes.json();

      const coursesRes = await fetch(`${API_BASE_URL}/courses`, { headers });
      if (!coursesRes.ok) throw new Error('Failed to fetch courses');
      const courses = await coursesRes.json();

      const nodeMap = {};
      const edgeList = [];

      // Group trainers by provider
      const providerMap = {};
      trainers.forEach((t) => {
        const trainerIdValue = t.trainerId ?? t.userId ?? t.id;
        if (!trainerIdValue) {
          console.warn('Trainer missing any ID, skipping:', t);
          return;
        }
        const trainerId = `trainer-${trainerIdValue}`;
        const providerName = t.providerName || 'Freelance';
        if (!providerMap[providerName]) providerMap[providerName] = [];
        providerMap[providerName].push({ ...t, _trainerId: trainerId });
      });

      // Provider nodes
      Object.entries(providerMap).forEach(([providerName, trainerList]) => {
        const providerId = `provider-${providerName.replace(/\s/g, '-')}`;
        nodeMap[providerId] = {
          id: providerId,
          type: 'provider',
          data: {
            label: providerName,
            count: trainerList.length,
            accreditationStatus: 'Active', // placeholder
          },
        };
        trainerList.forEach((trainer) => {
          const trainerId = trainer._trainerId;
          if (!nodeMap[trainerId]) {
            nodeMap[trainerId] = {
              id: trainerId,
              type: 'trainer',
              data: {
                label: trainer.name || 'Unknown',
                email: trainer.email || '',
                certificationValidity: trainer.certificationValidity || null,
              },
            };
          }
          edgeList.push({
            id: `${providerId}-${trainerId}`,
            source: providerId,
            target: trainerId,
          });
        });
      });

      // Course nodes – enforce "one trainer per course" (deduplicate)
      const courseTrainerMap = {}; // courseId -> trainerId (first encountered)
      courses.forEach((course) => {
        const courseId = `course-${course.id || course.CourseID}`;
        if (!nodeMap[courseId]) {
          const status = course.status || course.SubmissionStatus || 'Pending Review';
          nodeMap[courseId] = {
            id: courseId,
            type: 'course',
            data: {
              label: course.title || course.CourseTitle || 'Untitled',
              status: status === 'Pending' ? 'Pending Review' : status,
            },
          };
        }
        if (course.TrainerId) {
          const trainerId = `trainer-${course.TrainerId}`;
          if (nodeMap[trainerId]) {
            if (!courseTrainerMap[courseId]) {
              courseTrainerMap[courseId] = trainerId;
              edgeList.push({
                id: `${trainerId}-${courseId}`,
                source: trainerId,
                target: courseId,
              });
            } else {
              console.warn(`Course ${courseId} already has a trainer, skipping extra trainer ${trainerId}`);
            }
          } else {
            console.warn(`Trainer ${course.TrainerId} not found for course ${courseId}`);
          }
        }
      });

      // Assign colors
      const nodeArray = Object.values(nodeMap).map((node) => {
        const color = getNodeColor(node);
        return { ...node, data: { ...node.data, color } };
      });

      const validEdgeList = edgeList.filter(
        (edge) => nodeMap[edge.source] && nodeMap[edge.target]
      );

      setBaseNodes(nodeArray);
      setBaseEdges(validEdgeList);
    } catch (err) {
      console.error('Graph data fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Re‑layout when base data or root changes
  useEffect(() => {
    applyLayout();
  }, [applyLayout]);

  // Search filtering
  useEffect(() => {
    if (fullNodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    if (!searchTerm.trim()) {
      setNodes(fullNodes);
      setEdges(fullEdges);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const matchedIds = fullNodes
      .filter((n) => {
        const label = n.data.label?.toLowerCase() || '';
        const email = n.data.email?.toLowerCase() || '';
        return label.includes(term) || email.includes(term);
      })
      .map((n) => n.id);

    const connectedIds = new Set(matchedIds);
    fullEdges.forEach((e) => {
      if (matchedIds.includes(e.source)) connectedIds.add(e.target);
      if (matchedIds.includes(e.target)) connectedIds.add(e.source);
    });
    // second level


    const filteredNodes = fullNodes.filter((n) => connectedIds.has(n.id));
    const filteredEdges = fullEdges.filter(
      (e) => connectedIds.has(e.source) && connectedIds.has(e.target)
    );

    setNodes(filteredNodes);
    setEdges(filteredEdges);
  }, [searchTerm, fullNodes, fullEdges]);

  // ----- Connection validation (enforce one trainer per course) -----
  const onConnect = useCallback(
    (params) => {
      // Check if target is a course and already has an incoming edge from a trainer
      const targetNode = fullNodes.find((n) => n.id === params.target);
      if (targetNode && targetNode.type === 'course') {
        // Count existing incoming edges to this course from any trainer
        const existingIncoming = fullEdges.filter(
          (e) => e.target === params.target && e.source.startsWith('trainer-')
        );
        if (existingIncoming.length > 0) {
          alert('This course already has a trainer. Each course can have only one trainer.');
          return;
        }
      }
      // Also prevent connecting anything else (e.g., course -> something) if needed
      // We'll just allow any connection that passes the course rule.
      setEdges((eds) => addEdge(params, eds));
    },
    [fullNodes, fullEdges, setEdges]
  );

  // Allow edge deletion
  const onEdgesDelete = useCallback((deletedEdges) => {
    // We can let user delete any edge
    // Optionally add confirmation or restrict
  }, []);

  const onNodeClick = useCallback((event, node) => {
    setRootId(node.id);
  }, []);

  const resetFocus = useCallback(() => {
    setRootId(null);
  }, []);

  // ---- Render ----
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">Failed to load graph: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', justifyContent: 'center' }}>
      <Box sx={{ width: '95%', maxWidth: 1400, height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
        {/* Compact AppBar without title */}
        <AppBar position="static" color="default" elevation={1} sx={{ borderBottom: '1px solid #e2e8f0', borderRadius: 1 }}>
          <Toolbar variant="dense" sx={{ gap: 1, flexWrap: 'wrap', minHeight: 40, px: 1.5 }}>
            <IconButton edge="start" onClick={() => navigate('/officer-dashboard')} color="inherit" size="small">
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            {rootId && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<CenterFocusStrongIcon />}
                onClick={resetFocus}
                sx={{ mr: 1 }}
              >
                Reset View
              </Button>
            )}
            <TextField
              size="small"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 220 } }}
            />
            <Chip label={`${nodes.length} nodes`} size="small" color="primary" />
            <Chip label="Drag to rearrange" size="small" variant="outlined" />
          </Toolbar>
        </AppBar>

        {/* Graph container – fills remaining height */}
        <Box sx={{ flex: 1, position: 'relative', mt: 1, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgesDelete={onEdgesDelete}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            style={{ background: '#f5f7fa' }}
            nodesDraggable={true}
            edgesReconnectable={true}
            elementsSelectable={true}
          >
            <Background gap={16} color="#cbd5e1" />
            <Controls />
            <MiniMap
              nodeColor={(n) => n.data.color || '#757575'}
            />
          </ReactFlow>

          {/* Legend – updated with nicer colors */}
          <Paper
            elevation={2}
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              zIndex: 10,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Typography variant="caption" display="block" fontWeight="700">Legend</Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BusinessIcon sx={{ color: STATUS_COLORS.Active, fontSize: 16 }} />
                <Typography variant="caption">Provider (Active)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BusinessIcon sx={{ color: STATUS_COLORS.Inactive, fontSize: 16 }} />
                <Typography variant="caption">Provider (Inactive)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon sx={{ color: STATUS_COLORS.Valid, fontSize: 16 }} />
                <Typography variant="caption">Trainer (Certified)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon sx={{ color: STATUS_COLORS.Expired, fontSize: 16 }} />
                <Typography variant="caption">Trainer (Expired)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <MenuBookIcon sx={{ color: STATUS_COLORS.Approved, fontSize: 16 }} />
                <Typography variant="caption">Course (Approved)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <MenuBookIcon sx={{ color: STATUS_COLORS.Rejected, fontSize: 16 }} />
                <Typography variant="caption">Course (Rejected)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <MenuBookIcon sx={{ color: STATUS_COLORS['Pending Review'], fontSize: 16 }} />
                <Typography variant="caption">Course (Pending)</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default GraphPage;