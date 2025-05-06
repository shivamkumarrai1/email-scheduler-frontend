import React from 'react';
import { Handle } from '@xyflow/react';

const WaitNode = ({ data }) => {
    return (
        <div style={{ padding: 10, border: '1px solid #999', borderRadius: 8, background: '#fff8e1' }}>
            <strong>Wait</strong>
            <input
                type="number"
                placeholder="Delay (mins)"
                value={data.delay || ''}
                onChange={e => data.onChange('delay', e.target.value)}
                style={{ width: '100%', marginTop: 5 }}
            />
            <Handle type="target" position="top" />
            <Handle type="source" position="bottom" />
        </div>
    );
};

export default WaitNode;