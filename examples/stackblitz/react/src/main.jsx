import React from 'react';
import { createRoot } from 'react-dom/client';
import { defineSwitch } from 'motionary/components/widgets';
import { App } from './App.jsx';

defineSwitch();
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
