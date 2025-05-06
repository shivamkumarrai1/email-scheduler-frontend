import React from 'react';
import { Handle } from '@xyflow/react';

const LeadSourceNode = () => {
    return (
        <div style={{ padding: 10, border: '1px solid green', borderRadius: 8, background: '#e8f5e9' }}>
            <strong>Lead Source</strong>
            <p style={{ fontSize: 12 }}>Start of the flow</p>
            <Handle type="source" position="bottom" />
        </div>
    );
};

export default LeadSourceNode;