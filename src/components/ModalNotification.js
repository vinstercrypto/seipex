// src/components/ModalNotification.js

import React from 'react';
import Modal from 'react-modal';

const ModalNotification = ({ modalIsOpen, closeModal, modalMessage }) => (
    <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Notification"
        className="modalContent"
        overlayClassName="modalOverlay"
    >
        <h2>Notification</h2>
        <p>{modalMessage}</p>
        <button onClick={closeModal}>Close</button>
    </Modal>
);

export default ModalNotification;
