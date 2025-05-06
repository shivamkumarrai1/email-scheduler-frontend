import React, { useState, useCallback } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Background,
    Controls,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';
import { nodeTypes } from './flowConfig';

let id = 0;
const getId = () => `node_${id++}`;

const initialNodes = [{
    id: getId(),
    type: 'leadSource',
    position: { x: 50, y: 50 },
    data: {},
}, ];

function FlowApp() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState([]);
    const [from, setFrom] = useState('');
    const [pass, setPass] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingNodeId, setEditingNodeId] = useState(null);
    const [templateFields, setTemplateFields] = useState({ to: '', from: '', subject: '', body: '' });
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [templateErrors, setTemplateErrors] = useState({ to: '', from: '' });
    const [attachments, setAttachments] = useState([]);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback((params) => {
        setEdges((eds) => addEdge(params, eds));
    }, []);

    const handleEditTemplate = (nodeId, nodeData) => {
        console.log('Template button clicked for node:', nodeId);
        setEditingNodeId(nodeId);
        setTemplateFields({
            to: nodeData.to || '',
            from: nodeData.from || '',
            subject: nodeData.subject || '',
            body: nodeData.body || ''
        });
        setModalOpen(true);
    };

    const handleTemplateEmailChange = (field, value) => {
        setTemplateFields(f => ({ ...f, [field]: value }));
        
        if (value === '') {
            setTemplateErrors(f => ({ ...f, [field]: '' }));
        } else if (!value.includes('@')) {
            setTemplateErrors(f => ({ ...f, [field]: 'Email must contain @' }));
        } else if (!value.endsWith('@gmail.com')) {
            setTemplateErrors(f => ({ ...f, [field]: 'Must be a Gmail address' }));
        } else {
            setTemplateErrors(f => ({ ...f, [field]: '' }));
        }
    };

    const handleTemplateSave = () => {
        if (templateErrors.to || templateErrors.from) {
            return;
        }
        setNodes(nds =>
            nds.map(n =>
                n.id === editingNodeId
                    ? { ...n, data: { ...n.data, ...templateFields } }
                    : n
            )
        );
        setShowSaveSuccess(true);
        setTimeout(() => {
            setShowSaveSuccess(false);
        setModalOpen(false);
        }, 1500);
    };

    const handleDeleteNode = (nodeId) => {
        setNodes(nds => nds.filter(n => n.id !== nodeId));
        setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    };

    // Enhance nodes to inject onEditTemplate and onDelete for coldEmail nodes, and onDelete for all nodes
    const nodesWithHandlers = nodes.map(node => {
        const handlers = { ...node.data, onDelete: () => handleDeleteNode(node.id) };
        if (node.type === 'coldEmail') {
            handlers.onEditTemplate = () => handleEditTemplate(node.id, node.data);
        }
        return { ...node, data: handlers };
    });

    const addNode = (type) => {
        const newId = getId();
        let position = { x: 100, y: 100 };
        if (nodes.length > 0) {
            const lastNode = nodes[nodes.length - 1];
            position = {
                x: lastNode.position.x + 60,
                y: lastNode.position.y + 60
            };
        }
        const defaultData = {
            to: '',
            from: '',
            subject: '',
            body: '',
            delay: '',
            onChange: (key, value) => {
                setNodes((nds) =>
                    nds.map((n) =>
                        n.id === newId ? { ...n, data: { ...n.data, [key]: value } } : n
                    )
                );
            },
            onEditTemplate: () => handleEditTemplate(newId, defaultData)
        };
        const newNode = {
            id: newId,
            type,
            position,
            data: defaultData,
        };
        setNodes((nds) => [...nds, newNode]);
    };

    const isValidGmail = (email) => {
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        return gmailRegex.test(email);
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setFrom(value);
        
        if (value === '') {
            setEmailError('');
        } else if (!value.includes('@')) {
            setEmailError('Email must contain @');
        } else if (!value.endsWith('@gmail.com')) {
            setEmailError('Must be a Gmail address');
        } else {
            setEmailError('');
        }
    };

    const handleSubmit = async () => {
        const emailNode = nodes.find((n) => n.type === 'coldEmail');
        const waitNode = nodes.find((n) => n.type === 'wait');

        if (!emailNode || !waitNode) {
            alert('Add both ColdEmail and Wait nodes');
            return;
        }

        const { to, subject, body, from: nodeFrom } = emailNode.data;
        
        // Validate Gmail addresses before submitting
        if (!isValidGmail(nodeFrom || from)) {
            alert('Please enter a valid Gmail address for the sender');
            return;
        }
        if (!isValidGmail(to)) {
            alert('Please enter a valid Gmail address for the recipient');
            return;
        }

        const delayMinutes = parseInt(waitNode.data.delay || '0', 10);
        const sendAt = new Date(Date.now() + delayMinutes * 60000);

        await axios.post('https://email-scheduler-backend.onrender.com/api/email/schedule', {
            from: nodeFrom || from,
            pass,
            to,
            subject,
            body
        });

        alert('Email scheduled!');
    };

    const handleAttachmentClick = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        
        fileInput.onchange = (e) => {
            const files = Array.from(e.target.files);
            setAttachments(prev => [...prev, ...files]);
        };
        
        fileInput.click();
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0 10px 0' }}>
                <div>
                    <span style={{ color: '#888', fontSize: 18 }}>Click on a block to configure and add it in sequence.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 28,
                            color: '#d32f2f',
                            marginRight: 16
                        }}
                        onClick={() => {
                            setNodes([]);
                            setEdges([]);
                        }}
                        title="Delete All"
                    >
                        🗑️
                    </button>
                    <button
                        style={{
                            background: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            padding: '10px 24px',
                            fontWeight: 600,
                            fontSize: 16,
                            cursor: 'pointer'
                        }}
                        onClick={handleSubmit}
                    >
                        <span role="img" aria-label="send">✈️</span> Save & Schedule
                    </button>
                </div>
            </div>
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'inline-block', position: 'relative' }}>
                <input
                    type="email"
                        placeholder="Your Gmail Address"
                    value={from}
                        onChange={handleEmailChange}
                        style={{ 
                            marginRight: 8, 
                            padding: 8, 
                            borderRadius: 4, 
                            border: emailError ? '1px solid #f44336' : '1px solid #ccc',
                            width: '250px'
                        }}
                    />
                    {emailError && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            color: '#f44336',
                            fontSize: '12px',
                            marginTop: '4px'
                        }}>
                            {emailError}
                        </div>
                    )}
                </div>
                <input
                    type="password"
                    placeholder="Your App Password"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    style={{ marginRight: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                />
                <button onClick={() => addNode('coldEmail')} style={{ marginRight: 8 }}>Add Cold Email</button>
                <button onClick={() => addNode('wait')} style={{ marginRight: 8 }}>Add Wait</button>
                <button onClick={() => addNode('leadSource')} style={{ marginRight: 8 }}>Add Lead Source</button>
            </div>
            <div style={{
                background: '#f5f5f5',
                borderRadius: 8,
                padding: 24,
                marginTop: 20,
                height: '70vh',
                minHeight: 400,
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={nodesWithHandlers}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Background />
                        <Controls />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>
            {modalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ 
                        background: 'white', 
                        padding: 24, 
                        borderRadius: 8, 
                        minWidth: 320,
                        position: 'relative'
                    }}>
                        <h3>Edit Email Template</h3>
                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <input
                                placeholder="To (Gmail only)"
                            value={templateFields.to}
                                onChange={e => handleTemplateEmailChange('to', e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: 8,
                                    borderRadius: 4,
                                    border: templateErrors.to ? '1px solid #f44336' : '1px solid #ccc'
                                }}
                            />
                            {templateErrors.to && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    color: '#f44336',
                                    fontSize: '12px',
                                    marginTop: '4px'
                                }}>
                                    {templateErrors.to}
                                </div>
                            )}
                        </div>
                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <input
                                placeholder="From (Gmail only)"
                            value={templateFields.from}
                                onChange={e => handleTemplateEmailChange('from', e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: 8,
                                    borderRadius: 4,
                                    border: templateErrors.from ? '1px solid #f44336' : '1px solid #ccc'
                                }}
                            />
                            {templateErrors.from && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    color: '#f44336',
                                    fontSize: '12px',
                                    marginTop: '4px'
                                }}>
                                    {templateErrors.from}
                                </div>
                            )}
                        </div>
                        <input
                            placeholder="Subject"
                            value={templateFields.subject}
                            onChange={e => setTemplateFields(f => ({ ...f, subject: e.target.value }))}
                            style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                        />
                        <textarea
                            placeholder="Body"
                            value={templateFields.body}
                            onChange={e => setTemplateFields(f => ({ ...f, body: e.target.value }))}
                            style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                        />
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginTop: '16px'
                        }}>
                            <div>
                                <button 
                                    onClick={handleAttachmentClick}
                                    style={{
                                        background: '#2196F3',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span>📎</span>
                                    Attachments
                                </button>
                                {attachments.length > 0 && (
                                    <div style={{ 
                                        marginTop: '8px',
                                        fontSize: '12px',
                                        color: '#666'
                                    }}>
                                        {attachments.length} file(s) selected
                                    </div>
                                )}
                            </div>
                            <div>
                                <button 
                                    onClick={handleTemplateSave} 
                                    style={{ 
                                        marginRight: 8,
                                        background: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        opacity: (templateErrors.to || templateErrors.from) ? 0.5 : 1
                                    }}
                                    disabled={!!(templateErrors.to || templateErrors.from)}
                                >
                                    Save
                                </button>
                                <button 
                                    onClick={() => setModalOpen(false)}
                                    style={{
                                        background: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: 4,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                        {showSaveSuccess && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                background: 'rgba(76, 175, 80, 0.9)',
                                color: 'white',
                                padding: '16px 24px',
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                animation: 'fadeInOut 1.5s ease-in-out'
                            }}>
                                <span style={{ fontSize: '24px' }}>✓</span>
                                <span>Template Saved!</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <style>
                {`
                    @keyframes fadeInOut {
                        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    }
                `}
            </style>
        </div>
    );
}

export default FlowApp;