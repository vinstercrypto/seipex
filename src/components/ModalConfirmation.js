// src/components/ModalConfirmation.js

import React from 'react';
import Modal from 'react-modal';

const ModalConfirmation = ({ modalIsOpen, closeModal, modalMessage, confirmAction }) => {
    return (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Confirmation Modal"
            ariaHideApp={false}
            className="modalContent"
            overlayClassName="modalOverlay"
        >
            <h2>Confirmation</h2>
            <div>{modalMessage}</div>
            <div className="modalActions">
                <button onClick={confirmAction}>Confirm</button>
                <button onClick={closeModal}>Cancel</button>
            </div>
        </Modal>
    );
};

export default ModalConfirmation;
