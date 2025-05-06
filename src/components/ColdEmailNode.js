import React from 'react';
import { Handle } from '@xyflow/react';

const ColdEmailNode = ({ data }) => {
    return (
        <div style={{ padding: 10, border: '1px solid #0077cc', borderRadius: 8, background: '#e6f2ff' }}>
            <strong>Cold Email</strong>
            <div style={{ height: 20 }} />
            <button
                style={{
                    margin: '16px 0 8px 0',
                    padding: '4px 12px',
                    borderRadius: 4,
                    background: '#1976d2',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                }}
                onClick={data.onEditTemplate}
            >
                Template
            </button>
            <Handle type="target" position="top" />
            <Handle type="source" position="bottom" />
        </div>
    );
};

export default ColdEmailNode;