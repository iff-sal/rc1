import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/index.css'; // Tailwind CSS
import 'react-datepicker/dist/react-datepicker.css'; // Datepicker styles

import Modal from 'react-modal'; // Import react-modal

Modal.setAppElement('#root'); // Set the root element for accessibility

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
